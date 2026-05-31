// Hook de historiales médicos — Medical records hook
import { useState, useEffect, useCallback } from 'react';
import { recordService } from '../services/recordService';

export function useMedicalRecords(patientId, branchId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

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

  const fetchRecords = useCallback(async () => {
    const data = await recordService.getByPatient(patientId);
    setRecords(data);
  }, [patientId]);

  const load = useCallback(() => {
    if (!patientId) { setRecords([]); return Promise.resolve(); }
    return withLoading(fetchRecords);
  }, [patientId, withLoading, fetchRecords]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  const create = (data) => withLoading(async () => {
    await recordService.create({ ...data, patientId, branchId });
    await fetchRecords();
  });

  return { records, loading, error, create, reload: load };
}
