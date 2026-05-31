// Hook de insumos y suministros — Supplies hook
import { useState, useEffect, useCallback } from 'react';
import { supplyService } from '../services/supplyService';

export function useSupplies(branchId) {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await supplyService.getAll(branchId);
      setSupplies(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    await supplyService.create(branchId, data);
    await load();
  };

  const update = async (id, data) => {
    await supplyService.update(id, data);
    await load();
  };

  const adjustStock = async (id, newStock, minimum) => {
    await supplyService.adjustStock(id, newStock, minimum);
    await load();
  };

  const remove = async (id) => {
    await supplyService.remove(id);
    await load();
  };

  return { supplies, loading, error, create, update, adjustStock, remove, reload: load };
}
