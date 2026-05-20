// Hook personalizado para gestión de citas — Custom hook for appointment management
// R1 Extract Custom Hook: withLoading() centraliza manejo de estado — withLoading() centralizes state handling
import { useState, useEffect } from 'react';
import {
  getByDate,
  create as createSvc,
  cancel as cancelSvc,
  markAttended as markAttendedSvc,
} from '../services/appointmentService';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // Carga las citas del día actual al montar el componente — Loads today's appointments on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    filterByDate(today);
  }, []);

  // Función auxiliar interna — Internal helper function
  // Envuelve cualquier operación async con manejo uniforme de loading/error — Wraps any async operation with uniform loading/error handling
  async function withLoading(fn) {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function createAppointment(data) {
    return withLoading(async () => {
      const newAppt = await createSvc(data);
      setAppointments((prev) => [...prev, newAppt]);
      return newAppt;
    });
  }

  async function cancelAppointment(id) {
    return withLoading(async () => {
      const updated = await cancelSvc(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    });
  }

  async function markAsAttended(id) {
    return withLoading(async () => {
      const updated = await markAttendedSvc(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    });
  }

  async function filterByDate(date) {
    return withLoading(async () => {
      const data = await getByDate(date);
      setAppointments(data);
      return data;
    });
  }

  // Recarga las citas del día actual — Reloads today's appointments
  async function refreshAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return filterByDate(today);
  }

  return {
    appointments,
    loading,
    error,
    createAppointment,
    cancelAppointment,
    markAsAttended,
    filterByDate,
    refreshAppointments,
  };
}
