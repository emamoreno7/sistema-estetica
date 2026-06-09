import type { PerfilClienteRow } from '@/lib/perfilCliente';
import { brand } from '../config/brand';

/** Modeloal cliente: puede ampliarse cuando existan tablas clínicas. */
export type PortalActiveTreatment = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  zona: string;
  profesional: string;
  totalSesiones: number;
  sesionesCompletadas: number;
  fechaInicio: string;
  proximaSesion: string;
  horaProxima: string;
  sucursal: string;
  imagen: string;
  precio: string;
  /** Sin `proxima_cita_at` todavía; no inferir turnos falsos en la UI. */
  fechaPlanPendiente: boolean;
};

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&fit=crop';

const BASE_META = {
  categoria: `Tu plan ${brand.shortName}`,
  zona: 'A coordinar según tratamiento',
  profesional: `${brand.supportLabel} — te confirmamos desde la sede`,
  totalSesiones: 0,
  sesionesCompletadas: 0,
  sucursal: 'Definimos sucursal y horarios con vos',
  imagen: PLACEHOLDER_IMAGE,
  precio: 'Consultá en sede',
} as const;

function planDescripcion(isoCitaPresente: booletring {
  if (isoCitaPresente) {
    return `Plan activo registrado en ${brand.shortName}. Coordiná cualquier cambio de turno con recepción o por WhatsApp.`;
  }
  return `Este es el plan asociado a tu perfil en ${brand.shortName}. Tu recepción o profesional completará sesiones y turnos cuando corresponda; podés coordinar próximos pasos por WhatsApp.`;
}

/** Construye el bloque de tratamiento activo desde el perfil y, si aplica, metadata de Auth (signup). */
export function deriveActiveTreatmentFromPerfil(
  perfil: PerfilClienteRow | null,
  tratamientoDesdeMetadata?: string | null
): PortalActiveTreatment | null {
  if (!perfil || perfil.status !== 'active') return null;
  const nombre = perfil.tratamiento_interes?.trim() || tratamientoDesdeMetadata?.trim();
  if (!nombre) return null;

  const fechaInicio = (perfil.created_at ?? new Date().toISOString()).slice(0, 10);

  const citaIso = perfil.proxima_cita_at ?? null;
  const cita = citaIso ? new Date(citaIso) : null;
  const tieneCitaValida = citnull && !Number.isNaN(cita.getTime());

  return {
    id: `plan-perfil-${perfil.id}`,
    nombre,
    descripcion: planDescripcion(tieneCitaValida),
    ...BASE_META,
    fechaInicio,
    fechaPlanPendiente: !tieneCitaValida,
    proximaSesion: tieneCitaValida ? cita.toISOString().slice(0, 10) : '',
    horaProxima: tieneCitaValida
      ? cita.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : '',
  };
}
