// Hook de pacientes — Patients hook
import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';

export function usePatients(branchId) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

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

  const fetchPatients = useCallback(async () => {
    const data = await patientService.getAll(branchId);
    setPatients(data);
  }, [branchId]);

  const load = useCallback(() => {
    if (!branchId) return Promise.resolve();
    return withLoading(fetchPatients);
  }, [branchId, withLoading, fetchPatients]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  const create = (data) => withLoading(async () => {
    await patientService.create({ ...data, branchId });
    await fetchPatients();
  });

  const update = (id, data) => withLoading(async () => {
    await patientService.update(id, data);
    await fetchPatients();
  });

  const remove = (id) => withLoading(async () => {
    await patientService.remove(id);
    await fetchPatients();
  });

  const search = (query) => patientService.search(branchId, query);

  return { patients, loading, error, create, update, remove, search, reload: load };
}
