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

  // Las mutaciones NO usan withLoading: `loading` solo refleja la carga inicial.
  // Si una mutación lo activara, la página que hace `if (loading) return
  // <FullPageSpinner/>` se re-renderizaría y desmontaría el modal abierto a
  // mitad del guardado. El modal muestra su propio estado y captura los errores.
  const createProfessional = async (data) => {
    const created = await professionalService.create(data);
    setProfessionals(prev => [...prev, created]);
    return created;
  };

  const updateProfessional = async (id, data) => {
    // Email previo: el usuario vinculado se busca por él (el email pudo cambiar)
    const prevEmail = professionals.find(p => p.id === id)?.email;
    const updated = await professionalService.update(id, data);
    // Mantiene el perfil del usuario doctor (identidad/login) en sincronía con la edición
    await professionalService.syncLinkedUser(prevEmail ?? data.email, {
      fullName: data.fullName, email: data.email,
      photoUrl: data.photoUrl, branchId: data.branchId,
    }).catch(() => {});
    setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, ...data, ...updated } : p)));
    return updated;
  };

  const deactivateProfessional = async (id) => {
    await professionalService.deactivate(id);
    setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, isActive: false } : p)));
  };

  const activateProfessional = async (id) => {
    await professionalService.activate(id);
    setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, isActive: true } : p)));
  };

  return {
    professionals, loading, error,
    createProfessional, updateProfessional, deactivateProfessional, activateProfessional,
  };
}
