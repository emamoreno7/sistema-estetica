import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { usePortalCliente } from '@/context/PortalClienteContext';
import { buildWhatsAppHref } from '@/lib/whatsapp';

type Props = {
  title: string;
  paragraph: string | ReactNode;
  children?: ReactNode;
};

/** Placeholder reutilizable cuando el cliente aún no tiene tratamiento/plan activo. */
export function PortalTreatmentEmptyPlaceholder({ title, paragraph, children }: Props) {
  const { tratamientoInteresLabel } = usePortalCliente();
  const waHref = buildWhatsAppHref('mi tratamiento en el portal');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg overflow-hidden rounded-3xl px-8 py-12 text-center shadow-xl"
      style={{
        border: '1px solid rgba(242,215,213,0.65)',
        background: 'rgba(253,248,245,0.94)',
        boxShadow: '0 24px 64px rgba(0,61,91,0.08)',
      }}
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(242,215,213,0.45), rgba(191,201,162,0.35))',
        }}
      >
        <Sparkles className="h-8 w-8 text-[#003D5B]" />
      </div>
      <h2 className="text-serif-premium text-xl font-bold text-[#003D5B]">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-[#7A746E]">{paragraph}</div>
      {children}
      {tratamientoInteresLabel ? (
        <p className="mt-5 rounded-2xl border border-[#BFC9A2]/40 bg-[#BFC9A2]/10 px-4 py-3 text-xs text-[#003D5B]">
          Tu interés: <strong>{tratamientoInteresLabel}</strong>. Te guiaremos cuando activemos tu plan.
        </p>
      ) : null}
      <motion.a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg transition-all"
        style={{ background: 'var(--primary-navy)', boxShadow: '0 12px 32px rgba(0,61,91,0.2)' }}
      >
        <MessageCircle className="h-4 w-4" />
        Hablar por WhatsApp
      </motion.a>
    </motion.div>
  );
}
