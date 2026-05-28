/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAILS?: string;
  /** UUID(s) de auth.users con acceso admin (mismo usuario que correo en is_portal_admin). */
  readonly VITE_ADMIN_USER_IDS?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Opcional: URL POST para avisar al admin tras una nueva reserva (si está vacío, sólo hay log en consola). */
  readonly VITE_RESERVAS_WEBHOOK_URL?: string;
}
