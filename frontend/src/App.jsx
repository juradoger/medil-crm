// Componente raíz — Root component
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { USER_ROLES } from './core/constants';

import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Patients     from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Appointments from './pages/Appointments';
import Reminders    from './pages/Reminders';
import Branches     from './pages/admin/Branches';
import Billing      from './pages/admin/Billing';
import Supplies     from './pages/admin/Supplies';
import DoctorConsole from './pages/doctor/DoctorConsole';
import PatientPortal from './pages/patient/PatientPortal';

// Links de navegación por rol — Navigation links by role
const NAV_CONFIG = [
  { to: '/', label: 'Dashboard',                       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], end: true },
  { to: '/patients',        label: 'Pacientes — Patients',         roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR] },
  { to: '/appointments',    label: 'Citas — Appointments',         roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR] },
  { to: '/reminders',       label: 'Recordatorios — Reminders',    roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR] },
  { to: '/admin/branches',  label: 'Sucursales — Branches',        roles: [USER_ROLES.ADMIN] },
  { to: '/admin/billing',   label: 'Facturación — Billing',        roles: [USER_ROLES.ADMIN] },
  { to: '/admin/supplies',  label: 'Insumos — Supplies',           roles: [USER_ROLES.ADMIN] },
  { to: '/doctor/console',  label: 'Consola Médica — Console',     roles: [USER_ROLES.DOCTOR] },
  { to: '/patient/portal',  label: 'Mi Portal — My Portal',        roles: [USER_ROLES.PATIENT] },
];

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#00B4D8] text-white'
            : 'text-[#0E4A8A] hover:bg-blue-50'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

// Panel lateral de navegación — Navigation sidebar panel
function Sidebar({ open, onClose }) {
  const { user, logout, hasRole, currentBranchId } = useAuth();

  const visibleLinks = NAV_CONFIG.filter(link =>
    link.roles.some(role => hasRole(role))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Fondo semitransparente — semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel lateral — side panel */}
      <div className="relative w-64 bg-white shadow-2xl flex flex-col">

        {/* Cabecera del sidebar — sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <img src="/logo.png" alt="MedIL CRM" className="h-14 w-auto" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú — Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info del usuario — User info */}
        {user && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-sm font-semibold text-[#0E4A8A] truncate">{user.email}</p>
            <p className="text-xs text-[#00B4D8] capitalize">{user.role}</p>
            {currentBranchId && (
              <p className="text-xs text-gray-500 mt-0.5">
                Sucursal — Branch: {currentBranchId}
              </p>
            )}
          </div>
        )}

        {/* Links de navegación — navigation links */}
        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {visibleLinks.map(l => (
            <NavItem key={l.to} to={l.to} label={l.label} end={l.end} onClick={onClose} />
          ))}
        </nav>

        {/* Botón logout al fondo — Logout button at bottom */}
        {user && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión — Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Layout principal con topbar y sidebar — Main layout with topbar and sidebar
function AppLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Topbar — siempre visible — always visible */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
        <NavLink to="/" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="MedIL CRM" className="h-16 w-auto" />
        </NavLink>

        {isAuthenticated && (
          <button
            onClick={() => setOpen(o => !o)}
            className="p-2 rounded-lg text-[#0E4A8A] hover:bg-blue-50 transition-colors"
            aria-label="Abrir menú — Open menu"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </header>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Contenido principal — main content */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Ruta pública — Public route */}
          <Route path="/login" element={<Login />} />

          {/* Rutas admin + doctor — Admin + Doctor routes */}
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

          {/* Rutas solo admin — Admin-only routes */}
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

          {/* Rutas solo doctor — Doctor-only routes */}
          <Route path="/doctor/console" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
              <DoctorConsole />
            </ProtectedRoute>
          } />

          {/* Rutas solo paciente — Patient-only routes */}
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
