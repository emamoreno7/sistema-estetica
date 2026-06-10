import type { PerfilClienteRow } from '@/lib/perfilCliente';
import { brand } from '../config/brand';

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
  fechaPlanPendiente: boolean;
};

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&fit=crop';

const BASE_META = {
  categoria: 'Tu plan ' + brand.shortName,
  zona: 'A coordinar segun tratamiento',
  profesional: brand.supportLabel + ' - te confirmamos desde la sede',
  totalSesiones: 0,
  sesionesCompletadas: 0,
  sucursal: 'Definimos sucursal y horarios con vos',
  imagen: PLACEHOLDER_IMAGE,
  precio: 'Consulta en sede',
} as const;

function planDescripcion(isoCitaPresente: boolean): string {
  if (isoCitaPresente) {
    return 'Plan activo registrado en ' + brand.shortName + '. Coordina cualquier cambio de turno con recepcion o por WhatsApp.';
  }
  return 'Este es el plan asociado a tu perfil en ' + brand.shortName + '. Tu recepcion o profesional completara sesiones y turnos cuando corresponda; podes coordinar proximos pasos por WhatsApp.';
}

export function deriveActiveTreatmentFromPerfil(
  perfil: PerfilClienteRow | null,
  tratamientoDesdeMetadata?: string | null
): PortalActiveTreatment | null {
  if (!perfil || perfil.status !== 'active') return null;

  const nombre = perfil.tratamiento_interes?.trim() || tratamientoDesdeMetadata?.trim();
  if (!nombre) return null;

  const fechaInicio = new Date().toISOString().slice(0, 10);

  const citaIso = perfil.proxima_cita_at ?? null;
  const cita = citaIso ? new Date(citaIso) : null;
  const tieneCitaValida = cita !== null && !Number.isNaN(cita.getTime());

  return {
    id: 'plan-perfil-' + perfil.id,
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
