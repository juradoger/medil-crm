// Hook de recordatorios — Reminders hook
import { useState, useEffect, useCallback } from 'react';
import { reminderService } from '../services/reminderService';

export function useReminders(branchId) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

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

  const fetchReminders = useCallback(async () => {
    const data = await reminderService.getAll(branchId);
    setReminders(data);
  }, [branchId]);

  const load = useCallback(() => {
    if (!branchId) return Promise.resolve();
    return withLoading(fetchReminders);
  }, [branchId, withLoading, fetchReminders]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch(() => {}); }, [load]);

  const markSent = (id) => withLoading(async () => {
    await reminderService.markSent(id);
    await fetchReminders();
  });

  return { reminders, loading, error, markSent, reload: load };
}
