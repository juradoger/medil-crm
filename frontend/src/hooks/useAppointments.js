// Hook de citas — Appointments hook
import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';

export function useAppointments(branchId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAll(branchId);
      setAppointments(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    await appointmentService.create({ ...data, branchId });
    await load();
  };

  const cancel = async (id) => {
    await appointmentService.cancel(id);
    await load();
  };

  const markAttended = async (id) => {
    await appointmentService.markAttended(id);
    await load();
  };

  return { appointments, loading, error, create, cancel, markAttended, reload: load };
}
