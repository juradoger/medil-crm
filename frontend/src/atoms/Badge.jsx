// Insignia de color configurable
import React from 'react';

// Mapa de colores a clases Tailwind
const COLOR_MAP = {
  aqua:   'bg-[#00B4D8]/10 text-[#00B4D8]',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  gray:   'bg-gray-100 text-gray-500',
};

export function Badge({ text, color = 'gray' }) {
  const classes = COLOR_MAP[color] ?? COLOR_MAP.gray;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {text ?? ''}
    </span>
  );
}
