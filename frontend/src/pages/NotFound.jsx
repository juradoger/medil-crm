// Página 404 — ruta no encontrada
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../atoms/Logo';
import { Button } from '../atoms/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-6 text-center">
      <Logo className="text-2xl mb-6" />
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-bold text-navy mt-2">Página no encontrada</h1>
      <p className="text-sm text-ink-muted mt-2">La página que buscás no existe.</p>
      <div className="mt-6">
        <Button label="Volver al inicio" onClick={() => navigate('/')} />
      </div>
    </div>
  );
}
