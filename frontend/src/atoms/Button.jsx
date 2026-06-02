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

// Tamaño del icono según el tamaño del botón — Icon size per button size
const ICON_SIZE = { sm: 14, md: 16, lg: 18 };

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
  icon: Icon,         // Componente de icono lucide (izquierda) — lucide icon (left)
  iconRight: IconR,   // Componente de icono lucide (derecha) — lucide icon (right)
}) {
  const isDisabled = disabled || loading;
  const iconPx = ICON_SIZE[size] ?? ICON_SIZE.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors leading-none
        ${VARIANT_MAP[variant] ?? VARIANT_MAP.primary}
        ${SIZE_MAP[size] ?? SIZE_MAP.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {/* Spinner visible cuando está cargando, si no el icono izquierdo */}
      {loading ? <Spinner size="sm" /> : Icon && <Icon size={iconPx} strokeWidth={2.25} className="shrink-0" />}
      {label && <span>{label}</span>}
      {IconR && <IconR size={iconPx} strokeWidth={2.25} className="shrink-0" />}
    </button>
  );
}
