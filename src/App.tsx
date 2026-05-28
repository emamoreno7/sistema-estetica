import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CitasDataProvider } from '@/context/CitasDataContext';
import { RootLayout } from '@/components/RootLayout';
import { LandingRoute } from '@/features/landing/LandingRoute';
import AccessDeniedPage from '@/features/auth/AccessDeniedPage';
import ClientLoginPage from '@/features/auth/ClientLoginPage';
import ClientSignupPage from '@/features/auth/ClientSignupPage';
import { PortalGate } from '@/features/portal/PortalGate';
import AdminPage from '@/features/admin/AdminPage';

// Si el sitio se sirve en subpath (ej. GitHub Pages: /Estetica-Gestion/),
// Vite expone import.meta.env.BASE_URL con trailing slash. React Router
// quiere el basename sin trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/acceso" element={<AccessDeniedPage />} />
      <Route path="/ingreso" element={<ClientLoginPage />} />
      <Route path="/login" element={<ClientLoginPage />} />
      <Route path="/unete" element={<ClientSignupPage />} />
      <Route path="/portal" element={<PortalGate />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <CitasDataProvider>
          <RootLayout>
            <AppRoutes />
          </RootLayout>
        </CitasDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
