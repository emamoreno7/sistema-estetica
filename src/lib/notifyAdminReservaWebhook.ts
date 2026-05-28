/** Completá esta URL aquí y/o configurá `VITE_RESERVAS_WEBHOOK_URL` en `.env` (prioridad si está definido). */
export const WEBHOOK_URL = '';

export type ReservaAdminNotifyPayload = {
  nombreCliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  telefono: string;
};

function resolvedWebhookTarget(): string {
  const manual = WEBHOOK_URL.trim();
  const fromEnv =
    typeof import.meta !== 'undefined'
      ? String(import.meta.env.VITE_RESERVAS_WEBHOOK_URL ?? '').trim()
      : '';
  return manual || fromEnv;
}

/**
 * POST al webhook del admin después de grabar una cita.
 * Sin URL válida solo registra error en consola; no rechaza ni bloquea el flujo cliente.
 */
export async function notifyAdminViaWebhook(reservaData: ReservaAdminNotifyPayload): Promise<void> {
  const url = resolvedWebhookTarget();
  if (!url) {
    console.error('[notifyAdminViaWebhook] WEBHOOK_URL no configurada; no se envió notificación.', reservaData);
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservaData),
    });
    if (!res.ok) {
      console.error(
        '[notifyAdminViaWebhook] Respuesta HTTP no OK:',
        res.status,
        await res.text().catch(() => '')
      );
    }
  } catch (e) {
    console.error('[notifyAdminViaWebhook] Error de red enviando webhook:', e);
  }
}
