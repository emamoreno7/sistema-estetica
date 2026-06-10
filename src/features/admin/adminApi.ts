import { supabase } from '@/lib/supabaseClient';
import {
  PERFILES_CLIENTES_TABLE,
  PERFIL_CLIENTE_ADMIN_SELECT_COLUMNS,
  PERFIL_CLIENTE_SELECT_COLUMNS,
  type PerfilClienteRow,
  type PerfilRowStatus,
} from '@/lib/perfilCliente';
import { brand } from '../../config/brand';

function parseRowStatus(raw: unknown): PerfilRowStatus {
  if (raw === 'pending' || raw === 'active' || raw === 'blocked') return raw;
  return 'pending';
}

function mapRlsError(error: { message: string }): string {
  return error.message.includes('row-level security')
    ? 'PolíticasRLS: revisá migración admin, que tu email esté en `is_portal_admin()` y coincida con VITE_ADMIN_EMAILS.'
    : error.message;
}

/** Listado admin (requiere política `portal_admin_manage_perfiles`). Mismo SELECT canónico que el portal cliente. */
export async function listPerfilesClientesAdmin(): Promise<{
  rows: PerfilClienteRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .select(PERFIL_CLIENTE_SELECT_COLUMNS)
    .order('id', { ascending: false });

  if (error) return { rows: [], error: mapRlsError(error) };

  const rows: PerfilClienteRow[] = (data ?? []).map((r) => ({
    id: r.id as string,
    full_name: String((r as { full_name?: string }).full_name ?? '').trim() || brand.clientFallbackName,
    phone: String((r as { phone: string }).phone ?? '').trim() || '',
    status: parseRowStatus((r as { status?: string }).status),
  }));

  return { rows, error: null };
}

export async function listPerfilesClientesAdminExt(): Promise<{
  rows: PerfilClienteRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .select(PERFIL_CLIENTE_ADMIN_SELECT_COLUMNS)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false, nullsFirst: false });

  if (error) return { rows: [], error: mapRlsError(error) };

  const rows: PerfilClienteRow[] = (data ?? []).map((r) => {
    const raw = r as {
      id: string;
      full_name?: string | null;
      phone?: string | null;
      status?: string | null;
      created_at?: string | null;
    };
    return {
      id: raw.id,
      full_name: String(raw.full_name ?? '').trim() || brand.clientFallbackName,
      phone: String(raw.phone ?? '').trim() || '',
      status: parseRowStatus(raw.status),
      created_at: raw.created_at ?? undefined,
    };
  });

  return { rows, error: null };
}

/** Activa portal: sólo campos garantizados en la tabla física. */
export async function activateCliente(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .update({ status: 'active' })
    .eq('id', userId);

  return { error: error?.message ?? null };
}

export async function bloquearCliente(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .update({ status: 'blocked' })
    .eq('id', userId);

  return { error: error?.message ?? null };
}

/** Volver una ficha activa a estado `pending` (deshacer aprobación sin borrar la ficha). */
export async function desaprobarCliente(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .update({ status: 'pending' })
    .eq('id', userId);

  return { error: error?.message ?? null };
}

export async function countPerfilesPendientesAdmin(): Promise<number> {
  const { count, error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) return 0;
  return typeof count === 'number' ? count : 0;
}

export async function eliminarPerfilCliente(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from(PERFILES_CLIENTES_TABLE).delete().eq('id', userId);

  return { error: error?.message ?? null };
}
