import { supabase } from '@/lib/supabaseClient';
import type { CitaEstado, CitaClienteRow } from '@/lib/citasApi';
import { brand } from '../../config/brand';

export type CitaAdminListRow = CitaClienteRow & {
  full_name: string;
  phone: string;
  creado_por_admin?: boolean;
  nota_admin?: string | null;
};

export type ClienteOpcion = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
};

function parseEstado(raw: unknown): CitaEstado {
  if (
    raw === 'confirmado' ||
    raw === 'pendiente' ||
    raw === 'realizado' ||
    raw === 'cancelado'
  ) {
    return raw;
  }
  return 'pendiente';
}

export async function fetchCitasPorFechaAdmin(
  fechaYmd: string
): Promise<{ rows: CitaAdminListRow[]; error: string | null }> {
  const { data: citas, error } = await supabase
    .from('citas')
    .select('id, cliente_id, servicio, fecha, hora, estado, creado_por_admin, nota_admin')
    .eq('fecha', fechaYmd)
    .order('hora', { ascending: true });

  if (error) {
    return {
      rows: [],
      error: error.message.includes('row-level security')
        ? 'Sin permiso para ver la agenda. Ejecutá la migración 006 y verificá is_portal_admin() + VITE_ADMIN_EMAILS.'
        : error.message,
    };
  }

  const rawList = (citas ?? []) as CitaClienteRow[];
  const ids = [...new Set(rawList.map((c) => c.cliente_id))];

  const nombrePorCliente = new Map<string, { full_name: string; phone: string }>();
  if (ids.length > 0) {
    const { data: perfiles, error: pe } = await supabase
      .from('perfiles_clientes')
      .select('id, full_name, phone')
      .in('id', ids);

    if (pe) {
      return { s: [], error: pe.message };
    }

    for (const p of perfiles ?? []) {
      const id = (p as { id: string }).id;
      nombrePorCliente.set(id, {
        full_name:
          String((p as { full_name?: string }).full_name ?? '').trim() ||
          brand.clientFallbackName,
        phone: String((p as { phone?: string }).phone ?? '').trim(),
      });
    }
  }

  const rows: CitaAdminListRow[] = rawList.map((c) => {
    const perf = nombrePorCliente.get(c.cliente_id);
    const extra = c as unknown as { creado_por_admin?: boolean; nota_admin?: string | null };
    return {
      id: c.id,
      cliente_id: c.cliente_id,
      servicio: c.servicio,
      fecha: c.fecha,
      hora: c.hora,
      estado: parseEstado(c.estado),
      full_name: perf?.full_name ?? brand.clientFallbackName,
      phone: perf?.phone ?? '',
      creado_por_admin: !!extra.creado_por_admin,
      nota_admin: extra.nota_admin ?? null,
    };
  });

  return { rows, error: null };
}

export async function fetchSolicitudesPendientesAdmin(): Promise<{
  rows: CitaAdminListRow[];
  error: string | null;
}> {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  const ymd = `${y}-${m}-${d}`;

  const { data: citas, error } = await supabase
    .from('citas')
    .select('id, cliente_id, servicio, fecha, hora, estado, creado_por_admin, nota_admin')
    .eq('estado', 'pendiente')
    .eq('creado_por_admin', false)
    .gte('fecha', ymd)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true });

  if (error) {
    return {
      rows: [],
      error: error.message.includes('row-level security')
        ? 'Sin permiso para ver solicitudes. Verificá la migración 006/016 y is_portal_admin().'
        : error.message.includes('column') && error.message.includes('creado_por_admin')
          ? 'Falta la migración 016 (creado_por_admin / nota_admin). Aplicala en Supabase para activar las solicitudes.'
       : error.message,
    };
  }

  const rawList = (citas ?? []) as CitaClienteRow[];
  const ids = [...new Set(rawList.map((c) => c.cliente_id))];

  const perfilPorId = new Map<string, { full_name: string; phone: string }>();
  if (ids.length > 0) {
    const { data: perfiles, error: pe } = await supabase
      .from('perfiles_clientes')
      .select('id, full_name, phone')
      .in('id', ids);

    if (pe) return { rows: [], error: pe.message };

    for (const p of perfiles ?? []) {
      const id = (p as { id: string }).id;
      perfilPorId.set(id, {
        full_name:
          String((p as { full_name?: string }).full_name ?? '').trim() ||
          brand.clientFallbackName,
        phone: String((p as { phone?: string }).phone ?? '').trim(),
      });
    }
  }

  const rows: CitaAdminListRow[] = rawList.map((c) => {
    const perf = perfilPorId.get(c.cliente_id);
    const extra = c as unknown as { creado_por_admin?: boolean; nota_admin?: string | null };
    return {
      id: c.id,
      cliente_id: c.cliente_id,
      servicio: c.servicio,
      fecha: c.fecha,
      hora: c.hora,
      estado: parseEstado(c.estado),
      full_name: perf?.full_name ?? brand.clientFallbackName,
      phone: perf?.phone ?? '',
      creado_por_admin: !!extra.creado_por_admin,
      nota_admin: extra.nota_admin ?? null,
    };
  });

  return { rows, error: null };
}

