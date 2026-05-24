// Spinner de carga — Loading spinner
import React from 'react';

/** Spinner de pantalla completa — Full-screen loading spinner */
export function LoadingSpinner({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-6 w-6 border-2' : 'h-10 w-10 border-4';
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-[#00B4D8] border-t-transparent ${sizeClass}`} />
    </div>
  );
}

/** Spinner de página completa — Full-page loading spinner */
export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  );
}
