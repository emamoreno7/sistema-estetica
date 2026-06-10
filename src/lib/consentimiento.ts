import { supabase } from '@/lib/supabaseClient';
import { brand } from '../config/brand';

/** Versión del texto legal vigente. Subir si cambia el contenido para forzar re-firma. */
export const CONSENTIMIENTO_VERSION = 'v1';

export const CONSENTIMIENTO_TABLE = 'consentimientos_clientes' as const;

/** Cláusulas que el cliente debe aceptar (cada una es un checkbox obligatorio). */
export const CONSENTIMIENTO_CLAUSULAS = [
  {
    key: 'declara_salud' as const,
    titulo: 'Declaración de estado de salud',
    texto:
      `Declaro que la información sobre mi estado de salud es verídica y me comprometo a informar al personal de ${brand.shortName} sobre embarazo, marcapasos, implantes metálicos, alergias, enfermedades de la piel, oncológicas u otras condiciones que puedan contraindicar un tratamiento.`,
  },
  {
    key: 'acepta_tratamiento' as const,
    titulo: 'Consentimiento del tratamiento',
    texto:
      'Comprendo en qué consisten los ttos estéticos que realizaré, sus beneficios, posibles molestias o reacciones (enrojecimiento, sensibilidad, etc.) y que los resultados pueden variar según cada persona. Autorizo su realización por el personal del centro.',
  },
  {
    key: 'acepta_datos' as const,
    titulo: 'Tratamiento de datos personales',
    texto:
      'Autorizo el tratamiento de mis datos personales y de salud con fines de seguimiento profesional, conforme a la Ley 25.326 de Protección de Datos Personales. Mis datos son confidenciales y solo accesibles por ofesional tratante.',
  },
] as const;

export type ConsentimientoClausulaKey = (typeof CONSENTIMIENTO_CLAUSULAS)[number]['key'];

export type ConsentimientoRow = {
  id: string;
  cliente_id: string;
  nombre_firma: string;
  dni: string | null;
  fecha_nacimiento: string | null;
  declara_salud: boolean;
  acepta_tratamiento: boolean;
  acepta_datos: boolean;
  contraindicaciones: string | null;
  version: string;
  firmado_at: string;
  firmado_por_admin: boolean;
};

/** Un consentimiento está completo solo si aceptó las 3 cláusulas. */
export function consentimientoEstaFirmado(c: ConsentimientoRow | null): boolean {
  return !!c && c.declara_salud && c.acepta_tratamiento && c.acepta_datos;
}

function mapRow(r: Record<string, unknown>): ConsentimientoRow {
  return {
    id: String(r.id ?? ''),
    cliente_id: String(r.cliente_id ?? ''),
    nombre_firma: String(r.nombre_firma ?? '').trim(),
    dni: r.dni != null ? String(r.dni) : null,
    fecha_nacimiento: r.fecha_nacimiento != null ? String(r.fecha_nacimiento) : null,
    declara_salud: !!r.declara_salud,
    acepta_tratamiento: !!r.acepta_tratamiento,
    acepta_datos: !!r.acepta_datos,
    contraindicaciones: r.contraindicaciones != null ? String(r.contraindicaciones) : null,
    version: String(r.version ?? CONSENTIMIENTO_VERSION),
    firmado_at: String(r.firmado_at ?? ''),
    firmado_por_admin: !!r.firmado_por_admin,
  };
}

const SELECT_COLS =
  'id, cliente_id, nombre_firma, dni, fecha_nacimiento, declara_salud, acepta_tratamiento, acepta_datos, contraindicaciones, version, firmado_at, firmado_por_admin';

