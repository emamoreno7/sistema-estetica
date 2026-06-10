import { supabase } from '@/lib/supabaseClient';
import type { ServicioRow } from '@/lib/serviciosDb';
import { DEFAULT_SERVICE_IMAGE } from '@/data/serviciosCatalogo';

const SELECT_ADMIN =
  'id, categoria_id, categoria_label, nombre, precio, duracion_minutos, descripcion, activo, imagen_url, badges, sort_order';

function parseNum(n: unknown): number {
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  if (typeof n === 'string' && n.trim() !== '') return Number.parseFloat(n);
  return 0;
}

function parseRow(r: Record<string, unknown>): ServicioRow {
  return {
    id: String(r.id),
    categoria_id: String(r.categoria_id ?? ''),
    categoria_label: String(r.categoria_label ?? ''),
    nombre: String(r.nombre ?? ''),
    precio: parseNum(r.precio),
    duracion_minutos: Math.round(parseNum(r.duracion_minutos)) || 60,
    descripcion: String(r.descripcion ?? ''),
    activo: Boolean(r.activo),
    imagen_url: String(r.imagen_url ?? DEFAULT_SERVICE_IMAGE),
    badges: Array.isArray(r.badges) ? (r.badges as string[]) : [],
    sort_order: Math.round(parseNum(r.sort_order)),
  };
}

export async function listServiciosAdmin(): Promise<{ rows: ServicioRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('servicios')
    .select(SELECT_ADMIN)
    .order('sort_order', { ascending: true })
    .order('nombre', { ascending: true });

  if (error) {
    return {
      rows: [],
      error: error.message.includes('row-level security')
        ? 'Revisá la migración 007 y que tu usuario sea admin en is_portal_admin().'
        : error.message,
    };
  }
  return { rows: (data ?? []).map((x) => parseRow(x as Record<string, unknown>)), error: null };
}

export async fution updateServicioPrecioDescripcionAdmin(
  id: string,
  fields: { precio: number; descripcion: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('servicios')
    .update({
      precio: fields.precio,
      descripcion: fields.descripcion,
    })
    .eq('id', id);

  return { error: error?.message ?? null };
}

export async function setServicioActivoAdmin(id: string, activo: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('servicios')
    .update({ activo })
    .eq('id', id);

  return { error: error?.message ?? null };
}

export async function createServicioAdmin(opts: {
  categoria_id: string;
  categoria_label: string;
  nombre: string;
  precio: number;
  duracion_minutos: number;
  descripcion: string;
  imagen_url: string;
  activo: boolean;
}): Promise<{ id: string | null; error: string | null }> {
  const { data: maxRows } = await supabase
    .from('servicios')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const maxOrder = maxRows?.[0] ? parseNum((maxRows[0] as { sort_order?: unknown }).sort_order) : 0;
  const sort_order = Math.round(maxOrder) + 1;

  const { data, error } = await supabase
    .from('servicios')
    .insert({
      categoria_id: opts.categoria_id,
      categoria_label: opts.categoria_label,
      nombre: opts.nombre.trim(),
      precio: opts.precio,
      duracion_minutos: opts.duracion_minutos,
      descripcion: opts.descripcion,
      imagen_url: opts.imagen_url || DEFAULT_SERVICE_IMAGE,
      activo: opts.activo,
      badges: [] as string[],
      sort_order,
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };
  return { id: (data as { id: string }).id, error: null };
}
