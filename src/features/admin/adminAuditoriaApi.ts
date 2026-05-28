import { supabase } from '@/lib/supabaseClient';

export type AuditoriaInsumoRow = {
  id: string;
  nombre: string;
  unidad: string;
  costo_por_unidad: number;
  verificado_at: string | null;
  updated_at: string;
  activo: boolean;
  proveedores_count: number;
  /** Días desde la última verificación (o desde el alta si nunca se verificó). */
  dias_sin_verificar: number;
};

export type ProveedorInsumoRow = {
  id: string;
  insumo_id: string;
  proveedor: string;
  url: string;
  precio_listado: number;
  fecha_verificacion: string | null;
  notas: string;
  ml_item_id: string | null;
  ultimo_sondeo_at: string | null;
  ultimo_sondeo_ok: boolean | null;
  ultimo_sondeo_error: string | null;
  umbral_alerta_pct: number;
  sondeo_activo: boolean;
};

export type SondeoLogRow = {
  id: string;
  proveedor_id: string;
  sondeado_at: string;
  source: 'ml_api' | 'scraper' | 'manual';
  status: 'ok' | 'error' | 'no_change';
  precio_anterior: number | null;
  precio_detectado: number | null;
  variacion_pct: number | null;
  error_msg: string | null;
  http_status: number | null;
  duration_ms: number | null;
};

export type SondeoResultadoItem = {
  proveedor_id: string;
  insumo_id: string;
  insumo_nombre: string;
  source: 'ml_api' | 'scraper' | 'manual';
  status: 'ok' | 'error' | 'no_change';
  precio_anterior: number | null;
  precio_detectado: number | null;
  variacion_pct: number | null;
  error_msg?: string;
  http_status?: number;
  duration_ms: number;
  is_alerta: boolean;
};

export type SondeoSummary = {
  total: number;
  ok: number;
  errores: number;
  sin_cambios: number;
  cambios_significativos: SondeoResultadoItem[];
  detalle: SondeoResultadoItem[];
  dry_run: boolean;
};

export type HistorialCambioRow = {
  id: string;
  insumo_id: string;
  costo_anterior: number;
  costo_nuevo: number;
  variacion_pct: number | null;
  changed_at: string;
};

function parseNum(n: unknown): number {
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  if (typeof n === 'string' && n.trim() !== '') return Number.parseFloat(n);
  return 0;
}

