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

  // Las mutaciones NO usan withLoading: `loading` solo refleja la carga inicial.
  // Si una mutación lo activara, la página que hace `if (loading) return
  // <FullPageSpinner/>` se re-renderizaría y desmontaría el modal abierto a
  // mitad del guardado. El modal muestra su propio estado y captura los errores.
  const create = async (data) => {
    await supplyService.create(branchId, data);
    await fetchSupplies();
  };

  const update = async (id, data) => {
    await supplyService.update(id, data);
    await fetchSupplies();
  };

  const adjustStock = async (id, newStock, minimum) => {
    await supplyService.adjustStock(id, newStock, minimum);
    await fetchSupplies();
  };

  const remove = async (id) => {
    await supplyService.remove(id);
    await fetchSupplies();
  };

  return { supplies, loading, error, create, update, adjustStock, remove, reload: load };
}