export async function buscarClientesActivos(
  termino: string,
  limit = 25
): Promise<{ rows: ClienteOpcion[]; error: string | null }> {
  let q = supabase
    .from('perfiles_clientes')
    .select('id, full_name, phone, email')
    .order('full_name', { ascending: true })
    .limit(limit);

  q = q.or('status.eq.active,is_approved.eq.true');

  const t = termino.trim();
  if (t.length >= 2) {
    const safe = t.replace(/[%_]/g, ' ');
    q = q.or(`full_name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };

  const rows: ClienteOpcion[] = (data ?? []).map((p) => {
    const r = p as { id: string; full_name?: string; phone?: string; email?: string };
    return {
      id: r.id,
      full_name: String(r.full_name ?? '').trim() || brand.clientFallbackName,
      phone: String(r.phone ?? '').trim(),
      email: String(r.email ?? '').trim(),
    };
  });

  return { rows, error: null };
}

export async function crearCitaAdmin(input: {
  clienteId: string;
  servicio: string;
  fechaYmd: string;
  hora: string;
  estado?: CitaEstado;
  notaAdmin?: string | null;
}): Promise<{ cita: CitaClienteRow | null; error: string | null }> {
  const estado: CitaEstado = input.estado ?? 'confirmado';

  const { data, error } = await supabase
    .from('citas')
    .insert({
      cliente_id: input.clienteId,
      servicio: input.servicio,
      fecha: input.fechaYmd,
      hora: input.hora,
      estado,
      creado_por_admin: true,
      nota_admin: input.notaAdmin ?? null,
    })
    .select('id, cliente_id, servicio, fecha, hora, estado')
    .single();

  if (error) {
    const flat = `${error.code ?? ''}${error.message}`.toLowerCase();

    if (flat.includes('unique') || flat.includes('duplicate')) {
      return { cita: null, error: 'Ese horario ya está ocupado. Elegí otra hora.' };
    }
    if (flat.includes('row-level security')) {
      return {
        cita: null,
        error: 'Sin permiso para crear turnos como admin. Aplicá la migración 016 y verificá is_portal_admin().',
      };
    }
    if (flat.includes('column') && flat.includes('creado_por_admin')) {
      return {
        cita: null,
        error: 'Falta la migración 016 (creado_por_admin / nota_admin) en Supabase.',
      };
    }
    if (flat.includes('foreign key') && flat.includes('citas')) {
      return {
        cita: null,
        error: 'El cliente seleccionado es walk-in: aplicá la migración 017 para relajar la FK de citas.',
      };
    }
    return { cita: null, error: error.message };
  }

  return { cita: data as CitaClienteRow, error: null };
}

export async function crearClienteWalkin(input: {
  fullName: string;
  phone: string;
  email?: string;
  tratamientoInteres?: string;
}): Promise<{ cliente: ClienteOpcion | null; error: string | null }> {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const email = (input.email ?? '').trim();
  const interes = (input.tratamientoInteres ?? '').trim();

  if (!fullName) return { cliente: null, error: 'Ingresá el nombre del cliente.' };
  if (!phone) return { cliente: null, error: 'Ingresá un teléfono de contacto.' };

  const payload: Record<string, unknown> = {
    full_name: fullName,
    phone,
    status: 'active',
    is_app: true,
    is_walkin: true,
  };

  if (email) payload.email = email;
  if (interes) payload.tratamiento_interes = interes;

  const { data, error } = await supabase
    .from('perfiles_clientes')
    .insert(payload)
    .select('id, l_name, phone, email')
    .single();

  if (error) {
    const flat = `${error.code ?? ''}${error.message}`.toLowerCase();

    if (flat.includes('row-level security')) {
      return {
        cliente: null,
        error: 'Sin permiso para crear clientes. Verificá is_portal_admin() y la política portal_admin_manage_perfiles.',
      };
    }
    if (flat.includes('column') && flat.includes('is_walkin')) {
      return {
        cliente: null,
        error: 'Falta la migración 017 (is_walkin / clientes walk-in) en Supabase.',
      };
    }
    if (flat.includes('foreign key') && flat.includes('auth.users')) {
      return {
        cliente: null,
        error: 'La tabla aún exige FK a auth.users. Aplicá la migración 017 para permitir clientes walk-in.',
      };
    }
    if (flat.includes('column') && flat.includes('email')) {
      const retry = { ...payload };
      delete retry.email;
      const r = await supabase
        .from('perfiles_clientes')
        .insert(retry)
        .select('id,name, phone')
        .single();
      if (r.error) return { cliente: null, error: r.error.message };
      const p = r.data as { id: string; full_name?: string; phone?: string };
      return {
        cliente: {
          id: p.id,
          full_name: String(p.full_name ?? '').trim() || fullName,
          phone: String(p.phone ?? '').trim() || phone,
          email: '',
        },
        error: null,
      };
    }
    return { cliente: null, error: error.message };
  }

  const p = data as { id: string; full_name?: string; phone?: string; email?: string };
  return {
    cliente: {
      id: p.id,
      full_name: String(p.full_name ?? '').trim() || fullName,
      phone: String(p.phone ?? '').trim() || phone,
      email: String(p.email ?? '').trim() || email,
    },
    error: null,
  };
}

export async function actualizarEstadoCitaAdmin(
  citaId: string,
  estado: CitaEstado
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('citas').update({ estado }).eq('id', citaId);
  return { error: error?.message ?? null };
}

export async function eliminarCitaAdmin(citaId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('citas').delete().eq('id', citaId);
  return { error: error?.message ?? null };
}
