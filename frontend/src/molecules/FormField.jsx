// Campo de formulario compuesto: Label + input + mensaje de error
import React from 'react';
import { Label } from '../atoms/Label';

export function FormField({ label, error, required = false, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <Label htmlFor={htmlFor} text={label} required={required} />}
      {children}
      {/* Mensaje de error en rojo */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Clase CSS compartida para inputs dentro de FormField
export const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent transition';
