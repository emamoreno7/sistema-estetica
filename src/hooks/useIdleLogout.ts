import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { clearLocalAppData } from '@/lib/clearLocalAppData';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const DEFAULT_IDLE_MS = 15 * 60 * 1000;
const THROTTLE_MS = 1000;

/**
 * Tras `idleMs` sin actividad (ratón, teclado, toque o clic), cierra sesión en Supabase y navega a /login.
 */
export function useIdleLogout(idleMs: number = DEFAULT_IDLE_MS) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastThrottleRef = useRef(0);

  const armTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!session || !isSupabaseConfigured) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void (async () => {
        await supabase.auth.signOut();
        await clearLocalAppData();
        navigate('/login', { replace: true });
      })();
    }, idleMs);
  }, [session, idleMs, navigate]);

  useEffect(() => {
    if (!session || !isSupabaseConfigured) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    armTimer();

    const onActivity = () => {
      const now = Date.now();
      if (now - lastThrottleRef.current < THROTTLE_MS) return;
      lastThrottleRef.current = now;
      armTimer();
    };

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener('mousemove', onActivity, opts);
    window.addEventListener('mousedown', onActivity, opts);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity, opts);
    window.addEventListener('touchstart', onActivity, opts);

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('touchstart', onActivity);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session, armTimer]);
}
