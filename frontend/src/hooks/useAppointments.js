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

  // Las mutaciones NO usan withLoading: `loading` solo refleja la carga inicial.
  // Si una mutación lo activara, la página que hace `if (loading) return
  // <FullPageSpinner/>` se re-renderizaría y desmontaría el modal abierto a
  // mitad del guardado. El modal muestra su propio estado y captura los errores.
  const create = async (data) => {
    await appointmentService.create({ ...data, branchId });
    await fetchAppointments();
  };

  const cancel = async (id) => {
    await appointmentService.cancel(id);
    await fetchAppointments();
  };

  const markAttended = async (id) => {
    await appointmentService.markAttended(id);
    await fetchAppointments();
  };

  // Verifica el seguro del paciente: si está afiliado crea la cita gratis;
  // si no, devuelve que requiere pago (la cita se crea luego con createAfterPayment)
  const createWithPaymentCheck = async (appointmentData) => {
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
  };

  // Crea la cita una vez que el pago fue aprobado
  const createAfterPayment = async (appointmentData, paymentId) => {
    const appointment = await appointmentService.create({
      ...appointmentData,
      paymentStatus: 'paid',
      paymentId,
    });
    await fetchAppointments();
    eventBus.emit('appointment:created', appointment);
    return appointment;
  };

  return {
    appointments, loading, error,
    create, cancel, markAttended,
    createWithPaymentCheck, createAfterPayment,
    reload: load,
  };
}
