import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import type { CitaClienteRow } from '@/lib/citasApi';
import { parseCitaMomentLocal } from '@/lib/citasApi';
import { brand } from '../config/brand';

export type PortalNotificationKind = 'cita_confirmada' | 'admin_mensaje';

export type PortalNotificationItem = {
  id: string;
  kind: PortalNotificationKind;
  title: string;
  body: string;
  /** ISO fecha de la notificación o de la cita asociada */
  createdAt: string;
  read: boolean;
};

type PortalNotificationsCtx = {
  notifications: PortalNotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  /** Nueva cita guardada desde el wizard del portal → suma badge y aparece en el panel. */
  notifyCitaConfirmada: (cita: CitaClienteRow) => void;

const PortalNotificationsContext = createContext<PortalNotificationsCtx | null>(null);

function fechaCitaHumana(cita: CitaClienteRow): string {
  try {
    const d = parseCitaMomentLocal(cita);
    return format(d, "d 'de' MMMM, HH:mm 'hs'", { locale: es });
  } catch {
    return `${cita.fecha} · ${String(cita.hora).slice(0, 5)} hs`;
  }
}

function seededNotifications(): PortalNotificationItem[] {
  const tPast = new Date(Date.now() - 86400000 * 2).toISOString();
  const t0 = new Date().toISOString();
  return [
    {
      id: 'seed-admin-welcome',
      kind: 'admin_mensaje',
      title: 'Mensaje de recepción',
      body:
        `Somos ${brand.supportLabel}. Si necesitás reagendar o tenés alguna consulta antes de tu visita, escribinos cuando quieras.`,
      createdAt: tP
      read: false,
    },
    {
      id: 'seed-recordatorio-general',
      kind: 'admin_mensaje',
      title: 'Recordatorio',
      body: 'Llegá con 10 minutos de anticipación para completar tu check-in tranquila.',
      createdAt: t0,
      read: true,
    },
  ];
}

export function PortalNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<PortalNotificationItem[]>([]);

  useEffect(() => {
    setNotifications(seededNotifications());
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const notifyCitaConfirmada = useCallback((cita: CitaClienteRow) => {
    const when = fechaCitaHumana(cita);   const id = `cita-${cita.id ?? `${cita.fecha}-${cita.hora}`}-${Date.now()}`;
    const item: PortalNotificationItem = {
      id,
      kind: 'cita_confirmada',
      title: 'Cita confirmada',
      body: `Tu turno de ${cita.servicio} quedó registrado para ${when}. Podés revisarlo en Mis citas.`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllRead,
      notifyCitaConfirmada,
    }),
    [notifications, unreadCount, markAsRead, markAllRead, notifyCitaConfirmada]
  );

  return (
    <PortalNotificationsContext.Provider value={value}>{children}</PortalNotificationsContext.Provider>
  );
}

export function usePortalNotifications(): PortNotificationsCtx {
  const ctx = useContext(PortalNotificationsContext);
  if (!ctx)
    throw new Error('usePortalNotifications debe usarse dentro de PortalNotificationsProvider');
  return ctx;
}
