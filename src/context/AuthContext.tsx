import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  fetchPerfilClienteDetailed,
  type AccountStatus,
  type PerfilClienteRow,
} from '@/lib/perfilCliente';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  perfilCliente: PerfilClienteRow | null;
  perfilLoading: boolean;
  /** true cuando falló la lectura Supabase (red/permiso), distinto de “no hay fila”. */
  perfilFetchFailed: boolean;
  accountStatus: AccountStatus | null;
  refreshPerfil: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilCliente, setPerfilCliente] = useState<PerfilClienteRow | null>(null);
  const [perfilFetchFailed, setPerfilFetchFailed] = useState(false);
  /** true cuando Supabase respondió error benigno (p. ej. 400/406 / PGRST116): UX “perfil no encontrado”, sin ciclo tipo fetch_error. */
  const [perfilBenignMiss, setPerfilBenignMiss] = useState(false);
  const [perfilLoading, setPerfilLoading] = useState(false);

  const loadPerfil = useCallback(async (userId: string) => {
    setPerfilLoading(true);
    setPerfilFetchFailed(false);
    setPerfilBenignMiss(false);
    try {
      const { perfil, fetchFailed, missingBenign } = await fetchPerfilClienteDetailed(userId);
      setPerfilCliente(perfil);
      setPerfilFetchFailed(fetchFailed);
      setPerfilBenignMiss(missingBenign);
    } finally {
      setPerfilLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setLoading(false);
      setPerfilCliente(null);
      setPerfilFetchFailed(false);
      setPerfilBenignMiss(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setLoading(false);
      if (s?.user?.id) void loadPerfil(s.user.id);
      else {
        setPerfilCliente(null);
        setPerfilFetchFailed(false);
        setPerfilBenignMiss(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.id) void loadPerfil(s.user.id);
      else {
        setPerfilCliente(null);
        setPerfilFetchFailed(false);
        setPerfilBenignMiss(false);
        setPerfilLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadPerfil]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setPerfilCliente(null);
    setPerfilFetchFailed(false);
    setPerfilBenignMiss(false);
  }, []);

  const refreshPerfil = useCallback(async () => {
    const id = session?.user?.id;
    if (!id || !isSupabaseConfigured) return;
    await loadPerfil(id);
  }, [session?.user?.id, loadPerfil]);

  const accountStatus: AccountStatus | null = useMemo(() => {
    if (!session?.user) return null;
    if (perfilFetchFailed) return 'fetch_error';
    if (perfilBenignMiss) return 'profile_not_found';
    if (perfilCliente === null) return 'pending';
    return perfilCliente.status;
  }, [session?.user, perfilCliente, perfilFetchFailed, perfilBenignMiss]);

  const value = useMemo(
    () => ({
      session,
      loading,
      signOut,
      perfilCliente,
      perfilLoading,
      perfilFetchFailed,
      accountStatus,
      refreshPerfil,
    }),
    [
      session,
      loading,
      signOut,
      perfilCliente,
      perfilLoading,
      perfilFetchFailed,
      accountStatus,
      refreshPerfil,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
