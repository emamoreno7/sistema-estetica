import { Mail, MessageCircle } from 'lucide-react';
import { assets } from '@/config/assets';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { brand } from '../../config/brand';
import { contact } from '../../config/contact';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function LandingFooter() {
  const mapsHref =
    `https://maps.google.com/?q=${encodeURIComponent(contact.address)}`;
  const emailHref = `mailto:${contact.email}`;

  return (
    <footer
      className="px-6 py-16 sm:px-10"
      style={{
        background: 'var(--bg-cream)',
        borderTop: '1px solid rgba(242,215,213,0.6)',
      }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <img
          src={assets.logo}
          alt={brand.businessName}
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

        <div className="h-px w-12 bg-[var(--primary-navy)]/15" />

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
              Ubicación
            </p>
            <a
             href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm leading-6 text-[var(--text-muted)] transition-colors hover:text-[var(--primary-navy)]"
            >
              {contact.address}
            </a>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
              Contacto
            </p>
            <div className="mt-2 flex flex-col items-center gap-1.5 sm:items-start">
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm leading-6 text-[var(--text-muted)] transition-colors hover:text-[var(--primary-navy)]"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
                @{contact.instagram}
              </a>

              <a
                href={emailHref}
                className="inline-flex items-center gap-1.5 text-sm leading-6 text-[var(--text-muted)] transition-colors hover:text-[var(--primary-navy)]"
              >
                <Mail className="h-3.5 w-3.5" />
                {contact.email}
              </a>

              <a
                href={buildWhatsAppHref('consulta general')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium leading-6 text-[var(--primary-navy)] transition-colors hover:text-[#25D366]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {contact.phoneDisplay}
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
              Horarios
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {contact.hours}
            </p>
          </div>
        </div>

        <div className="h-px w-12 bg-[var(--primary-navy)]/15" />

        <p className="text-[9px] uppercase tracking-[0.35em] text-[#A9A09A]">
          &copy; {new Date().getFullYear()} {brand.copyrightName}
        </p>
      </div>
    </footer>
  );
}
