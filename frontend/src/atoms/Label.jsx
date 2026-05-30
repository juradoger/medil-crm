// Etiqueta de campo de formulario
import React from 'react';

export function Label({ htmlFor, text, required = false }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
      {text}
      {/* Asterisco rojo para campos obligatorios */}
      {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
}
