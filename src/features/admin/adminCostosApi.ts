import { supabase } from '@/lib/supabaseClient';
import type { ServicioCostoInput, ServicioInsumoLink } from '@/lib/costosCalculo';

export type InsumoRow = {
  id: string;
  nombre: string;
  unidad: string;
  costo_por_unidad: number;
  proveedor: string;
  notas: string;
  activo: boolean;
};

export type CostoOperativoRow = {
  id: string;
  concepto: string;
  monto_mensual: number;
  activo: boolean;
  notas: string;
};

function parseNum(n: unknown): number {
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  if (typeof n === 'string' && n.trim() !== '') return Number.parseFloat(n);
  return 0;
}

function mapRls(error: { message: string }): string {
  return error.message.includes('row-level security')
    ? 'Ejecutá la migración 008 en Supabase y verificá is_portal_admin().'
    : error.message;
}

export async function fetchCostosDashboard(): Promise<{
  servicios: ServicioCostoInput[];
  insumos: InsumoRow[];
  costosFijos: CostoOperativoRow[];
  links: ServicioInsumoLink[];
  error: string | null;
}> {
  const empty = {
    servicios: [] as ServicioCostoInput[],
    insumos: [] as InsumoRow[],
    costosFijos: [] as CostoOperativoRow[],
    links: [] as ServicioInsumoLink[],
    error: null as string | null,
  };

  // Las queries van por separado y el JOIN insumo↔link se hace en JS — más robusto
  // que el embed `insumos(...)` de PostgREST, que falla si el schema cache aún no
  // detectó la FK servicios_insumos.insumo_id → insumos.id.
  const [svcRes, insRes, fijosRes, linkRes] = await Promise.all([
    supabase
      .from('servicios')
      .select(
        'id, nombre, categoria_label, precio, duracion_minutos, margen_objetivo, costo_mano_obra, cantidad_estimada_mensual, activo'
      )
      .order('sort_order', { ascending: true })
      .order('nombre', { ascending: true }),
    supabase.from('insumos').select('*').order('nombre', { ascending: true }),
    supabase.from('costos_operativos').select('*').order('concepto', { ascending: true }),
    supabase.from('servicios_insumos').select('servicio_id, insumo_id, cantidad'),
  ]);

  const err =
    svcRes.error?.message ??
    insRes.error?.message ??
    fijosRes.error?.message ??
    linkRes.error?.message ??
    null;

  if (err) return { ...empty, error: mapRls({ message: err }) };

  const servicios: ServicioCostoInput[] = (svcRes.data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id),
      nombre: String(row.nombre ?? ''),
      categoria_label: String(row.categoria_label ?? ''),
      precio: parseNum(row.precio),
      duracion_minutos: Math.round(parseNum(row.duracion_minutos)) || 60,
      margen_objetivo: parseNum(row.margen_objetivo) || 60,
      costo_mano_obra: parseNum(row.costo_mano_obra),
      cantidad_estimada_mensual: Math.max(0, Math.round(parseNum(row.cantidad_estimada_mensual))),
      activo: Boolean(row.activo),
    };
  });

  const insumos: InsumoRow[] = (insRes.data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id),
      nombre: String(row.nombre ?? ''),
      unidad: String(row.unidad ?? 'unidad'),
      costo_por_unidad: parseNum(row.costo_por_unidad),
      proveedor: String(row.proveedor ?? ''),
      notas: String(row.notas ?? ''),
      activo: Boolean(row.activo),
    };
  });

  const costosFijos: CostoOperativoRow[] = (fijosRes.data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id),
      concepto: String(row.concepto ?? ''),
      monto_mensual: parseNum(row.monto_mensual),
      activo: Boolean(row.activo),
      notas: String(row.notas ?? ''),
    };
  });

  // Mapa insumo_id → costo_por_unidad para hidratar cada link sin depender del embed.
  const costoPorInsumo = new Map<string, number>();
  for (const i of insumos) costoPorInsumo.set(i.id, i.costo_por_unidad);

  const links: ServicioInsumoLink[] = (linkRes.data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const insumoId = String(row.insumo_id);
    return {
      servicio_id: String(row.servicio_id),
      insumo_id: insumoId,
      cantidad: parseNum(row.cantidad) || 1,
      costo_por_unidad: costoPorInsumo.get(insumoId) ?? 0,
    };
  });

  return { servicios, insumos, costosFijos, links, error: null };
}

export async function upsertInsumo(
  row: Partial<InsumoRow> & { nombre: string }
): Promise<{ id: string | null; error: string | null }> {
  const payload = {
    nombre: row.nombre.trim(),
    unidad: (row.unidad ?? 'unidad').trim(),
    costo_por_unidad: Math.max(0, row.costo_por_unidad ?? 0),
    proveedor: (row.proveedor ?? '').trim(),
    notas: (row.notas ?? '').trim(),
    activo: row.activo ?? true,
  };

  if (row.id) {
    const { error } = await supabase.from('insumos').update(payload).eq('id', row.id);
    return { id: row.id, error: error?.message ?? null };
  }

  const { data, error } = await supabase.from('insumos').insert(payload).select('id').single();
  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}

export async function deleteInsumo(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('insumos').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function upsertCostoOperativo(
  row: Partial<CostoOperativoRow> & { concepto: string }
): Promise<{ id: string | null; error: string | null }> {
  const payload = {
    concepto: row.concepto.trim(),
    monto_mensual: Math.max(0, row.monto_mensual ?? 0),
    activo: row.activo ?? true,
    notas: (row.notas ?? '').trim(),
  };

  if (row.id) {
    const { error } = await supabase.from('costos_operativos').update(payload).eq('id', row.id);
    return { id: row.id, error: error?.message ?? null };
  }

  const { data, error } = await supabase.from('costos_operativos').insert(payload).select('id').single();
  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}

export async function deleteCostoOperativo(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('costos_operativos').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function updateServicioCostosFields(
  servicioId: string,
  fields: {
    margen_objetivo?: number;
    costo_mano_obra?: number;
    precio?: number;
    cantidad_estimada_mensual?: number;
  }
): Promise<{ error: string | null }> {
  const patch: Record<string, unknown> = {};
  if (fields.margen_objetivo !== undefined) patch.margen_objetivo = fields.margen_objetivo;
  if (fields.costo_mano_obra !== undefined) patch.costo_mano_obra = fields.costo_mano_obra;
  if (fields.precio !== undefined) patch.precio = fields.precio;
  if (fields.cantidad_estimada_mensual !== undefined) {
    patch.cantidad_estimada_mensual = Math.max(0, Math.round(fields.cantidad_estimada_mensual));
  }

  const { error } = await supabase.from('servicios').update(patch).eq('id', servicioId);
  return { error: error?.message ?? null };
}

export async function setServicioInsumo(
  servicioId: string,
  insumoId: string,
  cantidad: number
): Promise<{ error: string | null }> {
  if (cantidad <= 0) {
    const { error } = await supabase
      .from('servicios_insumos')
      .delete()
      .eq('servicio_id', servicioId)
      .eq('insumo_id', insumoId);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from('servicios_insumos').upsert(
    { servicio_id: servicioId, insumo_id: insumoId, cantidad },
    { onConflict: 'servicio_id,insumo_id' }
  );

  return { error: error?.message ?? null };
}

export async function aplicarPrecioSugerido(
  servicioId: string,
  precio: number
): Promise<{ error: string | null }> {
  return updateServicioCostosFields(servicioId, { precio: Math.max(0, precio) });
}
