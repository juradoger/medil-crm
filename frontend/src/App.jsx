// Componente raíz — Root component
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';

import Dashboard     from './pages/Dashboard';
import Patients      from './pages/Patients';
import Appointments  from './pages/Appointments';
import Reminders     from './pages/Reminders';
import PatientDetail from './pages/PatientDetail';

const NAV_LINKS = [
  { to: '/',             label: 'Dashboard'     },
  { to: '/patients',     label: 'Pacientes'     },
  { to: '/appointments', label: 'Citas'         },
  { to: '/reminders',    label: 'Recordatorios' },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* Topbar — siempre visible — always visible */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
        {/* Logo — sin texto, siempre grande — no text, always large */}
        <NavLink to="/" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="MediL CRM" className="h-16 w-auto" />
        </NavLink>

        {/* Hamburguesa — siempre visible — always visible */}
        <button
          onClick={() => setOpen(o => !o)}
          className="p-2 rounded-lg text-primary hover:bg-blue-50 transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Sidebar overlay — aparece al hacer click en hamburguesa — appears on hamburger click */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fondo semitransparente — semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          {/* Panel lateral — side panel */}
          <div className="relative w-64 bg-white shadow-2xl flex flex-col">
            {/* Cabecera del sidebar — sidebar header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <img src="/logo.png" alt="MediL CRM" className="h-14 w-auto" />
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links de navegación — navigation links */}
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {NAV_LINKS.map(l => (
                <NavItem key={l.to} to={l.to} label={l.label} onClick={() => setOpen(false)} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Contenido principal — main content */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/"              element={<Dashboard />}     />
          <Route path="/patients"      element={<Patients />}      />
          <Route path="/patients/:id"  element={<PatientDetail />} />
          <Route path="/appointments"  element={<Appointments />}  />
          <Route path="/reminders"     element={<Reminders />}     />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
