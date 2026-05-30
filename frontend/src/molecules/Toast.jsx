// Notificación temporal tipo toast
import React, { useEffect } from 'react';

const TYPE_MAP = {
  success: 'bg-green-500 text-white',
  error:   'bg-red-500 text-white',
  warning: 'bg-orange-400 text-white',
  info:    'bg-[#00B4D8] text-white',
};

export function Toast({ message, type = 'info', onClose }) {
  // Auto-cierre después de 3 segundos
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        animate-[slideInFromRight_0.3s_ease-out] ${TYPE_MAP[type] ?? TYPE_MAP.info}`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} aria-label="Cerrar notificación" className="ml-2 opacity-80 hover:opacity-100">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
