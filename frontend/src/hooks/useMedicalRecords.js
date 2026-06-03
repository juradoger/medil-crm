// Hook de historiales médicos — Medical records hook
import { useState, useEffect, useCallback } from 'react';
import { recordService } from '../services/recordService';

export function useMedicalRecords(patientId, branchId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchRecords = useCallback(async () => {
    const data = await recordService.getByPatient(patientId);
    setRecords(data);
  }, [patientId]);

  const load = useCallback(() => {
    if (!patientId) { setRecords([]); return Promise.resolve(); }
    return withLoading(fetchRecords);
  }, [patientId, withLoading, fetchRecords]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  // La mutación NO usa withLoading: `loading` solo refleja la carga inicial.
  // Si lo activara, la página que hace `if (loading) return <FullPageSpinner/>`
  // se re-renderizaría y desmontaría el modal a mitad del guardado. El modal
  // muestra su propio estado y captura el error que esta función lanza.
  const create = async (data) => {
    await recordService.create({ ...data, patientId, branchId });
    await fetchRecords();
  };

  return { records, loading, error, create, reload: load };
}
