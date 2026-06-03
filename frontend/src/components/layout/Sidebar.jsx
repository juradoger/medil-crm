// Panel lateral de navegación
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Bell, Building2, Receipt,
  Package, ClipboardList, Stethoscope, BarChart3, HeartPulse, User,
  Globe, X, LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../core/constants';
import { Avatar } from '../../atoms/Avatar';
import { Logo } from '../../atoms/Logo';

// Mapa de iconos de navegación (lucide-react) — Navigation icon map (lucide-react)
const ICONS = {
  dashboard:     LayoutDashboard,
  patients:      Users,
  appointments:  Calendar,
  reminders:     Bell,
  branches:      Building2,
  billing:       Receipt,
  supplies:      Package,
  console:       ClipboardList,
  professionals: Stethoscope,
  admins:        ShieldCheck,
  reports:       BarChart3,
  portal:        HeartPulse,
  profile:       User,
};

const NAV_CONFIG = [
  { to: '/',               label: 'Dashboard',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], end: true, iconKey: 'dashboard' },
  { to: '/profile',        label: 'Mi perfil',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT], iconKey: 'profile' },
  { to: '/patients',       label: 'Pacientes',       roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], iconKey: 'patients' },
  { to: '/appointments',   label: 'Citas',           roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], iconKey: 'appointments' },
  { to: '/reminders',      label: 'Recordatorios',   roles: [USER_ROLES.ADMIN, USER_ROLES.DOCTOR], iconKey: 'reminders' },
  { to: '/admin/branches',      label: 'Sucursales',    roles: [USER_ROLES.ADMIN], iconKey: 'branches' },
  { to: '/admin/professionals', label: 'Profesionales', roles: [USER_ROLES.ADMIN], iconKey: 'professionals' },
  { to: '/admin/admins',        label: 'Administradores', roles: [USER_ROLES.ADMIN], iconKey: 'admins' },
  { to: '/admin/billing',       label: 'Facturación',   roles: [USER_ROLES.ADMIN], iconKey: 'billing' },
  { to: '/admin/supplies',      label: 'Insumos',       roles: [USER_ROLES.ADMIN], iconKey: 'supplies' },
  { to: '/admin/reports',       label: 'Reportes',      roles: [USER_ROLES.ADMIN], iconKey: 'reports' },
  { to: '/doctor/console', label: 'Consola médica',  roles: [USER_ROLES.DOCTOR], iconKey: 'console' },
  { to: '/patient/portal', label: 'Mi portal',       roles: [USER_ROLES.PATIENT], iconKey: 'portal' },
];

function NavItem({ to, label, iconKey, end, onClick }) {
  const Icon = ICONS[iconKey];
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
      {Icon && <Icon size={20} strokeWidth={2} className="shrink-0" />}
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
            <X size={20} strokeWidth={2} />
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
            <Globe size={20} strokeWidth={2} className="shrink-0" />
            <span>Portal público</span>
          </a>
        </div>

        {user && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} strokeWidth={2} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
