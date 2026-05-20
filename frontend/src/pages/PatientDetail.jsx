// Página de detalle de un paciente individual — Individual patient detail page
// Muestra historial clínico y citas del paciente — Shows patient medical history and appointments
import React from 'react';
import { useParams } from 'react-router-dom';

export default function PatientDetail() {
  const { id } = useParams(); // ID del paciente desde la URL — Patient ID from URL

  // TODO Etapa 1 — implementar lógica / implement logic
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-primary-dark">Detalle del Paciente</h1>
      <p className="text-gray-500 mt-1">Patient Detail — ID: {id}</p>
    </div>
  );
}
