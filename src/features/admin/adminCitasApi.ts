import { supabase } from '@/lib/supabaseClient';
import type { CitaEstado, CitaClienteRow } from '@/lib/citasApi';

export type CitaAdminListRow = CitaClienteRow & {
  full_name: string;
  phone: string;
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

/** Todas las citas de un día (requiere políticas `citas_admin_*` en Supabase). */
export async function fetchCitasPorFechaAdmin(
  fechaYmd: string
): Promise<{ rows: CitaAdminListRow[]; error: string | null }> {
  const { data: citas, error } = await supabase
    .from('citas')
    .select('id, cliente_id, servicio, fecha, hora, estado')
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
      return { rows: [], error: pe.message };
    }
    for (const p of perfiles ?? []) {
      const id = (p as { id: string }).id;
      nombrePorCliente.set(id, {
        full_name: String((p as { full_name?: string }).full_name ?? '').trim() || 'Cliente Amore',
        phone: String((p as { phone?: string }).phone ?? '').trim(),
      });
    }
  }

  const rows: CitaAdminListRow[] = rawList.map((c) => {
    const perf = nombrePorCliente.get(c.cliente_id);
    return {
      id: c.id,
      cliente_id: c.cliente_id,
      servicio: c.servicio,
      fecha: c.fecha,
      hora: c.hora,
      estado: parseEstado(c.estado),
      full_name: perf?.full_name ?? 'Cliente',
      phone: perf?.phone ?? '',
    };
  });

  return { rows, error: null };
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
