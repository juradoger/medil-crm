// Hook personalizado para gestión de citas
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

  async function createAppointment(appointmentData) {
    const newAppt = await createSvc(appointmentData);
    setAppointments((prev) => [...prev, newAppt]);
    return newAppt;
  }

  async function cancelAppointment(id) {
    const updated = await cancelSvc(id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }

  async function markAsAttended(id) {
    const updated = await markAttendedSvc(id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }

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
