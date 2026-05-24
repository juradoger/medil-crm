// Detalle del paciente — Patient detail
// TODO Etapa 3 — implementar historial clínico y citas — implement medical history and appointments
import { useParams } from 'react-router-dom';

export default function PatientDetail() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#0E4A8A]">Detalle del Paciente</h1>
      <p className="text-gray-500 mt-1">Patient Detail — ID: {id} — TODO: implementar — implement</p>
    </div>
  );
}
