// Barra superior de navegación — Top navigation bar
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * @param {{ onMenuClick: fn }} props
 */
export function TopBar({ onMenuClick }) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
      <NavLink to="/" onClick={() => {}}>
        <img src="/logo.png" alt="MedIL CRM" className="h-16 w-auto" />
      </NavLink>

      {isAuthenticated && (
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-[#0E4A8A] hover:bg-blue-50 transition-colors"
          aria-label="Abrir menú — Open menu"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </header>
  );
}
