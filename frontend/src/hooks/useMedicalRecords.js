// Hook de historiales médicos — Medical records hook
import { useState, useEffect, useCallback } from 'react';
import { recordService } from '../services/recordService';

export function useMedicalRecords(patientId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await recordService.getByPatient(patientId);
      setRecords(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    await recordService.create({ ...data, patientId });
    await load();
  };

  return { records, loading, error, create, reload: load };
}
