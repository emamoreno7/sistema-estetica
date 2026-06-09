import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, UserRoundSearch } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { brand } from '../../../config/brand';

/** Vista mostrada cuando Supabase respondió con error benigno (sin fila / 400/406). */
export function PortalPerfilNotFoundFriendly() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  const waHref = buildWhatsAppHref('mi ficha en el portal');

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 pb-28"
      style={{ background: 'var(--bg-cream)' }}
    >
      <motion.div
        initial={{ opacity: 0, y 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[1.75rem] border border-[#F2D7D5]/65 bg-white/95 p-10 text-center shadow-xl"
      >
        <UserRoundSearch className="mx-auto mb-5 h-12 w-12 text-[#003D5B]/45" />
        <p className="text-serif-premium text-lg font-semibold text-[#003D5B]">Perfil no encontrado</p>
        <p className="mt-4 text-sm leading-relaxed text-[#7A746E]">
          No pudimos leer tu ficha en este momento de forma estable. Ya no repetimos solicitudes automáticas: suele pasar
          cuando aún no hay registro sincronizado o hubo una respuesta temporal del servidor (400/406). Si acabás de darte
          de alta, esperá activación por el {brand.supportLabel}.
        </p>
        <motion.a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          style={{ background: '#25D366', boxShadow: '0 12px 32px rgba(37,211,102,0.35)' }}
        >
          <MessageCircle className="h-5 w-5" />
          {brand.whatsappCtaLabel}
        </motion.a>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void handleLogout()}
          className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#003D5B]/55 underline underline-offset-4"
        >
          Salir y volver al inicio
        </motion.button>
      </motion.div>
      <WhatsAppFloatingButton forPortal />
    </div>
  );
}
