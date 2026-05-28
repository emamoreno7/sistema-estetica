import { type ReactNode } from 'react';
import { useIdleLogout } from '@/hooks/useIdleLogout';

type Props = { children: ReactNode };

export function RootLayout({ children }: Props) {
  useIdleLogout();
  return children;
}
