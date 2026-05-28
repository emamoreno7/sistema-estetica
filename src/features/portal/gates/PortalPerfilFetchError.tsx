import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/** Vista mostrada cuando la lectura de Supabase falló (red / permiso). */
export function PortalPerfilFetchError() {
  const { refreshPerfil, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'var(--bg-cream)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[1.75rem] border border-[#F2D7D5]/65 bg-white/95 p-10 text-center shadow-xl"
      >
        <Shield className="mx-auto mb-4 h-10 w-10 text-[#003D5B]/55" />
        <p className="text-serif-premium text-lg font-semibold text-[#003D5B]">
          No pudimos cargar tu ficha cliente
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#7A746E]">
          La conexión con Supabase falló o no tenés permiso de lectura. No mostramos datos de demostración. Volvé a
          intentarlo o iniciá sesión de nuevo.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void refreshPerfil()}
            className="rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            style={{ background: 'var(--primary-navy,#003D5B)' }}
          >
            Reintentar
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              await signOut();
              navigate('/ingreso', { replace: true });
            }}
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#003D5B]/55 underline underline-offset-4"
          >
            Cambiar cuenta
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
