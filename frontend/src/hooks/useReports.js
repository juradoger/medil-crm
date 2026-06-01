// Hook de reportes — Reports hook
import { useState, useCallback } from 'react';
import { reportService } from '../services/reportService';

export function useReports() {
  const [report, setReport]   = useState(null);
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

  const generate = (professionalId, dateFrom, dateTo) => withLoading(async () => {
    const result = await reportService.getReport(professionalId, dateFrom, dateTo);
    setReport(result);
    return result;
  });

  return { report, loading, error, generate };
}
