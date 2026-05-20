// Hook personalizado para gestión de citas — Custom hook for appointment management
// Abstrae el estado y las llamadas al servicio — Abstracts state and service calls
import { useState, useEffect } from 'react';
import {
  getAppointments,
  createAppointment as createAppointmentSvc,
  cancelAppointment as cancelAppointmentSvc,
  filterByDate as filterByDateSvc,
} from '../services/appointmentService';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]); // Lista de citas — Appointment list
  const [loading, setLoading] = useState(false);        // Estado de carga — Loading state
  const [error, setError] = useState(null);             // Error capturado — Captured error

  // Carga inicial de citas — Initial appointment load
  useEffect(() => {
    // TODO Etapa 1 — implementar lógica / implement logic
  }, []);

  // Crea una nueva cita — Creates a new appointment
  async function createAppointment(appointmentData) {
    // TODO Etapa 1 — implementar lógica / implement logic
  }

  // Cancela una cita por ID — Cancels an appointment by ID
  async function cancelAppointment(id) {
    // TODO Etapa 1 — implementar lógica / implement logic
  }

  // Filtra citas por fecha — Filters appointments by date
  async function filterByDate(date) {
    // TODO Etapa 1 — implementar lógica / implement logic
  }

  return { appointments, loading, error, createAppointment, cancelAppointment, filterByDate };
}
