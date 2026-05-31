import React from 'react';

export function Logo({ className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/logo-png.png"
        alt="MedIL Logo"
        className="h-[2.5em] w-auto object-contain"
      />
    </div>
  );
}

