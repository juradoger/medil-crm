// Página de listado y búsqueda de pacientes — Patient listing and search page
import React from 'react';
import { usePatients } from '../hooks/usePatients';

export default function Patients() {
  const { patients, loading, error } = usePatients();

  // TODO Etapa 1 — implementar lógica / implement logic
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-primary-dark">Pacientes</h1>
      <p className="text-gray-500 mt-1">Patients</p>
    </div>
  );
}
