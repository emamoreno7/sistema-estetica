import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VirtualAssistantChat from '@/components/VirtualAssistantChat';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { buildWhatsAppHref } from '@/lib/whatsapp';

/** Vista mostrada cuando el equipo bloqueó el acceso al portal. */
export function AccountBlockedPortal() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  const waHref = buildWhatsAppHref('acceso a mi cuenta');

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-cream)' }}>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ background: 'var(--bg-cream)' }}
      >
        <div
          className="absolute -left-32 top-24 h-80 w-80 rounded-full blur-3xl opacity-90"
          style={{ background: 'rgba(242,215,213,0.35)' }}
        />
        <div
          className="absolute -right-36 bottom-0 h-96 w-96 rounded-full blur-3xl opacity-80"
          style={{ background: 'rgba(191,201,162,0.22)' }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-28 pt-12 lg:pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-[1.75rem] p-10 text-center shadow-xl"
          style={{
            border: '1px solid rgba(0,61,91,0.12)',
            background: 'rgba(253,248,245,0.98)',
          }}
        >
          <Shield className="mx-auto mb-5 h-12 w-12 text-[var(--primary-navy)]/70" />
          <h1 className="text-serif-premium text-xl font-bold text-[var(--primary-navy)]">
            Consultá tu acceso por WhatsApp
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            Tu cuenta requiere atención del equipo antes de usar el portal. Escribinos y te ayudamos a regularizar tu
            acceso cuanto antes.
          </p>
          <motion.a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white"
            style={{ background: '#25D366', boxShadow: '0 12px 32px rgba(37,211,102,0.35)' }}
          >
            <MessageCircle className="h-5 w-5" />
            Contactar por WhatsApp
          </motion.a>
          <motion.button
            type="button"
            onClick={handleLogout}
            className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--primary-navy)]/45 underline underline-offset-4"
          >
            Salir del portal
          </motion.button>
        </motion.div>
      </div>
      <VirtualAssistantChat whatsappHref={buildWhatsAppHref} forPortal />
      <WhatsAppFloatingButton forPortal />
    </div>
  );
}
