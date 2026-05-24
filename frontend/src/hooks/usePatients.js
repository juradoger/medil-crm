// Hook de pacientes — Patients hook
import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../services/patientService';

export function usePatients(branchId) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getAll(branchId);
      setPatients(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    await patientService.create({ ...data, branchId });
    await load();
  };

  const update = async (id, data) => {
    await patientService.update(id, data);
    await load();
  };

  const remove = async (id) => {
    await patientService.remove(id);
    await load();
  };

  const search = (query) => patientService.search(branchId, query);

  return { patients, loading, error, create, update, remove, search, reload: load };
}
