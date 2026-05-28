import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PortalApp } from './PortalApp';
import { PendingActivationPortal } from './gates/PendingActivationPortal';
import { AccountBlockedPortal } from './gates/AccountBlockedPortal';
import { PortalPerfilNotFoundFriendly } from './gates/PortalPerfilNotFoundFriendly';
import { PortalPerfilFetchError } from './gates/PortalPerfilFetchError';

/** Decide qué vista de portal mostrar según el estado de la cuenta. */
export function PortalGate() {
  const { session, loading, perfilLoading, perfilCliente, accountStatus } = useAuth();

  if (loading || (session !== null && perfilLoading)) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-cream)' }}
      >
        <p className="text-sm" style={{ color: 'rgba(0,61,91,0.55)' }}>
          Cargando…
        </p>
      </div>
    );
  }
  if (!session) return <Navigate to="/acceso" replace />;
  if (accountStatus === 'fetch_error') return <PortalPerfilFetchError />;
  if (accountStatus === 'profile_not_found') return <PortalPerfilNotFoundFriendly />;
  if (accountStatus === 'pending' || perfilCliente === null) return <PendingActivationPortal />;
  if (accountStatus === 'blocked') return <AccountBlockedPortal />;
  return <PortalApp />;
}
