import { Mail, MessageCircle } from 'lucide-react';
import { buildWhatsAppHref } from '@/lib/whatsapp';

// Teléfono internacional del desarrollador (sin "+" para el link de wa.me)
const DEV_PHONE = '5492634340284';
const DEV_PHONE_DISPLAY = '+54 9 2634 340284';
const DEV_EMAIL = 'emamoreno@icloud.com';

export function LandingFooter() {
  return (
    <footer
      className="px-6 py-16 sm:px-10"
      style={{ background: 'var(--bg-cream)', borderTop: '1px solid rgba(242,215,213,0.6)' }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <img
          src="/logo-amore-v2.png"
          alt="AMORE Centro Di Bellezza"
          style={{
            height: '72px',
            width: 'auto',
            display: 'block',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            filter: 'drop-shadow(0 6px 14px rgba(0,61,91,0.10))',
          }}
        />

        <div className="h-px w-12 bg-[#003D5B]/15" />

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A746E]">Ubicación</p>
            <p className="mt-2 text-sm leading-6 text-[#7A746E]">
              Rivadavia
              <br />
              Mendoza, Argentina
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A746E]">Redes</p>
            <a
              href="https://instagram.com/amore.mendoza"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm leading-6 text-[#7A746E] underline underline-offset-4 decoration-[#8A8178]/20 transition-colors hover:text-[#003D5B] hover:decoration-[#4A443F]/40"
            >
              @amore.mendoza
            </a>
            <a
              href={buildWhatsAppHref('consulta general')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium leading-6 text-[#003D5B] underline underline-offset-4 decoration-[#25D366]/40 transition-colors hover:text-[#25D366]"
            >
              WhatsApp
            </a>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7A746E]">Horarios</p>
            <p className="mt-2 text-sm leading-6 text-[#7A746E]">
              Lunes a Sábado
              <br />
              Atención Personalizada
            </p>
          </div>
        </div>

        <div className="h-px w-12 bg-[#003D5B]/15" />

        <p className="text-[9px] uppercase tracking-[0.35em] text-[#A9A09A]">
          &copy; {new Date().getFullYear()} Amore Centro Di Bellezza
        </p>

        {/* ─── Firma del desarrollador ─── */}
        <div className="mt-8 w-full">
          <div
            className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            style={{
              background: 'linear-gradient(135deg, #0A1628 0%, #0E1F36 100%)',
              boxShadow: '0 14px 40px -18px rgba(0,61,91,0.45)',
            }}
          >
            {/* Logo + nombre */}
            <a
              href={`mailto:${DEV_EMAIL}`}
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
              aria-label="ByDotCom — Software & Web Solutions"
            >
              <img
                src="/bydotcom-logo.png"
                alt="ByDotCom"
                className="h-12 w-12 rounded-lg object-cover"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(56,189,248,0.35))' }}
              />
              <div className="text-left">
                <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-cyan-300/80">
                  Desarrollado por
                </p>
                <p className="mt-0.5 text-base font-semibold tracking-tight text-white">
                  ByDotCom
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/60">
                  Software &amp; Web Solutions
                </p>
              </div>
            </a>

            {/* Contacto */}
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <a
                href={`https://wa.me/${DEV_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/85 transition-colors hover:text-cyan-300"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {DEV_PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${DEV_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/85 transition-colors hover:text-cyan-300"
              >
                <Mail className="h-3.5 w-3.5" />
                {DEV_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
