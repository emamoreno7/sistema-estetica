/**
 * Helpers WhatsApp compartidos entre landing, portal y auth.
 * Número y plantilla genérica de contacto — nombre del negocio desde brand.
 */
import { brand } from '../config/brand';

/** Solo dígitos (ej. país + área + número), sin +. Usado por wa.me links. */
export const WHATSAPP_AMORE_PHONE = '5492634652008';

/** Alias retro-compatible para el portal (PortalCitasTab originalmente exportaba este nombre). */
export const WHATSAPP_ADMIN_PHONE = WHATSAPP_AMORE_PHONE;

/** Construye un href wa.me con un mensaje contextual al servicio o consulta. */
export function buildWhatsAppHref(serviceName: string): string {
  const text = `Hola ${brand.shortName}, me interesa información sobre el servicio de ${serviceName}.`;
  return `https://wa.me/${WHATSAPP_AMORE_PHONE}?text=${encodeURIComponent(text)}`;
}
