// Componente spinner de carga
import React from 'react';

const SIZE_MAP = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export function Spinner({ size = 'md' }) {
  return (
    <div
      className={`animate-spin rounded-full border-[#00B4D8] border-t-transparent ${SIZE_MAP[size] ?? SIZE_MAP.md}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

// Spinner centrado para pantalla completa
export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}
