// Hook de insumos y suministros — Supplies hook
import { useState, useEffect, useCallback } from 'react';
import { supplyService } from '../services/supplyService';

export function useSupplies(branchId) {
  const [supplies, setSupplies] = useState([]);
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

  const fetchSupplies = useCallback(async () => {
    const data = await supplyService.getAll(branchId);
    setSupplies(data);
  }, [branchId]);

  const load = useCallback(() => {
    if (!branchId) return Promise.resolve();
    return withLoading(fetchSupplies);
  }, [branchId, withLoading, fetchSupplies]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  const create = (data) => withLoading(async () => {
    await supplyService.create(branchId, data);
    await fetchSupplies();
  });

  const update = (id, data) => withLoading(async () => {
    await supplyService.update(id, data);
    await fetchSupplies();
  });

  const adjustStock = (id, newStock, minimum) => withLoading(async () => {
    await supplyService.adjustStock(id, newStock, minimum);
    await fetchSupplies();
  });

  const remove = (id) => withLoading(async () => {
    await supplyService.remove(id);
    await fetchSupplies();
  });

  return { supplies, loading, error, create, update, adjustStock, remove, reload: load };
}
