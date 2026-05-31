// Hook de recordatorios — Reminders hook
import { useState, useEffect, useCallback } from 'react';
import { reminderService } from '../services/reminderService';
import { REMINDER_STATUS } from '../core/constants';

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

  // Envía el recordatorio por WhatsApp y actualiza el estado local
  const sendWhatsAppReminder = (reminder) => withLoading(async () => {
    const result = await reminderService.sendWhatsAppForReminder(reminder);
    if (result.success || result.simulated) {
      setReminders(prev => prev.map(r =>
        r.id === reminder.id
          ? { ...r, status: REMINDER_STATUS.SENT, sentAt: new Date().toISOString() }
          : r
      ));
    }
    return result;
  });

  return {
    reminders, loading, error,
    markSent, sendWhatsAppReminder,
    refreshReminders: load, reload: load,
  };
}
