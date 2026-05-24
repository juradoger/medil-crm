// Componente raíz — Root component
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { USER_ROLES } from './core/constants';

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

// Layout principal — Main layout
function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TopBar onMenuClick={() => setOpen(o => !o)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Ruta pública — Public route */}
          <Route path="/login" element={<Login />} />

          {/* Admin + Doctor */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR]}>
              <Dashboard />
            </ProtectedRoute>
          } />
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

          {/* Solo admin — Admin only */}
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

          {/* Solo doctor — Doctor only */}
          <Route path="/doctor/console" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
              <DoctorConsole />
            </ProtectedRoute>
          } />

          {/* Solo paciente — Patient only */}
          <Route path="/patient/portal" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
              <PatientPortal />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
