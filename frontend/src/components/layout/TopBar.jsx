// Barra superior de navegación
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../atoms/Logo';

/**
 * @param {{ onMenuClick: fn }} props
 */
export function TopBar({ onMenuClick }) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
      <NavLink to="/" onClick={() => {}} className="flex items-center">
        <Logo className="text-2xl" />
      </NavLink>

      {isAuthenticated && (
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-navy hover:bg-blue-50 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={28} strokeWidth={2} />
        </button>
      )}
    </header>
  );
}
