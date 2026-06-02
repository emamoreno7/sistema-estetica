import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  consentimientoEstaFirmado,
  fetchConsentimientoCliente,
  type ConsentimientoRow,
} from '@/lib/consentimiento';

type ConsentimientoCtxValue = {
  consentimiento: ConsentimientoRow | null;
  firmado: boolean;
  loading: boolean;
  /** true si la tabla aún no existe (migración 018 sin aplicar). */
  noMigrado: boolean;
  refresh: () => Promise<void>;
  setConsentimiento: (c: ConsentimientoRow) => void;
};

const Ctx = createContext<ConsentimientoCtxValue | null>(null);

export function useConsentimiento(): ConsentimientoCtxValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useConsentimiento debe usarse dentro de ConsentimientoProvider');
  return v;
}

export function ConsentimientoProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const uid = session?.user?.id ?? '';

  const [consentimiento, setConsentimientoState] = useState<ConsentimientoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [noMigrado, setNoMigrado] = useState(false);

  const refresh = useCallback(async () => {
    if (!uid) {
      setConsentimientoState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { consentimiento: c, error } = await fetchConsentimientoCliente(uid);
    setNoMigrado(error === 'NO_MIGRADO');
    setConsentimientoState(c);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<ConsentimientoCtxValue>(
    () => ({
      consentimiento,
      firmado: consentimientoEstaFirmado(consentimiento),
      loading,
      noMigrado,
      refresh,
      setConsentimiento: (c: ConsentimientoRow) => setConsentimientoState(c),
    }),
    [consentimiento, loading, noMigrado, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
