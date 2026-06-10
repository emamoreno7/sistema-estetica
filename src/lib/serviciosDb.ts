import { supabase } from '@/lib/supabaseClient';
import type { ServicioCategoria, ServicioItem } from '@/data/serviciosCatalogo';
import { getAllServiceNames as getStaticServiceNames, DEFAULT_SERVICE_IMAGE } from '@/data/serviciosCatalogo';

export type ServicioRow = {
  id: string;
  categoria_id: string;
  categoria_label: string;
  nombre: string;
  precio: number;
  duracion_minutos: number;
  descripcion: string;
  activo: boolean;
  imagen_url: string;
  badges: string[] | null;
  sort_order: number;
};

const SELECT_PUBLIC =
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

/** Catálogo público: sólo servicios activos (anon + clientes). */
export async function fetchServiciosActivos(): Promise<{ rows: ServicioRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('servicios')
    .select(SELECT_PUBLIC)
    .eq('activo', true)
    .order('soorder', { ascending: true })
    .order('nombre', { ascending: true });

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []).map((x) => parseRow(x as Record<string, unknown>)), error: null };
}

export function rowsToCategorias(rows: ServicioRow[]): ServicioCategoria[] {
  const map = new Map<string, { label: string; order: number; services: ServicioItem[] }>();
  const sorted = [...rows].sort((a, b) => {
    const d = a.sort_order - b.sort_order;
    return d !== 0 ? d : a.nombre.localeCompare(b.nombre, 'es');
  });

  for (const r of sorted) {
    if (!map.has(r.categoria_id)) {
      map.set(r.categoria_id, { label: r.categoria_label, order: r.sort_order, services: [] });
    }
    const g = map.get(r.categoria_id)!;
    g.order = Math.min(g.order, r.sort_order);
    g.services.push({
      name: r.nombre,
      desc: r.descripcion,
      badges: r.badges?.length ? r.badges : [],
      image: r.imagen_url,
    });
  }

  return [...map.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([id, v]) => ({ id, label: v.label, services: v.services }));
}

/** Nombres para formularios (alta cliente): DB si hay datos, si no catálogo estático. */
export async function fetchActiveServiceNames(): Promise<string[]> {
  const { rows, error } = await fetchServiciosActivos();
  if (error || rows.length === 0) return getStaticServiceNames();
  return rows.map((r) => r.nombre);
}

export function formatPrecioArs(precio: number): string {
  try {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(
      precio
    );
  } catch {
    return `$${Math.round(precio)}`;
  }
}
