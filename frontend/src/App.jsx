// Componente raíz con enrutamiento de la aplicación — Root component with application routing
// Usa React Router v6 para definir las rutas del CRM — Uses React Router v6 to define CRM routes
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';

import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Reminders from './pages/Reminders';
import PatientDetail from './pages/PatientDetail';

// Elemento de navegación con estilo activo — Navigation element with active style
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#00B4D8] text-white'
            : 'text-[#0096B4] hover:bg-[#CAF0F8]'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Barra de navegación principal — Main navigation bar */}
      <nav className="flex items-center gap-2 px-6 py-3 bg-white border-b border-[#90E0EF] shadow-sm">
        <span className="text-[#00B4D8] font-bold text-lg mr-4">MedIL CRM</span>
        <NavItem to="/" label="Dashboard" />
        <NavItem to="/patients" label="Pacientes" />
        <NavItem to="/appointments" label="Citas" />
        <NavItem to="/reminders" label="Recordatorios" />
      </nav>

      {/* Contenido principal de la ruta activa — Main content of active route */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
