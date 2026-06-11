import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VirtualAssistantChat from '@/components/VirtualAssistantChat';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { brand } from '../../../config/brand';

/** Vista mostrada cuando la cuenta aún no fue activada por el equipo. */
export function PendingActivationPortal() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-cream)' }}>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ background: 'var(--bg-cream)' }}
      >
        <div
          className="absolute -left-40 -top-40 h-96 w-96 rounded-full blur-3xl"
          style={{ background: 'rgba(242,215,213,0.45)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl"
          style={{ background: 'rgba(191,201,162,0.30)' }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-28 pt-12 sm:px-10 lg:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md overflow-hidden rounded-[1.75rem] p-10 text-center shadow-2xl"
          style={{
            border: '1px solid rgba(242,215,213,0.55)',
            background: 'rgba(253,248,245,0.96)',
            boxShadow: '0 28px 80px rgba(0,61,91,0.12)',
          }}
        >
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem]"
            style={{ background: 'linear-gradient(135deg, rgba(242,215,213,0.45), rgba(191,201,162,0.4))' }}
          >
            <Sparkles className="h-10 w-10 text-[var(--primary-navy)]" />
          </div>
          <h1 className="text-serif-premium mb-4 text-xl font-bold text-[var(--primary-navy)]">
            Cuenta pendiente de activación
          </h1>
          <p className="text-serif-premium text-[15px] font-semibold leading-relaxed text-[var(--primary-navy)]">
            ¡Hola! Tu cuenta está en proceso de activación. Un administrador de {brand.shortName} verificará tus datos y te
            avisaremos por WhatsApp en cuanto puedas acceder a tu portal.
          </p>
     <p className="mt-6 flex items-start justify-center gap-2 rounded-2xl border border-[var(--accent-sage)]/40 bg-[var(--accent-sage)]/10 px-5 py-4 text-left text-xs leading-relaxed text-[var(--primary-navy)]/90">
            <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-rose)]" />
            Es un paso habitual: nos aseguramos de que tus datos coincidan con recepción para cuidarte con la mejor
            experiencia desde el día uno.
          </p>
          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="mt-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--primary-navy)]/50 underline underline-offset-4 hover:text-[var(--primary-navy)]/75"
          >
            Cerrar sesión y volver al inicio
          </motion.button>
        </motion.div>
      </div>
      <VirtualAssistantChat whatsappHref={buildWhatsAppHref} forPortal />
      <WhatsAppFloatingButton forPortal />
    </div>
  );
}
