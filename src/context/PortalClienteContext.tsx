import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';
import { clienteDisplayName, firstNameOrFriendly } from '@/lib/perfilCliente';
import {
  deriveActiveTreatmentFromPerfil,
  type PortalActiveTreatment,
} from '@/lib/portalTreatment';

export type PortalSesionLite = {
  nro: number;
  fecha: string;
  estado: 'completada' | 'proxima' | 'programada';
  notas: string;
  foto: string;
};

export type PortalAntesDespues = {
  title: string;
  improvement: string;
  before: string;
  after: string;
};

export type PortalClienteInfo = {
  displayName: string;
  greetingName: string;
  emailShown: string | null;
  phoneDisplay: string | null;
  photoUrl: string | null;
  memberSinceLabel: string;
  loyaltyPoints: number;
  tratamientoInteresLabel: string | null;
};

export type PortalClienteCtxValue = PortalClienteInfo & {
  activeTreatment: PortalActiveTreatment | null;
  sessions: PortalSesionLite[];
  beforeAfterPairs: PortalAntesDespues[];
};

const portalSessions: PortalSesionLite[] = [];
const portalBeforeAfterPairs: PortalAntesDespues[] = [];

const PortalClienteCtx = createContext<PortalClienteCtxValue | null>(null);

export function usePortalCliente(): PortalClienteCtxValue {
  const v = useContext(PortalClienteCtx);
  if (!v) throw new Error('Portal solo dentro del proveedor cliente');
  return v;
}

export function PortalClienteProvider({
  sessionUser,
  children,
}: {
  sessionUser: AuthUser;
  children: ReactNode;
}) {
  const { perfilCliente } = useAuth();

  const value = useMemo<PortalClienteCtxValue>(() => {
    const md = (sessionUser.user_metadata || {}) as Record<string, unknown>;
    const displayName = clienteDisplayName(
      sessionUser.email ?? undefined,
      md,
      perfilCliente?.full_name
    );

    let memberSinceLabel = 'Nuevo miembro Amore';
    if (perfilCliente?.created_at) {
      const d = new Date(perfilCliente.created_at);
      if (!Number.isNaN(d.getTime())) {
        memberSinceLabel = d.toLocaleDateString('es-AR', {
          month: 'long',
          year: 'numeric',
        });
      }
    }

    const photoUrl =
      typeof md.avatar_url === 'string' ? md.avatar_url.trim() || null : null;

    let emailShown: string | null = sessionUser.email ?? null;
    if (emailShown && /^wa_\d+@clients\.amore\.app$/i.test(emailShown)) {
      emailShown = null;
    }

    const phoneDisplay =
      perfilCliente?.phone?.trim() ||
      (typeof md.phone === 'string' ? md.phone.trim() : null) ||
      (typeof md.telefono_whatsapp === 'string' ? md.telefono_whatsapp : null);

    const tratamientoMd =
      (typeof md.tratamiento_interes === 'string' && md.tratamiento_interes.trim()) ||
      perfilCliente?.tratamiento_interes?.trim() ||
      null;

    return {
      displayName,
      greetingName: firstNameOrFriendly(displayName),
      emailShown,
      phoneDisplay,
      photoUrl,
      memberSinceLabel,
      loyaltyPoints: 0,
      tratamientoInteresLabel: tratamientoMd,
      activeTreatment: deriveActiveTreatmentFromPerfil(perfilCliente ?? null, tratamientoMd),
      sessions: portalSessions,
      beforeAfterPairs: portalBeforeAfterPairs,
    };
  }, [sessionUser, perfilCliente]);

  return <PortalClienteCtx.Provider value={value}>{children}</PortalClienteCtx.Provider>;
}

/** Helper: porcentaje de progreso 0–100; 0 cuando aún no hay sesiones planificadas. */
export function tratamientoProgresoPct(at: {
  sesionesCompletadas: number;
  totalSesiones: number;
}): number {
  if (at.totalSesiones <= 0) return 0;
  return Math.round((at.sesionesCompletadas / at.totalSesiones) * 100);
}
