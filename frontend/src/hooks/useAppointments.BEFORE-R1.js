// EVIDENCIA ANTES — R1 Extract Custom Hook — Etapa 2
// BEFORE EVIDENCE — R1 Extract Custom Hook — Stage 2
//
// Problema: createAppointment, cancelAppointment y markAsAttended — Problem: createAppointment, cancelAppointment and markAsAttended
// no manejan loading/error, a diferencia de filterByDate — don't handle loading/error, unlike filterByDate
// Esto viola la consistencia interna del hook — This violates the hook's internal consistency

import { useState, useEffect } from 'react';
import {
  getAll,
  getByDate,
  create as createSvc,
  cancel as cancelSvc,
  markAttended as markAttendedSvc,
} from '../services/appointmentService';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // Carga las citas del día actual al montar el componente
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    filterByDate(today);
  }, []);

  // SIN loading/error — WITHOUT loading/error
  async function createAppointment(appointmentData) {
    const newAppt = await createSvc(appointmentData);
    setAppointments((prev) => [...prev, newAppt]);
    return newAppt;
  }

  // SIN loading/error — WITHOUT loading/error
  async function cancelAppointment(id) {
    const updated = await cancelSvc(id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }

  // SIN loading/error — WITHOUT loading/error
  async function markAsAttended(id) {
    const updated = await markAttendedSvc(id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }

  // CON loading/error — inconsistencia con las anteriores — WITH loading/error — inconsistent with the above
  async function filterByDate(date) {
    setLoading(true);
    setError(null);
    try {
      const data = await getByDate(date);
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { appointments, loading, error, createAppointment, cancelAppointment, markAsAttended, filterByDate };
}
