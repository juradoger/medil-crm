// Layout para páginas públicas (sin autenticación requerida)
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../atoms/Logo';

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/portal" className="flex items-center">
            <Logo className="text-2xl" />
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>


      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        MedIL CRM © {new Date().getFullYear()} — Sistema de gestión clínica para Bolivia
      </footer>
    </div>
  );
}
