// Barra de búsqueda con debounce y botón limpiar
import React, { useState, useEffect, useRef } from 'react';

export function SearchBar({ value, onChange, placeholder = 'Buscar…', onClear }) {
  const [internal, setInternal] = useState(value ?? '');
  const timer = useRef(null);

  // Sincroniza valor externo
  useEffect(() => { setInternal(value ?? ''); }, [value]);

  function handleChange(e) {
    const val = e.target.value;
    setInternal(val);
    // Debounce de 300ms antes de notificar
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(val), 300);
  }

  function handleClear() {
    setInternal('');
    onChange('');
    if (onClear) onClear();
  }

  return (
    <div className="relative flex items-center">
      {/* Ícono lupa */}
      <svg className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <input
        type="text"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-8 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent transition"
        aria-label={placeholder}
      />

      {/* Botón limpiar: solo visible cuando hay texto */}
      {internal && (
        <button
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
