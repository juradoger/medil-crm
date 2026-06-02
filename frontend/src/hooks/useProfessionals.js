// Hook de profesionales — Professionals hook
import { useState, useEffect, useCallback } from 'react';
import { professionalService } from '../services/professionalService';

export function useProfessionals(branchId = null) {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading]             = useState(false);
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
    const all = await professionalService.getAll();
    const filtered = branchId ? all.filter(p => p.branchId === branchId) : all;
    setProfessionals(filtered);
  }, [branchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { withLoading(fetchProfessionals).catch(() => {}); }, [withLoading, fetchProfessionals]);

  const createProfessional = (data) => withLoading(async () => {
    const created = await professionalService.create(data);
    setProfessionals(prev => [...prev, created]);
    return created;
  });

  const updateProfessional = (id, data) => withLoading(async () => {
    const updated = await professionalService.update(id, data);
    setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    return updated;
  });

  const deactivateProfessional = (id) => withLoading(async () => {
    await professionalService.deactivate(id);
    setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, isActive: false } : p)));
  });

  const activateProfessional = (id) => withLoading(async () => {
    await professionalService.activate(id);
    setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, isActive: true } : p)));
  });

  return {
    professionals, loading, error,
    createProfessional, updateProfessional, deactivateProfessional, activateProfessional,
  };
}