function diasDesde(iso: string | null | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  const ms = Date.now() - t;
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function mapRls(message: string): string {
  return message.includes('row-level security')
    ? 'Corré la migración 011 en Supabase y verificá is_portal_admin().'
    : message;
}

/** Lista insumos para la auditoría con su info de verificación. */
export async function listAuditoriaInsumos(): Promise<{
  rows: AuditoriaInsumoRow[];
  error: string | null;
}> {
  const [insRes, provRes] = await Promise.all([
    supabase
      .from('insumos')
      .select('id, nombre, unidad, costo_por_unidad, verificado_at, updated_at, activo')
      .order('nombre', { ascending: true }),
    supabase.from('insumo_proveedores').select('insumo_id'),
  ]);

  if (insRes.error) return { rows: [], error: mapRls(insRes.error.message) };
  if (provRes.error) return { rows: [], error: mapRls(provRes.error.message) };

  const provCount = new Map<string, number>();
  for (const r of provRes.data ?? []) {
    const k = String((r as { insumo_id?: string }).insumo_id ?? '');
    provCount.set(k, (provCount.get(k) ?? 0) + 1);
  }

  const rows: AuditoriaInsumoRow[] = (insRes.data ?? []).map((r) => {
    const raw = r as Record<string, unknown>;
    const id = String(raw.id);
    const verificado_at = (raw.verificado_at as string | null) ?? null;
    const updated_at = String(raw.updated_at ?? '');
    const referencia = verificado_at ?? updated_at;
    return {
      id,
      nombre: String(raw.nombre ?? ''),
      unidad: String(raw.unidad ?? 'unidad'),
      costo_por_unidad: parseNum(raw.costo_por_unidad),
      verificado_at,
      updated_at,
      activo: Boolean(raw.activo),
      proveedores_count: provCount.get(id) ?? 0,
      dias_sin_verificar: diasDesde(referencia),
    };
  });

  return { rows, error: null };
}

/** Marca un insumo como verificado hoy sin cambiar el costo. */
export async function marcarVerificadoInsumo(insumoId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('insumos')
    .update({ verificado_at: new Date().toISOString() })
    .eq('id', insumoId);
  return { error: error?.message ?? null };
}

export async function marcarTodosVerificadosBajoUmbral(insumoIds: string[]): Promise<{ error: string | null }> {
  if (insumoIds.length === 0) return { error: null };
  const { error } = await supabase
    .from('insumos')
    .update({ verificado_at: new Date().toISOString() })
    .in('id', insumoIds);
  return { error: error?.message ?? null };
}

const PROVEEDOR_SELECT =
  'id, insumo_id, proveedor, url, precio_listado, fecha_verificacion, notas, ' +
  'ml_item_id, ultimo_sondeo_at, ultimo_sondeo_ok, ultimo_sondeo_error, ' +
  'umbral_alerta_pct, sondeo_activo';

function mapProveedorRow(raw: Record<string, unknown>): ProveedorInsumoRow {
  return {
    id: String(raw.id),
    insumo_id: String(raw.insumo_id),
    proveedor: String(raw.proveedor ?? ''),
    url: String(raw.url ?? ''),
    precio_listado: parseNum(raw.precio_listado),
    fecha_verificacion: (raw.fecha_verificacion as string | null) ?? null,
    notas: String(raw.notas ?? ''),
    ml_item_id: (raw.ml_item_id as string | null) ?? null,
    ultimo_sondeo_at: (raw.ultimo_sondeo_at as string | null) ?? null,
    ultimo_sondeo_ok: (raw.ultimo_sondeo_ok as boolean | null) ?? null,
    ultimo_sondeo_error: (raw.ultimo_sondeo_error as string | null) ?? null,
    umbral_alerta_pct: parseNum(raw.umbral_alerta_pct) || 10,
    sondeo_activo: raw.sondeo_activo === false ? false : true,
  };
}

export async function listProveedoresInsumo(insumoId: string): Promise<{
  rows: ProveedorInsumoRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('insumo_proveedores')
    .select(PROVEEDOR_SELECT)
    .eq('insumo_id', insumoId)
    .order('precio_listado', { ascending: true });

  if (error) return { rows: [], error: mapRls(error.message) };
  const rows = (data ?? []).map((r) => mapProveedorRow(r as unknown as Record<string, unknown>));
  return { rows, error: null };
}

export async function upsertProveedorInsumo(
  row: Partial<ProveedorInsumoRow> & { insumo_id: string; proveedor: string }
): Promise<{ id: string | null; error: string | null }> {
  const payload: Record<string, unknown> = {
    insumo_id: row.insumo_id,
    proveedor: row.proveedor.trim(),
    url: (row.url ?? '').trim(),
    precio_listado: Math.max(0, row.precio_listado ?? 0),
    fecha_verificacion: row.fecha_verificacion ?? new Date().toISOString().slice(0, 10),
    notas: (row.notas ?? '').trim(),
  };
  if (typeof row.umbral_alerta_pct === 'number') {
    payload.umbral_alerta_pct = Math.max(0, Math.min(100, row.umbral_alerta_pct));
  }
  if (typeof row.sondeo_activo === 'boolean') {
    payload.sondeo_activo = row.sondeo_activo;
  }

  if (row.id) {
    const { error } = await supabase.from('insumo_proveedores').update(payload).eq('id', row.id);
    return { id: row.id, error: error?.message ?? null };
  }
  const { data, error } = await supabase
    .from('insumo_proveedores')
    .insert(payload)
    .select('id')
    .single();
  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}

export async function deleteProveedorInsumo(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('insumo_proveedores').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function listHistorialInsumo(
  insumoId: string,
  limit = 12
): Promise<{ rows: HistorialCambioRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('insumo_precio_historial')
    .select('id, insumo_id, costo_anterior, costo_nuevo, variacion_pct, changed_at')
    .eq('insumo_id', insumoId)
    .order('changed_at', { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: mapRls(error.message) };
  const rows: HistorialCambioRow[] = (data ?? []).map((r) => {
    const raw = r as Record<string, unknown>;
    return {
      id: String(raw.id),
      insumo_id: String(raw.insumo_id),
      costo_anterior: parseNum(raw.costo_anterior),
      costo_nuevo: parseNum(raw.costo_nuevo),
      variacion_pct: raw.variacion_pct === null ? null : parseNum(raw.variacion_pct),
      changed_at: String(raw.changed_at ?? ''),
    };
  });
  return { rows, error: null };
}

/** Extrae el item_id de Mercado Libre desde una URL (regex client-side, idem al trigger SQL). */
export function extractMlItemId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(ML[ABMUCVO])-?([0-9]{6,15})/i);
  if (!m) return null;
  return `${m[1].toUpperCase()}${m[2]}`;
}

/** Dispara la Edge Function `sondear-precios`. */
export async function triggerSondeoPrecios(opts?: {
  proveedorIds?: string[];
  dryRun?: boolean;
}): Promise<{ summary: SondeoSummary | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke('sondear-precios', {
      body: {
        proveedor_ids: opts?.proveedorIds,
        dry_run: opts?.dryRun ?? false,
      },
    });
    if (error) {
      // Supabase devuelve el cuerpo de error con detalles cuando la function falla
      return { summary: null, error: error.message ?? 'Falló la Edge Function sondear-precios' };
    }
    return { summary: data as SondeoSummary, error: null };
  } catch (e) {
    return { summary: null, error: e instanceof Error ? e.message : 'Error desconocido al invocar sondear-precios' };
  }
}

