// Campo de entrada de texto reutilizable
import React from 'react';

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error = false,
  name,
  id,
}) {
  // Clases según estado del campo
  const borderClass = error
    ? 'border-red-400 focus:ring-red-300'
    : 'border-gray-200 focus:ring-[#00B4D8]';

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed ${borderClass}`}
    />
  );
}
