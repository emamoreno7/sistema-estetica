import { supabase } from '@/lib/supabaseClient';

export const FICHAS_CLINICAS_TABLE = 'fichas_clinicas' as const;
export const FICHAS_SESIONES_TABLE = 'fichas_sesiones' as const;

/** Preguntas booleanas del cuestionario de salud (anamnesis). */
export const ANAMNESIS_PREGUNTAS = [
  { key: 'toma_liquido' as const, label: '¿Toma suficiente líquido?' },
  { key: 'toma_anticonceptivos' as const, label: '¿Toma anticonceptivos?' },
  { key: 'periodos_regulares' as const, label: '¿Sus períodos son regulares?' },
  { key: 'fuma' as const, label: '¿Fuma?' },
  { key: 'menopausia' as const, label: '¿Está en período de menopausia?' },
  { key: 'actividad_fisica' as const, label: '¿Realiza actividad física?' },
] as const;

export type AnamnesisKey = (typeof ANAMNESIS_PREGUNTAS)[number]['key'];

export type FichaClinica = {
  cliente_id: string;
  toma_liquido: boolean | null;
  toma_anticonceptivos: boolean | null;
  periodos_regulares: boolean | null;
  fuma: boolean | null;
  menopausia: boolean | null;
  actividad_fisica: boolean | null;
  intervenciones_quirurgicas: string | null;
  hijos: string | null;
  medicamentos: string | null;
  alergias: string | null;
  observaciones: string | null;
  tratamiento_comprende: string | null;
  updated_at: string | null;
  updated_por_admin: boolean;
};

export type FichaSesion = {
  id: string;
  cliente_id: string;
  nro: number | null;
  fecha: string | null;
  tratamiento: string | null;
  operador: string | null;
  notas: string | null;
  created_at: string;
};

const FICHA_COLS =
  'cliente_id, toma_liquido, toma_anticonceptivos, periodos_regulares, fuma, menopausia, actividad_fisica, intervenciones_quirurgicas, hijos, medicamentos, alergias, observaciones, tratamiento_comprende, updated_at, updated_por_admin';

const SESION_COLS = 'id, cliente_id, nro, fecha, tratamiento, operador, notas, created_at';

function mapFicha(r: Record<string, unknown>): FichaClinica {
  const b = (v: unknown): boolean | null => (v === true ? true : v === false ? false : null);
  const s = (v: unknown): string | null => (v != null && String(v).trim() !== '' ? String(v) : null);
  return {
    cliente_id: String(r.cliente_id ?? ''),
    toma_liquido: b(r.toma_liquido),
    toma_anticonceptivos: b(r.toma_anticonceptivos),
    periodos_regulares: b(r.periodos_regulares),
    fuma: b(r.fuma),
    menopausia: b(r.menopausia),
    actividad_fisica: b(r.actividad_fisica),
    intervenciones_quirurgicas: s(r.intervenciones_quirurgicas),
    hijos: s(r.hijos),
    medicamentos: s(r.medicamentos),
    alergias: s(r.alergias),
    observaciones: s(r.observaciones),
    tratamiento_comprende: s(r.tratamiento_comprende),
    updated_at: r.updated_at != null ? String(r.updated_at) : null,
    updated_por_admin: !!r.updated_por_admin,
  };
}

function mapSesion(r: Record<string, unknown>): FichaSesion {
  return {
    id: String(r.id ?? ''),
    cliente_id: String(r.cliente_id ?? ''),
    nro: r.nro != null ? Number(r.nro) : null,
    fecha: r.fecha != null ? String(r.fecha) : null,
    tratamiento: r.tratamiento != null ? String(r.tratamiento) : null,
    operador: r.operador != null ? String(r.operador) : null,
    notas: r.notas != null ? String(r.notas) : null,
    created_at: String(r.created_at ?? ''),
  };
}

function isMissingTable(error: { code?: string; message: string }): boolean {
  const flat = `${error.code ?? ''}${error.message}`.toLowerCase();
  return flat.includes('does not exist') || flat.includes('schema cache') || flat.includes('relation');
}

