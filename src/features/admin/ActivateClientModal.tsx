import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UserCheck, X } from 'lucide-react';
import type { PerfilClienteRow } from '@/lib/perfilCliente';
import { activateCliente } from '@/features/admin/adminApi';

type Props = {
  cliente: PerfilClienteRow | null;
  open: boolean;
  onClose: () => void;
  onActivated: () => void;
};

export default function ActivateClientModal({ cliente, open, onClose, onActivated }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) setErr(null);
  }, [open, cliente?.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente) return;
    setErr(null);
    setBusy(true);
    try {
      const { error } = await activateCliente(cliente.id);
      if (error) {
        setErr(error);
        return;
      }
      onActivated();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && cliente && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-[#003D5B]/35 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#F2D7D5]/70 bg-[#FDF8F5] p-8 shadow-2xl"
          >
            <button
              type="button"
              className="absolute right-5 top-5 rounded-full p-1.5 text-[#003D5B]/45 transition hover:bg-[#F2D7D5]/40 hover:text-[#003D5B]"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-[#F2D7D5]/55 to-[#BFC9A2]/35 p-3">
              <UserCheck className="h-7 w-7 text-[#003D5B]" />
            </div>
            <h2 className="text-serif-premium pr-10 text-xl font-bold text-[#003D5B]">
              Activar a {cliente.full_name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#7A746E]">
              Confirmá la activación del acceso al portal. El tratamiento elegido durante el alta se conserva únicamente en los
              metadatos de la cuenta hasta que definan tablas clínicas adicionales.
            </p>

            <form className="mt-6 space-y-5" onSubmit={(e) => void submit(e)}>
              {err && (
                <p className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">{err}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 rounded-full border border-[#003D5B]/15 bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#003D5B]"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={busy}
                  whileTap={{ scale: busy ? 1 : 0.99 }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#003D5B] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white shadow-lg disabled:opacity-55"
                  style={{ boxShadow: '0 12px 32px rgba(0,61,91,0.18)' }}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirmar activación
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
