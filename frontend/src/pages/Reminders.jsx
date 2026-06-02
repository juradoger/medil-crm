// Gestión de recordatorios con envío por WhatsApp
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReminders } from '../hooks/useReminders';
import { ConfirmModal } from '../molecules/ConfirmModal';
import { Button } from '../atoms/Button';
import { FullPageSpinner } from '../atoms/Spinner';
import { Zap, Check, ArrowLeft } from 'lucide-react';
import { REMINDER_STATUS } from '../core/constants';
import { MESSAGES } from '../core/messages';
import { eventBus } from '../core/eventBus';

const STATUS_FILTERS = ['Todas', REMINDER_STATUS.PENDING, REMINDER_STATUS.SENT];
const STATUS_LABELS  = { Todas: 'Todos', pending: 'Pendientes', sent: 'Enviados' };

const JOB_ENABLED = import.meta.env.VITE_ENABLE_REMINDER_JOB === 'true';

function fmt(dt) {
  return dt ? new Date(dt).toLocaleString('es-BO') : '—';
}

// Calcula el tiempo restante hasta el envío programado
function timeInfo(sendAt) {
  if (!sendAt) return { ready: false, label: '—' };
  const diff = new Date(sendAt).getTime() - Date.now();
  if (diff <= 0) return { ready: true };
  const hours = Math.round(diff / 3600000);
  return { ready: false, label: hours >= 1 ? `${hours} horas` : 'menos de 1 hora' };
}

// Convierte un ISO a valor para <input type="datetime-local"> (YYYY-MM-DDTHH:MM)
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Reminders() {
  const { currentBranchId } = useAuth();
  const { reminders, loading, markSent, reschedule, sendWhatsAppReminder } = useReminders(currentBranchId);

  const [filterStatus, setFilter]   = useState(REMINDER_STATUS.PENDING);
  const [confirmTarget, setConfirm] = useState(null);
  const [sendingId, setSendingId]   = useState(null);
  const [scheduleId, setScheduleId] = useState(null);   // recordatorio que se está reprogramando
  const [scheduleAt, setScheduleAt] = useState('');

  const filtered = filterStatus === 'Todas'
    ? reminders
    : reminders.filter(r => r.status === filterStatus);

  async function handleSend(reminder) {
    setSendingId(reminder.id);
    try {
      const result = await sendWhatsAppReminder(reminder);
      if (result?.simulated) {
        eventBus.emit('toast:show', { message: MESSAGES.error.whatsappNotConfigured, type: 'warning' });
      } else {
        eventBus.emit('toast:show', { message: result?.message || MESSAGES.success.whatsappSent(''), type: 'success' });
      }
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message || MESSAGES.error.whatsappFailed, type: 'error' });
    } finally {
      setSendingId(null);
    }
  }

  function openSchedule(reminder) {
    setScheduleId(reminder.id);
    setScheduleAt(toLocalInput(reminder.sendAt) || toLocalInput(new Date().toISOString()));
  }

  async function handleSchedule(reminder) {
    if (!scheduleAt) return;
    try {
      await reschedule(reminder.id, new Date(scheduleAt).toISOString());
      setScheduleId(null);
      eventBus.emit('toast:show', { message: MESSAGES.success.reminderScheduled, type: 'success' });
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
    }
  }

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          <ArrowLeft size={16} strokeWidth={2.25} />
          Volver al Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-navy">Recordatorios</h1>

      {/* Banner de job automático */}
      {!JOB_ENABLED && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
          <svg className="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-navy">
            Los recordatorios se enviarán automáticamente cuando llegue la hora programada.
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center bg-gray-50 rounded-xl border border-gray-100">
          {MESSAGES.empty.reminders.noData}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const info = timeInfo(r.sendAt);
            const isPending = r.status === REMINDER_STATUS.PENDING;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Paciente: {r.patientName ?? r.patientId}</p>
                  <p className="text-sm text-gray-600">{r.message}</p>
                  <p className="text-xs text-gray-400">Programado: {fmt(r.sendAt)}</p>

                  {isPending && (
                    info.ready
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 animate-pulse">
                          <Zap size={12} strokeWidth={2.5} /> Listo para enviar
                        </span>
                      : <span className="text-xs text-orange-600">Envío automático en {info.label}</span>
                  )}

                  {r.status === REMINDER_STATUS.SENT && (
                    <p className="inline-flex items-center gap-1 text-xs text-green-700"><Check size={12} strokeWidth={2.5} /> Enviado el {fmt(r.sentAt)}</p>
                  )}
                </div>

                {isPending && (
                  <div className="flex flex-col items-stretch gap-2 shrink-0">
                    <div className="flex gap-2">
                      <Button
                        label="Enviar por WhatsApp"
                        variant="primary"
                        size="sm"
                        loading={sendingId === r.id}
                        onClick={() => handleSend(r)}
                      />
                      <Button
                        label="Programar"
                        variant="ghost"
                        size="sm"
                        onClick={() => (scheduleId === r.id ? setScheduleId(null) : openSchedule(r))}
                      />
                      <Button
                        label="Marcar enviado"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirm(r)}
                      />
                    </div>

                    {/* Selector de fecha y hora de envío */}
                    {scheduleId === r.id && (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-2">
                        <input
                          type="datetime-local"
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-primary"
                          value={scheduleAt}
                          onChange={e => setScheduleAt(e.target.value)}
                        />
                        <Button label="Guardar" variant="primary" size="sm" onClick={() => handleSchedule(r)} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirmTarget}
        title="¿Marcar recordatorio como enviado?"
        description={MESSAGES.confirm.markReminderSent}
        onConfirm={async () => {
          if (confirmTarget) {
            await markSent(confirmTarget.id);
            setConfirm(null);
          }
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
