import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

/** Tabla física única del portal (nombre canónico en todo el proyecto). */
export const PERFILES_CLIENTES_TABLE = 'perfiles_clientes' as const;

/** Columnas que existen en la tabla física para lecturas; evitar columnas inexistentes en `.select()`. */
export const PERFIL_CLIENTE_SELECT_COLUMNS = 'id, full_name, phone, status' as const;

/** SELECT extendido sólo para vistas admin que necesiten metadata temporal (created_at, updated_at). */
export const PERFIL_CLIENTE_ADMIN_SELECT_COLUMNS =
  'id, full_name, phone, status, created_at, updated_at' as const;

export type PerfilRowStatus = 'pending' | 'active' | 'blocked';

export type AccountStatus =
  | PerfilRowStatus
  | 'fetch_error'
  /** Respuesta benigna tipo PostgREST/HTTP 400–406 sin fila válida para el usuario actual. */
  | 'profile_not_found';

/** Núcleo = columnas reales del SELECT. El resto es opcional (metadata, futuras migraciones). */
export type PerfilClienteRow = {
  id: string;
  full_name: string;
  phone: string;
  status: PerfilRowStatus;
  tratamiento_interes?: string | null;
  proxima_cita_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type RawPerfilClienteRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: string | null;
};

/** PostgREST: 0 ó varias filas con `.single()`; situaciones especiales de RLS. */
function isLikelyMissingRowOrAmbiguousSingle(err: PostgrestError): boolean {
  const c = String(err.code ?? '');
  return c === 'PGRST116' || c === 'PGRST301';
}

function maybeHttpStatus(err: PostgrestError): number | null {
  const raw = err as unknown as { status?: unknown; statusCode?: unknown };
  const n = typeof raw.status === 'number' ? raw.status : null;
  const nStr = typeof raw.statusCode === 'number' ? raw.statusCode : null;
  return typeof n === 'number' ? n : nStr;
}

/** Errores que no queremos exponer como `fetch_error`; mostramos “perfil no encontrado” sin reintentos agresivos. */
function isBenignTreatAsMissingPerfil(err: PostgrestError): boolean {
  if (isLikelyMissingRowOrAmbiguousSingle(err)) return true;
  const http = maybeHttpStatus(err);
  if (http === 400 || http === 406) return true;
  const blob = `${err.message ?? ''} ${err.details ?? ''} ${err.hint ?? ''}`.toLowerCase();
  if (blob.includes('406') || blob.includes('400')) return true;
  return false;
}

function parseRowStatus(raw: unknown): PerfilRowStatus {
  if (raw === 'pending' || raw === 'active' || raw === 'blocked') return raw;
  return 'pending';
}

function rowFromSelect(r: RawPerfilClienteRow): PerfilClienteRow {
  return {
    id: r.id,
    full_name: (r.full_name ?? '').trim() || 'Cliente Amore',
    phone: (r.phone ?? '').trim() || '',
    status: parseRowStatus(r.status),
  };
}

async function fetchPerfilCanonicalColumns(userId: string) {
  return supabase
    .from(PERFILES_CLIENTES_TABLE)
    .select(PERFIL_CLIENTE_SELECT_COLUMNS)
    .eq('id', userId)
    .maybeSingle();
}

/**
 * Sin fila válida sin error HTTP → perfil null, todo false.
 * Errores benignos (400 / 406, PGRST116, …) → `missingBenign` (portal debe mostrar “perfil no encontrado”).
 * Otros errores → `fetchFailed`.
 */
export async function fetchPerfilClienteDetailed(userId: string): Promise<{
  perfil: PerfilClienteRow | null;
  fetchFailed: boolean;
  missingBenign: boolean;
}> {
  const result = await fetchPerfilCanonicalColumns(userId);

  if (!result.error) {
    if (!result.data) return { perfil: null, fetchFailed: false, missingBenign: false };
    return {
      perfil: rowFromSelect(result.data as RawPerfilClienteRow),
      fetchFailed: false,
      missingBenign: false,
    };
  }

  const err = result.error;

  if (isBenignTreatAsMissingPerfil(err)) {
    return { perfil: null, fetchFailed: false, missingBenign: true };
  }

  return { perfil: null, fetchFailed: true, missingBenign: false };
}

export async function fetchPerfilCliente(userId: string): Promise<PerfilClienteRow | null> {
  const { perfil } = await fetchPerfilClienteDetailed(userId);
  return perfil;
}

export function clienteDisplayName(
  email: string | undefined,
  userMetadata: Record<string, unknown>,
  fullNamePerfil?: string | null
): string {
  const md = userMetadata || {};
  const full =
    (typeof md.full_name === 'string' && md.full_name.trim()) ||
    (typeof md.nombre_completo === 'string' && md.nombre_completo.trim()) ||
    fullNamePerfil?.trim();
  if (full) return full;
  const e = email?.trim();
  const isSyntheticWa = /^wa_\d+@clients\.amore\.app$/i.test(e || '');
  if (e && !isSyntheticWa) return e;
  return 'Cliente Amore';
}

export function firstNameOrFriendly(fullName: string): string {
  const t = fullName.trim();
  if (!t) return 'Cliente Amore';
  return t.split(/\s+/)[0] ?? t;
}

/** Actualiza nombre y/o teléfono en `perfiles_clientes` (RLS: solo tu fila). */
export async function updatePerfilClienteFields(
  userId: string,
  patch: { full_name?: string; phone?: string }
): Promise<{ ok: boolean; error: string | null }> {
  const updates: Record<string, string> = {};
  if (patch.full_name !== undefined) updates.full_name = patch.full_name.trim() || 'Cliente Amore';
  if (patch.phone !== undefined) updates.phone = patch.phone.trim();

  if (Object.keys(updates).length === 0) return { ok: true, error: null };

  const { error } = await supabase
    .from(PERFILES_CLIENTES_TABLE)
    .update(updates)
    .eq('id', userId);

  if (error) return { ok: false, error: error.message ?? 'No se pudo guardar' };
  return { ok: true, error: null };
}
