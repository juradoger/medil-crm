// Hook de administradores — Admins hook
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';

export function useAdmins() {
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchAdmins = useCallback(async () => {
    const all = await adminService.getAll();
    setAdmins(all);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { withLoading(fetchAdmins).catch(() => {}); }, [withLoading, fetchAdmins]);

  // La mutación NO usa withLoading: `loading` solo refleja la carga inicial,
  // para no desmontar el modal abierto a mitad del guardado.
  const addAdmin = async (data) => {
    const result = await adminService.createOrElevate(data);
    await fetchAdmins();
    return result;
  };

  const lookup = (email) => adminService.lookup(email);

  return { admins, loading, error, addAdmin, lookup };
}
