import { Calendar, Home, Sparkles, TrendingUp, User } from 'lucide-react';
import type { PortalNavItem } from './types';

export const portalNavItems: PortalNavItem[] = [
  { id: 'inicio', label: 'Inicio', shortLabel: 'Inicio', icon: Home },
  { id: 'tratamiento', label: 'Mi Tratamiento', shortLabel: 'Tratam.', icon: Sparkles },
  { id: 'evolucion', label: 'Evolución', shortLabel: 'Evolución', icon: TrendingUp },
  { id: 'citas', label: 'Mis Citas', shortLabel: 'Citas', icon: Calendar },
  { id: 'perfil', label: 'Mi Perfil', shortLabel: 'Perfil', icon: User },
];
