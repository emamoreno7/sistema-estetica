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
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import type { CitaClienteRow } from '@/lib/citasApi';
import { fetchProximaCitaCliente } from '@/lib/citasApi';

type CitasDataValue = {
  proximaCita: CitaClienteRow | null;
  proximaLoading: boolean;
  proximaError: string | null;
  /** Re-ejecuta la consulta (tras reservar, etc.). */
  refreshProximaCita: () => Promise<void>;
  /** última guardada esta sesión (para UI hasta que arrive refresh). */
  ultimaReserva: CitaClienteRow | null;
  setUltimaReserva: (c: CitaClienteRow | null) => void;
};

const CitasDataCtx = createContext<CitasDataValue | null>(null);

export function CitasDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const uid = session?.user?.id ?? null;

  const [proximaCita, setProximaCita] = useState<CitaClienteRow | null>(null);
  const [proximaLoading, setProximaLoading] = useState(false);
  const [proximaError, setProximaError] = useState<string | null>(null);
  const [ultimaReserva, setUltimaReserva] = useState<CitaClienteRow | null>(null);

  const refreshProximaCita = useCallback(async () => {
    if (!uid || !isSupabaseConfigured) {
      setProximaCita(null);
      setProximaError(null);
      return;
    }
    setProximaLoading(true);
    setProximaError(null);
    try {
      const { cita, error } = await fetchProximaCitaCliente(uid);
      if (error) {
        setProximaError(error);
        setProximaCita(null);
      } else {
        setProximaCita(cita);
      }
    } finally {
      setProximaLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refreshProximaCita();
  }, [refreshProximaCita]);

  const value = useMemo(
    () => ({
      proximaCita,
      proximaLoading,
      proximaError,
      refreshProximaCita,
      ultimaReserva,
      setUltimaReserva,
    }),
    [proximaCita, proximaLoading, proximaError, refreshProximaCita, ultimaReserva]
  );

  return <CitasDataCtx.Provider value={value}>{children}</CitasDataCtx.Provider>;
}

export function useCitasData(): CitasDataValue {
  const v = useContext(CitasDataCtx);
  if (!v) throw new Error('useCitasData debe usarse dentro de CitasDataProvider');
  return v;
}
