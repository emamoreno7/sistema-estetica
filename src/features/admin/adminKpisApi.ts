import { supabase } from '@/lib/supabaseClient';
import {
  PERFILES_CLIENTES_TABLE,
  PERFIL_CLIENTE_SELECT_COLUMNS,
  type PerfilClienteRow,
  type PerfilRowStatus,
} from '@/lib/perfilCliente';
import type { CitaEstado } from '@/lib/citasApi';
import { brand } from '../../config/brand';

export type AdminKpis = {
  clientesPendientes: number;
  clientesActivos: number;
  clientesBloqueados: number;
  clientesTotal: number;
  citasHoy: number;
  citasHoyConfirmadas: number;
  citasHoyPendientes: number;
  citas7Dias: number;
  serviciosActivos: number;
  serviciosTotal: number;
};

export type UltimaAltaRow = {
  id: string;
  full_name: string;
  phone: string;
  status: PerfilRowStatus;
  created_at: string | null;
};

export type ProximoTurnoRow = {
  id: string;
  cliente_id: string;
  full_name: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: CitaEstado;
};

function parseEstado(raw: unknown): CitaEstado {
  if (raw === 'confirmado' || raw === 'pendiente' || raw === 'realizado' || raw === 'cancelado') {
    return raw;
  }
  return 'pendiente';
}

function parseStatus(raw: unknown): PerfilRowStatus {
  if (raw === 'pending' || raw === 'active' || raw === 'blocked') return raw;
  return 'pending';
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function fetchAdminKpis(): Promise<{ kpis: AdminKpis | null; error: string | null }> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const en7 = new Date(hoy);
  en7.setDate(en7.getDate() + 7);

  const hoyYmd = ymd(hoy);
  const en7Ymd = ymd(en7);

  const [perfilesRes, citasHoyRes, citas7Res, serviciosRes] = await Promise.all([
    supabase.from(PERFILES_CLIENTES_TABLE).select('status'),
    supabase.from('citas').select('estado').eq('fecha', hoyYmd),
    supabase.from('citas').select('id').gte('fecha', hoyYmd).lte('fecha', en7Ymd),
    supabase.from('servicios').select('activo'),
  ]);

  const errors = [perfilesRes.error, citasHoyRes.error, citas7Res.error, serviciosRes.error]
    .filter(Boolean)
    .map((e) => e!.message);
  if (errors.length > 0) {
    const msg = errors.join(' · ');
    const hit = msg.toLowerCase().includes('row-level security')
      ? 'RLS: revisá que tu email/uid coincida con is_portal_admin() y migraciones 003/006/007.'
      : msg;
    return { kpis: null, error: hint };
  }

  const perfiles = (perfilesRes.data ?? []) as { status?: unknown }[];
  let pendientes = 0;
  let activos = 0;
  let bloqueados = 0;
  for (const p of perfiles) {
    const s = parseStatus(p.status);
    if (s === 'pending') pendientes++;
    else if (s === 'active') activos++;
    else if (s === 'blocked') bloqueados++;
  }

  const citasHoy = (citasHoyRes.data ?? []) as { estado?: unknown }[];
  let citasHoyConfirmadas = 0;
  let citasHoyPendientes = 0;
  for (const c of citasHoy) {
    const e = parseEstado(c.estado);
    if (e === 'confirmado') citasHoyConfirmadas++;
    else if (e === 'pendiente') citasHoyPendientes++;
  }

  const servicios = (serviciosRes.data ?? []) as { activo?: unknown }[];
  let serviciosActivos = 0;
  for (const s of servicios) {
    if (s.activo === true) serviciosActivos+;
  }

  return {
    kpis: {
      clientesPendientes: pendientes,
      clientesActivos: activos,
      clientesBloqueados: bloqueados,
      clientesTotal: perfiles.length,
      citasHoy: citasHoy.length,
      citasHoyConfirmadas,
      citasHoyPendientes,
      citas7Dias: citas7Res.data?.length ?? 0,
      serviciosActivos,
      serviciosTotal: servicios.length,
    },
    error: null,
  };
}

export async function fetchUltimasAltasAdmin(
  limit = 5
): Promise<{ rows: UltimaAltaRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .select(`${PERFIL_CLIENTE_SELECT_COLUMNS}, created_at`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { rows: [], error: error.message };
  }

  const rows: UltimaAltaRow[] = ((data ?? []) as Partial<PerfilClienteRow & { created_at?: string }>[]).map(
    (r) => ({
      id: String(r.id ?? ''),
      full_name: String(r.full_name ?? '').trim() || brand.clientFallbackName,
      phone: String(r.phone ?? '').trim(),
      status: parseStatus(r.status),
      created_at: typeof r.created_at === 'string' ? r.created_at : null,
    })
  );

  return { rows, error: null };
}

export async function fetchProximosTurnosAdmin(
  limit = 6
): Promise<{ rows: ProximoTurnoRow[]; error: string | null }> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyYmd = ymd(hoy);

  const { data, error } = await supabase
    .from('citas')
    .select('id, cliente_id, servicio, fecha, hora, estado')
    .gte('fecha', hoyYmd)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })
    .limit(limit);

  if (error) {
    return { rows: [], error: error.message };
  }

  const base = (data ?? []) as {
    id: string;
    cliente_id: string;
    servicio: string;
    fecha: string;
    hora: string;
    estado?: unknown;
  }[];

  const ids = [...new Set(base.map((c) => c.cliente_id))];

  const nombrePorCliente = new Map<string, string>();
  if (ids.length > 0) {
    const { data: perfiles, error: pe } = await supabase
      .from(PERFILES_CLIENTES_TABLE)
      .select('id, full_name')
      .in('id', ids);
    if (pe) {
      return { rows: [], error: pe.message };
    }
    for (const p of perfiles ?? []) {
      const id = (p as { id: string }).id;
      nombrePorCliente.set(id, String((p as { full_name?: string }).full_name ?? '').trim() || 'Cliente');
    }
  }

  return {
    rows: base.map((c) => ({
      id: c.id,
      cliente_id: c.cliente_id,
      servicio: c.servicio,
      fecha: c.fecha,
      hora: c.hora,
      estado: parseEstado(c.estado),
      full_name: nombrePorCliente.get(c.cliente_id) ?? 'Cliente',
    })),
    error: null,
  };
}
