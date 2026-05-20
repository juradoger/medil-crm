// Componente raíz con enrutamiento y navegación principal — Root component with routing and main navigation
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';

import Dashboard    from './pages/Dashboard';
import Patients     from './pages/Patients';
import Appointments from './pages/Appointments';
import Reminders    from './pages/Reminders';
import PatientDetail from './pages/PatientDetail';

const NAV_LINKS = [
  { to: '/',            label: 'Dashboard'      },
  { to: '/patients',    label: 'Pacientes'      },
  { to: '/appointments',label: 'Citas'          },
  { to: '/reminders',   label: 'Recordatorios'  },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === '/'}
      className={({ isActive }) =>
        `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-accent text-white'
            : 'text-primary hover:bg-blue-50'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <nav className="bg-white border-b border-gray-200 shadow-sm">

        {/* Fila principal — Main row */}
        <div className="flex items-center justify-between px-6 py-3">

          {/* Logo + nombre de la app — Logo + app name */}
          <NavLink to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="MediL CRM" className="h-10 w-auto" />
            <span className="text-primary font-bold text-xl tracking-tight">MediL CRM</span>
          </NavLink>

          {/* Navegación desktop (≥ md) — Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => <NavItem key={l.to} to={l.to} label={l.label} />)}
          </div>

          {/* Botón hamburguesa (< md) — Hamburger button */}
          <button
            className="md:hidden p-2 rounded-md text-primary hover:bg-blue-50 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>

        {/* Menú desplegable móvil — Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-1 px-4 pb-4 border-t border-gray-100 bg-white">
            {NAV_LINKS.map(l => (
              <NavItem key={l.to} to={l.to} label={l.label} onClick={() => setMenuOpen(false)} />
            ))}
          </div>
        )}
      </nav>

      {/* Contenido de la ruta activa — Active route content */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/"              element={<Dashboard />}    />
          <Route path="/patients"      element={<Patients />}     />
          <Route path="/patients/:id"  element={<PatientDetail />}/>
          <Route path="/appointments"  element={<Appointments />} />
          <Route path="/reminders"     element={<Reminders />}    />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
