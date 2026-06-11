/**
 * Helpers WhatsApp compartidos entre landing, portal y auth.
 * Numero y plantilla generica de contacto.
 */
import { brand } from '../config/brand';

/** Solo digitos, sin +. Usado por enlaces wa.me. */
export const WHATSAPP_CONTACT_PHONE = '5492634652008';

/** Alias retro compatible para el portal. */
export const WHATSAPP_ADMIN_PHONE = WHATSAPP_CONTACT_PHONE;

/** Construye un href wa.me con un mensaje contextual. */
export function buildWhatsAppHref(serviceName: string): string {
  const text = `Hola ${brand.shortName}, me interesa informacion sobre el servicio de ${serviceName}.`;
  return `https://wa.me/${WHATSAPP_CONTACT_PHONE}?text=${encodeURIComponent(text)}`;
}
