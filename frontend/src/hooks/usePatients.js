// Hook personalizado para gestión de pacientes
import { useState, useEffect } from 'react';
import {
  getPatients,
  createPatient as createPatientSvc,
  updatePatient as updatePatientSvc,
  searchPatients as searchPatientsSvc,
} from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createPatient(patientData) {
    const newPatient = await createPatientSvc(patientData);
    setPatients((prev) => [...prev, newPatient]);
    return newPatient;
  }

  async function updatePatient(id, patientData) {
    const updated = await updatePatientSvc(id, patientData);
    setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async function searchPatients(query) {
    setLoading(true);
    setError(null);
    try {
      const results = await searchPatientsSvc(query);
      setPatients(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Recarga la lista completa desde InsForge
  async function refreshPatients() {
    await load();
  }

  return { patients, loading, error, createPatient, updatePatient, searchPatients, refreshPatients };
}
