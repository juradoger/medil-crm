// Hook personalizado para gestión de pacientes — Custom hook for patient management
// Abstrae el estado y las llamadas al servicio — Abstracts state and service calls
import { useState, useEffect } from 'react';
import {
  getPatients,
  createPatient as createPatientSvc,
  updatePatient as updatePatientSvc,
  searchPatients as searchPatientsSvc,
} from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState([]);   // Lista de pacientes — Patient list
  const [loading, setLoading] = useState(false);  // Estado de carga — Loading state
  const [error, setError] = useState(null);       // Error capturado — Captured error

  // Carga inicial de pacientes — Initial patient load
  useEffect(() => {
    // TODO Etapa 1 — implementar lógica / implement logic
  }, []);

  // Crea un nuevo paciente y actualiza la lista — Creates a new patient and updates list
  async function createPatient(patientData) {
    // TODO Etapa 1 — implementar lógica / implement logic
  }

  // Actualiza un paciente existente — Updates an existing patient
  async function updatePatient(id, patientData) {
    // TODO Etapa 1 — implementar lógica / implement logic
  }

  // Busca pacientes por término — Searches patients by term
  async function searchPatients(query) {
    // TODO Etapa 1 — implementar lógica / implement logic
  }

  return { patients, loading, error, createPatient, updatePatient, searchPatients };
}
