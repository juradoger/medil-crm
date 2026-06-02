// Layout para páginas públicas (sin autenticación requerida)
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../atoms/Logo';

export function PublicLayout({ children, fullBleed = false }) {
  return (
    <div className={`min-h-screen flex flex-col ${fullBleed ? 'bg-transparent' : 'bg-gray-50'}`}>
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/portal" className="flex items-center">
            <Logo className="text-2xl" />
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-primary border border-primary/60 rounded-lg shadow-[0_0_14px_rgba(45,214,205,0.25)] hover:shadow-[0_0_18px_rgba(45,214,205,0.4)] hover:bg-primary/10 transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>


      <main className={fullBleed ? 'flex-1 w-full' : 'flex-1 max-w-6xl mx-auto w-full px-4 py-8'}>
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        MedIL CRM © {new Date().getFullYear()} — Sistema de gestión clínica para Bolivia
      </footer>
    </div>
  );
}
