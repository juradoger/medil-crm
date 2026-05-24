// Hook de sucursales — Branches hook
import { useState, useEffect, useCallback } from 'react';
import { branchService } from '../services/branchService';

export function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await branchService.getAll();
      setBranches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    await branchService.create(data);
    await load();
  };

  const update = async (id, data) => {
    await branchService.update(id, data);
    await load();
  };

  return { branches, loading, error, create, update, reload: load };
}
