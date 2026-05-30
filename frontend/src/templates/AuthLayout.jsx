// Layout para páginas de autenticación
import React from 'react';

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#00B4D8]/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo centrado */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="MedIL CRM" className="h-16 w-auto" />
        </div>
        {children}
      </div>
    </div>
  );
}
