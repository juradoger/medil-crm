// Botón reutilizable con variantes de estilo
import React from 'react';
import { Spinner } from './Spinner';

// Mapa de variantes de color
const VARIANT_MAP = {
  primary:   'bg-[#00B4D8] text-white hover:bg-[#0096B4]',
  danger:    'bg-red-500 text-white hover:bg-red-600',
  ghost:     'bg-transparent border border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8]/10',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

// Mapa de tamaños de padding y texto
const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  className = '',
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        ${VARIANT_MAP[variant] ?? VARIANT_MAP.primary}
        ${SIZE_MAP[size] ?? SIZE_MAP.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {/* Spinner visible cuando está cargando */}
      {loading && <Spinner size="sm" />}
      {label}
    </button>
  );
}
