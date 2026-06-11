import { asset } from '@/lib/asset';

export const assets = {
  logo: asset('logo-generic.svg'),
  favicon: asset('favicon.svg'),
  servicePlaceholder: asset('service-placeholder.svg'),
  casoPlaceholderBefore: asset('casos/placeholder-antes.jpg'),
  casoPlaceholderAfter: asset('casos/placeholder-despues.jpg'),
  signupBg: asset('signup-bg.jpg'),
  heroPoster: asset('hero-poster.jpg'),
} as const;
