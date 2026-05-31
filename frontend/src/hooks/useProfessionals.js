// Hook de profesionales — Professionals hook
import { useState, useEffect, useCallback } from 'react';
import { professionalService } from '../services/professionalService';

export function useProfessionals(branchId) {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

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

  const fetchProfessionals = useCallback(async () => {
    const data = await professionalService.getByBranch(branchId);
    setProfessionals(data);
  }, [branchId]);

  const load = useCallback(() => {
    if (!branchId) return Promise.resolve();
    return withLoading(fetchProfessionals);
  }, [branchId, withLoading, fetchProfessionals]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  const create = (data) => withLoading(async () => {
    await professionalService.create({ ...data, branchId });
    await fetchProfessionals();
  });

  const update = (id, data) => withLoading(async () => {
    await professionalService.update(id, data);
    await fetchProfessionals();
  });

  return { professionals, loading, error, create, update, reload: load };
}
