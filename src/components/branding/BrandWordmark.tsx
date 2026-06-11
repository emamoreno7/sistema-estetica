import { brand } from '@/config/brand';

export type BrandWordmarkVariant = 'compact' | 'default';

export function BrandWordmark({ variant = 'default' }: { variant?: BrandWordmarkVariant }) {
  const isCompact = variant === 'compact';
  const titleLs = isCompact ? '0.14em' : '0.22em';
  const titleSize = isCompact ? '0.5625rem' : 'clamp(0.68rem, 1.95vw,0.845rem)';
  const sloganSize = isCompact ? '0.625rem' : 'clamp(0.72rem, 1.6vw, 0.895rem)';
  const maxTitle = isCompact ? '11rem' : '26rem';

  return (
    <div
      className={`flex flex-col ${isCompact ? 'items-start gap-px' : 'items-center gap-1'} text-center ${isCompact ? 'text-left' : ''}`}
    >
      <span
        className='text-serif-premium font-semibold uppercase leading-[1.18] tracking-normal'
        style={{
          color: 'var(--primary-navy)',
          letterSpacing: titleLs,
          fontSize: titleSize,
          maxWidth: maxTitle,
          fontVariantLigatures: 'common-ligatures',
        }}
      >
        {brand.businessName}
      </span>
      <span
        className='text-serif-premium font-normal italic leading-tight antialiased'
        style={{
          color: 'rgba(69,95,112,0.92)',
          fontSize: sloganSize,
          letterSpacing: isCompact ? '0.06em' : '0.1em',
        }}
      >
        Tu espacio personal
      </span>
    </div>
  );
}
