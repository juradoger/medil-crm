// Campo de formulario reutilizable — Reusable form field
import React from 'react';

/**
 * Campo de formulario con label y error — Form field with label and error
 * @param {{ label: string, error?: string, children: React.ReactNode }} props
 */
export function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/** Estilos base para inputs — Base input styles */
export const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent transition';
