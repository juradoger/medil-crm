// Hook de sucursales — Branches hook
import { useState, useEffect, useCallback } from 'react';
import { branchService } from '../services/branchService';

export function useBranches() {
  const [branches, setBranches] = useState([]);
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

  const fetchBranches = useCallback(async () => {
    const data = await branchService.getAll();
    setBranches(data);
  }, []);

  const load = useCallback(() => withLoading(fetchBranches), [withLoading, fetchBranches]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  const create = (data) => withLoading(async () => {
    await branchService.create(data);
    await fetchBranches();
  });

  const update = (id, data) => withLoading(async () => {
    await branchService.update(id, data);
    await fetchBranches();
  });

  return { branches, loading, error, create, update, reload: load };
}
