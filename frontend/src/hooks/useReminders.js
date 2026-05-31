// Hook de recordatorios — Reminders hook
import { useState, useEffect, useCallback } from 'react';
import { reminderService } from '../services/reminderService';

export function useReminders(branchId) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reminderService.getAll(branchId);
      setReminders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const markSent = async (id) => {
    await reminderService.markSent(id);
    await load();
  };

  return { reminders, loading, error, markSent, reload: load };
}
