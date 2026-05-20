// Página de gestión de citas médicas — Medical appointment management page
import React from 'react';
import { useAppointments } from '../hooks/useAppointments';

export default function Appointments() {
  const { appointments, loading, error } = useAppointments();

  // TODO Etapa 1 — implementar lógica / implement logic
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-primary-dark">Citas</h1>
      <p className="text-gray-500 mt-1">Appointments</p>
    </div>
  );
}
