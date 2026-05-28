/** Email sintético para Supabase Auth cuando el alta es por WhatsApp (sin correo propio). */
export function phoneToAuthEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `wa_${digits || '0'}@clients.amore.app`;
}

export function normalizePhoneAR(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('54')) return `+${d}`;
  if (d.length >= 10) return `+54${d}`;
  return phone.trim();
}
