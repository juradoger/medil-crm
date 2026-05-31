// Hook de citas — Appointments hook
import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';

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

  return { appointments, loading, error, create, cancel, markAttended, reload: load };
}
