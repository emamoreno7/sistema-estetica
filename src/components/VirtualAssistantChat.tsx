import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { brand } from '../config/brand';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  kind?: 'processing';
};

const GREETING =
  `¡Hola! Soy tu ${brand.assistantName}. ¿Tenés dudas sobre algún tratamiento o cuidado corporal?`;

const PROCESSING_TEXT =
  'Estoy procesando tu consulta, mientras tanto podés hablarnos directamente por WhatsApp para una respuesta inmediata.';

const QUICK_ACTIONS: { label: string; response: string }[] = [
  {
    label: 'Cuidados Post-Crio',
    response:
      `Después de la criolipólisis te recomendamos hidratación abundante, movimiento suave y evitar alcohol o comidas muy pesadas el mismo día. Tu ${brand.supportLabel} te indica los detalles según tu sesión. ¿Querés que coordinemos o por WhatsApp?`,
  },
  {
    label: '¿Duele el Láser?',
    response:
      'La mayoría de nuestros protocolos láser se sienten como calorcito o leve pinchazo; siempre ajustamos la energía a tu comodidad. Si tenés piel sensible, lo conversamos antes de empezar para que estés tranquila.',
  },
  {
    label: 'Turnos Disponibles',
    response:
      'Los horarios se actualizan cada día. Escribinos por WhatsApp con el tratamiento que te interesa y te confirmamos la próxima fecha libre al instante.',
  },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function VirtualAssistantChat({
  whatsappHref,
  forPortal = false,
}: {
  whatsappHref: (serviceName: string) => string;
  forPortal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: uid(), role: 'assistant', text: GREETING }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, scrollToBottom]);

  const pushAssistant = (text: string, kind?: ChatMessage['kind']) => {
    setMessages(prev => [...prev, { id: uid(), role: 'assistant', text, kind }]);
  };

  const pushUser = (text: string) => {
    setMessages(prev => [...prev, { id: uid(), role: 'user', text }]);
  };

  const handleQuick = (label: string) => {
    const action = QUICK_ACTIONS.find(q => q.label === label);
    if (!action) return;
    pushUser(label);
    pushAssistant(action.response);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    pushUser(t);
    setDraft('');
    pushAssistant(PROCESSING_TEXT, 'processing');
  };

  const fabPosition = forPortal
    ? 'bottom-24 right-[5.75rem] sm:bottom-28 sm:right-[6.25rem] lg:bottom-8 lg:right-[6.25rem]'
    : 'bottom-6 right-[5.75rem] sm:bottom-8 sm:right-[6.25rem]';

  const panelPosition = forPortal
    ? 'bottom-[7.25rem] right-4 sm:bottom-[8rem] sm:right-5 lg:bottom-[5.5rem]'
    : 'bottom-[5.5rem] right-4 sm:bottom-[6.5rem] sm:right-5';

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`fixed z-[99] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-shadow hover:shadow-xl ${fabPosition}`}
        style={{
          background: 'linear-gradient(145deg, var(--primary-navy) 0%, #1a5a7a 100%)',
          boxShadow: '0 8px 28px rgba(0,61,91,0.35)',
        }}
        aria-expanded={open}
        aria-label={open ? `Cerrar ${brand.assistantName}` : `Abrir ${brand.assistantName}`}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="h-6 w-6" strokeWidth={2} /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed z-[99] flex max-h-[min(420px,70vh)] w-[min(calc(100vw-2rem),360px)] flex-col overflow-hidden rounded-2xl border shadow-2xl ${panelPosition}`}
            style={{
              background: 'var(--bg-cream, var(--bg-cream))',
              borderColor: 'rgba(242,215,213,0.85)',
              boxShadow: '0 20px 50px rgba(0,61,91,0.15)',
            }}
          >
            <div
              className="flex items-center gap-2 border-b px-4 py-3"
              style={{ borderColor: 'rgba(242,215,213,0.6)', background: 'rgba(0,61,91,0.04)' }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: 'var(--accent-rose)' }}
              >
                <MessageCircle className="h-4 w-4" style={{ color: 'var(--primary-navy)' }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary-navy)' }}>
                  {brand.assistantName}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(0,61,91,0.55)' }}>
                  Respuestas orientativas · no sustituyen consulta médica
                </p>
              </div>
            </div>

            <div
              ref={listRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 min-h-[200px] max-h-[240px]"
            >
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                    ? 'ml-auto rounded-br-md'
                      : 'mr-auto rounded-bl-md'
                  }`}
                  style={
                    m.role === 'user'
                      ? { background: 'var(--primary-navy)', color: '#fff' }
                      : { background: 'rgba(242,215,213,0.45)', color: 'var(--primary-navy)' }
                  }
                >
                  <p>{m.text}</p>
                  {m.role === 'assistant' && m.kind === 'processing' && (
                    <a
                      href={whatsappHref('consulta general')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-semibold underline underline-offset-2"
                      style={{ color: '#25D366' }}
                    >
                      Abrir WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t px-3 py-2" style={{ borderColor: 'rgba(242,215,213,0.6)' }}>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide" style={{ color: 'rgba(0,61,91,0.5)' }}>
                Respuestas rápidas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map(q => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => handleQuick(q.label)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors hover:opacity-90"
                    style={{
                      borderColor: 'rgba(0,61,91,0.2)',
                      color: 'var(--primary-navy)',
                      background: 'rgba(253,248,245,0.9)',
                    }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t p-3" style={{ borderColor: 'rgba242,215,213,0.6)' }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Escribí tu consulta..."
                className="min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--primary-navy)]/20"
                style={{
                  borderColor: 'rgba(0,61,91,0.15)',
                  background: '#fff',
                  color: 'var(--primary-navy)',
                }}
              />
              <button
                type="submit"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-95"
                style={{ background: 'var(--primary-navy)' }}
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

}
