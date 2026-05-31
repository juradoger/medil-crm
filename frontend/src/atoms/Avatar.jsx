// Avatar con iniciales del nombre
import React from 'react';

const SIZE_MAP = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

// Extrae iniciales del nombre completo
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className = "" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${SIZE_MAP[size] ?? SIZE_MAP.md} ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#00B4D8] text-white font-semibold ${SIZE_MAP[size] ?? SIZE_MAP.md} ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}

