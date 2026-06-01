// Placeholder de carga animado — Animated loading placeholder
import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      data-testid="skeleton"
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
    />
  );
}
