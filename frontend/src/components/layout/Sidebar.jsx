// Panel lateral de navegación
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../core/constants';
import { Avatar } from '../../atoms/Avatar';
import { Logo } from '../../atoms/Logo';

const ICONS = {
  dashboard: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  patients: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  appointments: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  reminders: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  branches: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  billing: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-6 2h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  supplies: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  console: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  professionals: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  reports: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  portal: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  profile: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const NAV_CONFIG = [
  { to: '/',               label: 'Dashboard',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], end: true, iconKey: 'dashboard' },
  { to: '/profile',        label: 'Mi perfil',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT], iconKey: 'profile' },
  { to: '/patients',       label: 'Pacientes',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], iconKey: 'patients' },
  { to: '/appointments',   label: 'Citas',           roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], iconKey: 'appointments' },
  { to: '/reminders',      label: 'Recordatorios',   roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], iconKey: 'reminders' },
  { to: '/admin/branches',      label: 'Sucursales',    roles: [USER_ROLES.ADMIN], iconKey: 'branches' },
  { to: '/admin/professionals', label: 'Profesionales', roles: [USER_ROLES.ADMIN], iconKey: 'professionals' },
  { to: '/admin/billing',       label: 'Facturación',   roles: [USER_ROLES.ADMIN], iconKey: 'billing' },
  { to: '/admin/supplies',      label: 'Insumos',       roles: [USER_ROLES.ADMIN], iconKey: 'supplies' },
  { to: '/admin/reports',       label: 'Reportes',      roles: [USER_ROLES.ADMIN], iconKey: 'reports' },
  { to: '/doctor/console', label: 'Consola médica',  roles: [USER_ROLES.DOCTOR], iconKey: 'console' },
  { to: '/patient/portal', label: 'Mi portal',       roles: [USER_ROLES.PATIENT], iconKey: 'portal' },
];

function NavItem({ to, label, iconKey, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-primary text-white animate-fade-in' : 'text-navy hover:bg-blue-50'
        }`
      }
    >
      {ICONS[iconKey]}
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar({ open, onClose }) {
  const { user, logout, hasRole, currentBranchId } = useAuth();
  const visibleLinks = NAV_CONFIG.filter(link => link.roles.some(role => hasRole(role)));

  if (!open) return null;

  const photoUrl = user ? localStorage.getItem(`medil_profile_photo_${user.email}`) : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-64 bg-white shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Logo className="text-xl" />
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar menú">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {user && (
          <NavLink
            to="/profile"
            onClick={onClose}
            title="Ver mi perfil"
            className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex gap-3 items-center hover:bg-gray-100 transition-colors"
          >
            <Avatar name={user.fullName || user.email} photoUrl={photoUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy truncate">{user.fullName || 'Usuario'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <div className="flex gap-2 items-center mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  user.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                  user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-primary'
                }`}>
                  {user.role === 'admin' ? 'Administrador' :
                   user.role === 'doctor' ? 'Médico' : 'Paciente'}
                </span>
                {currentBranchId && (
                  <span className="text-[10px] text-gray-400 font-semibold truncate">
                    Sucursal: {currentBranchId}
                  </span>
                )}
              </div>
            </div>
          </NavLink>
        )}

        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {visibleLinks.map(l => (
            <NavItem key={l.to} to={l.to} label={l.label} iconKey={l.iconKey} end={l.end} onClick={onClose} />
          ))}
        </nav>

        {/* Link al portal público */}
        <div className="px-4 pb-2">
          <a
            href="/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary-pale rounded-lg transition-colors font-medium"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Portal público</span>
          </a>
        </div>

        {user && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
