// Componente raíz — Root component
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { useAuth }      from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar }     from './components/layout/Sidebar';
import { TopBar }      from './components/layout/TopBar';
import { USER_ROLES }  from './core/constants';

// Páginas de la app
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Patients       from './pages/Patients';
import PatientDetail  from './pages/PatientDetail';
import Appointments   from './pages/Appointments';
import Reminders      from './pages/Reminders';
import Branches       from './pages/admin/Branches';
import Billing        from './pages/admin/Billing';
import Supplies       from './pages/admin/Supplies';
import DoctorConsole  from './pages/doctor/DoctorConsole';
import PatientPortal  from './pages/patient/PatientPortal';

// Páginas públicas (sin autenticación)
import LandingPage  from './pages/public/LandingPage';
import ClinicDetail from './pages/public/ClinicDetail';
import RegisterPage from './pages/public/RegisterPage';

// Ruta raíz: Landing si no autenticado, Dashboard si autenticado
function HomeRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR]}>
      <Dashboard />
    </ProtectedRoute>
  );
}

// Layout principal con TopBar y Sidebar
function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TopBar onMenuClick={() => setOpen(o => !o)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/"         element={<HomeRoute />} />

          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR]}>
              <Patients />
            </ProtectedRoute>
          } />
          <Route path="/patients/:id" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR]}>
              <PatientDetail />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR]}>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/reminders" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR]}>
              <Reminders />
            </ProtectedRoute>
          } />

          {/* Solo admin */}
          <Route path="/admin/branches" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <Branches />
            </ProtectedRoute>
          } />
          <Route path="/admin/billing" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/admin/supplies" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <Supplies />
            </ProtectedRoute>
          } />

          {/* Solo doctor */}
          <Route path="/doctor/console" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
              <DoctorConsole />
            </ProtectedRoute>
          } />

          {/* Solo paciente */}
          <Route path="/patient/portal" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
              <PatientPortal />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

// Rutas públicas sin sidebar + rutas de app
function AppRoutes() {
  return (
    <Routes>
      <Route path="/portal"      element={<LandingPage />} />
      <Route path="/clinica/:id" element={<ClinicDetail />} />
      <Route path="/registro"    element={<RegisterPage />} />
      <Route path="*"            element={<AppLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