/** Lista las entradas de bitácora del sondeador para un proveedor. */
export async function listSondeoLog(
  proveedorId: string,
  limit = 20
): Promise<{ rows: SondeoLogRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('insumo_proveedor_sondeo_log')
    .select(
      'id, proveedor_id, sondeado_at, source, status, precio_anterior, precio_detectado, variacion_pct, error_msg, http_status, duration_ms'
    )
    .eq('proveedor_id', proveedorId)
    .order('sondeado_at', { ascending: false })
    .limit(limit);

  if (error) return { rows: [], error: mapRls(error.message) };
  const rows: SondeoLogRow[] = (data ?? []).map((r) => {
    const raw = r as Record<string, unknown>;
    return {
      id: String(raw.id),
      proveedor_id: String(raw.proveedor_id),
      sondeado_at: String(raw.sondeado_at ?? ''),
      source: (raw.source as SondeoLogRow['source']) ?? 'manual',
      status: (raw.status as SondeoLogRow['status']) ?? 'ok',
      precio_anterior: raw.precio_anterior === null ? null : parseNum(raw.precio_anterior),
      precio_detectado: raw.precio_detectado === null ? null : parseNum(raw.precio_detectado),
      variacion_pct: raw.variacion_pct === null ? null : parseNum(raw.variacion_pct),
      error_msg: (raw.error_msg as string | null) ?? null,
      http_status: raw.http_status === null || raw.http_status === undefined ? null : Number(raw.http_status),
      duration_ms: raw.duration_ms === null || raw.duration_ms === undefined ? null : Number(raw.duration_ms),
    };
  });
  return { rows, error: null };
}

/** Cuenta liviana de insumos sin verificar hace +N días — para el badge del sidebar. */
export async function countInsumosSinVerificar(diasUmbral = 7): Promise<number> {
  const limite = new Date(Date.now() - diasUmbral * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from('insumos')
    .select('id', { count: 'exact', head: true })
    .eq('activo', true)
    .or(`verificado_at.is.null,verificado_at.lt.${limite}`);
  if (error) return 0;
  return typeof count === 'number' ? count : 0;
}
