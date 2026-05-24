// Panel lateral de navegación
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../core/constants';

const NAV_CONFIG = [
  { to: '/',               label: 'Dashboard',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], end: true },
  { to: '/patients',       label: 'Pacientes',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR] },
  { to: '/appointments',   label: 'Citas',           roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR] },
  { to: '/reminders',      label: 'Recordatorios',   roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR] },
  { to: '/admin/branches', label: 'Sucursales',      roles: [USER_ROLES.ADMIN] },
  { to: '/admin/billing',  label: 'Facturación',     roles: [USER_ROLES.ADMIN] },
  { to: '/admin/supplies', label: 'Insumos',         roles: [USER_ROLES.ADMIN] },
  { to: '/doctor/console', label: 'Consola médica',  roles: [USER_ROLES.DOCTOR] },
  { to: '/patient/portal', label: 'Mi portal',       roles: [USER_ROLES.PATIENT] },
];

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-[#00B4D8] text-white' : 'text-[#0E4A8A] hover:bg-blue-50'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export function Sidebar({ open, onClose }) {
  const { user, logout, hasRole, currentBranchId } = useAuth();
  const visibleLinks = NAV_CONFIG.filter(link => link.roles.some(role => hasRole(role)));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-64 bg-white shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <img src="/logo.png" alt="MedIL CRM" className="h-14 w-auto" />
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Cerrar menú">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {user && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-sm font-semibold text-[#0E4A8A] truncate">{user.email}</p>
            <p className="text-xs text-[#00B4D8] capitalize">{user.role}</p>
            {currentBranchId && <p className="text-xs text-gray-500 mt-0.5">Sucursal: {user.fullName ?? currentBranchId}</p>}
          </div>
        )}

        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {visibleLinks.map(l => (
            <NavItem key={l.to} to={l.to} label={l.label} end={l.end} onClick={onClose} />
          ))}
        </nav>

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
