// Hook de citas — Appointments hook
import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { eventBus } from '../core/eventBus';

export function useAppointments(branchId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // withLoading canónico — envuelve TODA operación async (loading + error)
  const withLoading = useCallback(async (fn) => {
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
  }, []);

  const fetchAppointments = useCallback(async () => {
    const data = await appointmentService.getAll(branchId);
    setAppointments(data);
  }, [branchId]);

  const load = useCallback(() => {
    if (!branchId) return Promise.resolve();
    return withLoading(fetchAppointments);
  }, [branchId, withLoading, fetchAppointments]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  const create = (data) => withLoading(async () => {
    await appointmentService.create({ ...data, branchId });
    await fetchAppointments();
  });

  const cancel = (id) => withLoading(async () => {
    await appointmentService.cancel(id);
    await fetchAppointments();
  });

  const markAttended = (id) => withLoading(async () => {
    await appointmentService.markAttended(id);
    await fetchAppointments();
  });

  // Verifica el seguro del paciente: si está afiliado crea la cita gratis;
  // si no, devuelve que requiere pago (la cita se crea luego con createAfterPayment)
  const createWithPaymentCheck = (appointmentData) => withLoading(async () => {
    const insurance = await patientService.checkInsurance(appointmentData.patientId);

    if (insurance.isInsured) {
      const appointment = await appointmentService.create({
        ...appointmentData,
        paymentStatus: 'exempt',
      });
      await fetchAppointments();
      eventBus.emit('appointment:created', appointment);
      return { appointment, requiresPayment: false };
    }

    return { appointment: null, requiresPayment: true, appointmentData };
  });

  // Crea la cita una vez que el pago fue aprobado
  const createAfterPayment = (appointmentData, paymentId) => withLoading(async () => {
    const appointment = await appointmentService.create({
      ...appointmentData,
      paymentStatus: 'paid',
      paymentId,
    });
    await fetchAppointments();
    eventBus.emit('appointment:created', appointment);
    return appointment;
  });

  return {
    appointments, loading, error,
    create, cancel, markAttended,
    createWithPaymentCheck, createAfterPayment,
    reload: load,
  };
}