/** Trae el consentimiento del cliente (o null si aún no firmó). */
export async function fetchConsentimientoCliente(
  clienteId: string
): Promise<{ consentimiento: ConsentimientoRow | null; error: string | null }> {
  if (!clienteId) return { consentimiento: null, error: null };

  const { data, error } = await supabase
    .from(CONSENTIMIENTO_TABLE)
    .select(SELECT_COLS)
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) {
    const flat = `${error.code ?? ''}${error.message}`.toLowerCase();
    if (flat.includes('does not exist') || flat.includes('relation') || flat.includes('schema cache')) {
      return { consentimiento: null, error: 'NO_MIGRADO' };
    }
    if (flat.includes('pgrst116')) return { consentimiento: null, error: null };
    return { consentimiento: null, error: error.message };
  }

  return { consentimiento: data ? mapRow(data as Record<string, unknown>) : null, error: null };
}

/** Guarda (o re-firma) el consentimiento del cliente. Upsert por cliente_id. */
export async function guardarConsentimientoCliente(input: {
  clienteId: string;
  nombreFirma: string;
  dni?: string;
  fechaNacimiento?: string;
  contraindicaciones?: string;
  declaraSalud: boolean;
  aceptaTratamiento: boolean;
  aceptaDatos: boolean;
  firmadoPorAdmin?: boolean;
}): Promise<{ consentimiento: ConsentimientoRow | null; error: string | null }> {
  const nombre = input.nombreFirma.trim();
  const dni = input.dni?.trim() || '';
  const fechaNac = input.fechaNacimiento?.trim() || '';
  if (!nombre) return { consentimiento: null, error: 'Ingresá tu nombre completo como firma.' };

  if (!input.firmadoPorAdmin) {
    if (!dni) return { consentimiento: null, error: 'El DNI es obligatorio.' };
    if (!fechaNac) return { consentimiento: null, error: 'La fecha de nacimiento es obligatoria.' };
  }

  if (!input.declaraSalud || !input.aceptaTratamiento || !input.aceptaDatos) {
    return { consentimiento: null, error: 'Debés aceptar las tres declaraciones para continuar.' };
  }

  const payload = {
    cliente_id: input.clienteId,
    nombre_firma: nombre,
    dni: dni || null,
    fecha_nacimiento: fechaNac || null,
    contraindicaciones: input.contraindicaciones?.trim() || null,
    declara_salud: input.declaraSalud,
    acepta_tratamiento: input.aceptaTratamiento,
    acepta_datos: input.aceptaDatos,
    version: CONSENTIMIENTO_VERSION,
    firmado_at: new Date().toISOString(),
    firmado_por_admin: input.firmadoPorAdmin ?? false,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : null,
  };

  const { data, error } = await supabase
    .from(CONSENTIMIENTO_TABLE)
    .upsert(payload, { onConflict: 'cliente_id' })
    .select(SELECT_COLS)
    .single();

  if (error) {
    const flat = `${error.code ?? ''}${error.message}`.toLowerCase();
    if (flat.includes('does not exist') || flat.includes('schema cache')) {
      return {
        consentimiento: null,
        error: 'Faltan migraciones de consentimiento en Supabase (018 y 020).',
      };
    }
    if (flat.includes('row-level security')) {
      return { consentimiento: null, error: 'Sin permiso para guardar el consentimiento. Verificá la migración 018' };
    }
    return { consentimiento: null, error: error.message };
  }

  return { consentimiento: mapRow(data as Record<string, unknown>), error: null };
}

/** Admin: trae consentimientos de varios clientes (mapa por cliente_id). */
export async function listConsentimientosAdmin(
  clienteIds?: string[]
): Promise<{ map: Map<string, ConsentimientoRow>; error: string | null }> {
  let q = supabase.from(CONSENTIMIENTO_TABLE).select(SELECT_COLS);
  if (clienteIds && clienteIds.length > 0) {
    q = q.in('cliente_id', clienteIds);
  }

  const { data, error } = await q;
  const map = new Map<string, ConsentimientoRow>();

  if (error) {
    const flat = `${error.code ?? ''}${error.message}`.toLowerCase();
    if (flat.includes('does not exist') || flat.includes('schema cache')) {
      return { map, error: 'NO_MIGRADO' };
    }
    return { map, error: error.message };
  }

  for (const r of data ?? []) {
    const row = mapRow(r as Record<string, unknown>);
    if (row.cliente_id) map.set(row.cliente_id, row);
  }
  return { map, error: null };
}
