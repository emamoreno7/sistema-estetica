import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import VirtualAssistantChat from '@/components/VirtualAssistantChat';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import ClientLoginForm from './ClientLoginForm';

export default function ClientLoginPage() {
  return (
    <div className="relative min-h-screen px-5 py-12 sm:px-8" style={{ background: '#FDF8F5' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-0 top-0 h-96 w-96 rounded-full blur-3xl opacity-40"
          style={{ background: 'rgba(242,215,213,0.6)' }}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-md">
        <Link
          to="/"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#003D5B]/65 underline underline-offset-4"
        >
          ← Inicio
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[1.75rem] border bg-white/80 p-8 shadow-xl backdrop-blur-sm"
          style={{ borderColor: 'rgba(242,215,213,0.65)' }}
        >
          <h1 className="text-serif-premium text-2xl font-light text-[#003D5B]">Bienvenida de nuevo</h1>
          <p className="mt-2 text-sm text-[#003D5B]/60">
            Ingresá con el mismo correo y contraseña que usaste al registrarte.
          </p>
          <div className="mt-8">
            <ClientLoginForm />
          </div>
        </motion.div>
      </div>
      <VirtualAssistantChat whatsappHref={buildWhatsAppHref} />
      <WhatsAppFloatingButton />
    </div>
  );
}
