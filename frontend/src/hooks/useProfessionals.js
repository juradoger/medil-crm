// Hook de profesionales — Professionals hook
import { useState, useEffect, useCallback } from 'react';
import { professionalService } from '../services/professionalService';

export function useProfessionals(branchId) {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await professionalService.getByBranch(branchId);
      setProfessionals(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    await professionalService.create({ ...data, branchId });
    await load();
  };

  const update = async (id, data) => {
    await professionalService.update(id, data);
    await load();
  };

  return { professionals, loading, error, create, update, reload: load };
}
