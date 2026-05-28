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
    <BrowserRouter>
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
