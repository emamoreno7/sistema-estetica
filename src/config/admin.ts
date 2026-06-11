function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase().normalize('NFC');
}

/**
 * Lista de cuentas con acceso a /admin (JWT email).
 * Debe coincidir con los correos configurados en is_portal_admin() en Supabase.
 *
 * Ejemplo .env:
 * VITE_ADMIN_EMAILS=admin@tuestetica.com,recepcion@tuestetica.com
 *
 * Opcional, mismo usuario por UID (JWT sub):
 * VITE_ADMIN_USER_IDS=uuid-de-supabase-auth
 */
export function getPortalAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((e) => normalizeAdminEmail(e))
    .filter(Boolean);
}

export function getPortalAdminUserIds(): string[] {
  const raw = import.meta.env.VITE_ADMIN_USER_IDS as string | undefined;
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean);
}

export function isPortalAdmin(
  email: string | null | undefined,
  userId?: string | null | undefined
): boolean {
  const uid = (userId ?? '').trim().toLowerCase();
  if (uid) {
    const ids = getPortalAdminUserIds();
    if (ids.length > 0 && ids.includes(uid)) return true;
  }

  const raw = (email ?? '').trim();
  if (!raw) return false;

  const e = normalizeAdminEmail(raw);
  const admins = getPortalAdminEmails();
  return admins.length > 0 && admins.includes(e);
}
