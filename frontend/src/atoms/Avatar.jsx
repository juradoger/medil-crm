// Avatar: muestra foto si hay photoUrl, si no las iniciales del nombre
import React, { useState } from 'react';

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

export function Avatar({ name, photoUrl, src, size = 'md', className = '' }) {
  // photoUrl es el prop canónico; src se mantiene como alias retrocompatible
  const url = photoUrl ?? src;
  const [broken, setBroken] = useState(false);

  // Si hay size conocido usa su clase; si no, deja que className controle el tamaño
  const sizeCls = SIZE_MAP[size] ?? '';

  if (url && !broken) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setBroken(true)}
        className={`rounded-full object-cover ${sizeCls} ${className}`}
      />
    );
  }

  // Sin foto (o imagen rota): círculo con iniciales
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#00B4D8] text-white font-semibold ${sizeCls} ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