/** Trae la ficha clínica del cliente (o null si aún no existe). */
export async function fetchFichaClinica(
  clienteId: string
): Promise<{ ficha: FichaClinica | null; error: string | null }> {
  if (!clienteId) return { ficha: null, error: null };
  const { data, error } = await supabase
    .from(FICHAS_CLINICAS_TABLE)
    .select(FICHA_COLS)
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return { ficha: null, error: 'NO_MIGRADO' };
    const flat = `${error.code ?? ''}`.toLowerCase();
    if (flat.includes('pgrst116')) return { ficha: null, error: null };
    return { ficha: null, error: error.message };
  }
  return { ficha: data ? mapFicha(data as Record<string, unknown>) : null, error: null };
}

/** Guarda (upsert) la ficha clínica. */
export async function guardarFichaClinica(
  clienteId: string,
  patch: Partial<Omit<FichaClinica, 'cliente_id' | 'updated_at'>>,
  opts?: { porAdmin?: boolean }
): Promise<{ ficha: FichaClinica | null; error: string | null }> {
  const payload: Record<string, unknown> = {
    cliente_id: clienteId,
    ...patch,
    updated_at: new Date().toISOString(),
    updated_por_admin: opts?.porAdmin ?? false,
  };

  const { data, error } = await supabase
    .from(FICHAS_CLINICAS_TABLE)
    .upsert(payload, { onConflict: 'cliente_id' })
    .select(FICHA_COLS)
    .single();

  if (error) {
    if (isMissingTable(error)) return { ficha: null, error: 'Falta la migración 019 (ficha clínica) en Supabase.' };
    if (error.message.toLowerCase().includes('row-level security')) {
      return { ficha: null, error: 'Sin permiso para guardar la ficha. Verificá la migración 019.' };
    }
    return { ficha: null, error: error.message };
  }
  return { ficha: mapFicha(data as Record<string, unknown>), error: null };
}

/** Lista el historial de sesiones del cliente. */
export async function listFichaSesiones(
  clienteId: string
): Promise<{ sesiones: FichaSesion[]; error: string | null }> {
  if (!clienteId) return { sesiones: [], error: null };
  const { data, error } = await supabase
    .from(FICHAS_SESIONES_TABLE)
    .select(SESION_COLS)
    .eq('cliente_id', clienteId)
    .order('nro', { ascending: true, nullsFirst: false })
    .order('fecha', { ascending: true, nullsFirst: false });

  if (error) {
    if (isMissingTable(error)) return { sesiones: [], error: 'NO_MIGRADO' };
    return { sesiones: [], error: error.message };
  }
  return { sesiones: (data ?? []).map((r) => mapSesion(r as Record<string, unknown>)), error: null };
}

/** Agrega una sesión al historial (solo admin por RLS). */
export async function agregarFichaSesion(input: {
  clienteId: string;
  nro?: number | null;
  fecha?: string | null;
  tratamiento?: string | null;
  operador?: string | null;
  notas?: string | null;
}): Promise<{ sesion: FichaSesion | null; error: string | null }> {
  const { data, error } = await supabase
    .from(FICHAS_SESIONES_TABLE)
    .insert({
      cliente_id: input.clienteId,
      nro: input.nro ?? null,
      fecha: input.fecha ?? null,
      tratamiento: input.tratamiento ?? null,
      operador: input.operador ?? null,
      notas: input.notas ?? null,
    })
    .select(SESION_COLS)
    .single();

  if (error) {
    if (isMissingTable(error)) return { sesion: null, error: 'Falta la migración 019 (ficha clínica) en Supabase.' };
    if (error.message.toLowerCase().includes('row-level security')) {
      return { sesion: null, error: 'Sin permiso para cargar sesiones. Solo el admin puede hacerlo.' };
    }
    return { sesion: null, error: error.message };
  }
  return { sesion: mapSesion(data as Record<string, unknown>), error: null };
}

/** Elimina una sesión del historial (solo admin por RLS). */
export async function eliminarFichaSesion(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from(FICHAS_SESIONES_TABLE).delete().eq('id', id);
  return { error: error?.message ?? null };
}
