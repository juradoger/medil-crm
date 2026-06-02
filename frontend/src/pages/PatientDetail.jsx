// Detalle del paciente
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { useAppointments } from '../hooks/useAppointments';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../molecules/StatusBadge';
import { DataTable } from '../organisms/DataTable';
import { FullPageSpinner } from '../atoms/Spinner';
import { FormField, inputClass } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { ArrowLeft, Plus } from 'lucide-react';

const TABS  = ['Citas', 'Historial'];
const TODAY = new Date().toISOString().slice(0, 10);

function RecordModal({ appointments, onSave, onClose }) {
  const [form, setForm] = useState({ appointmentId: '', attendanceDate: TODAY, diagnosis: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // El historial debe vincularse a una cita; sin citas no se puede registrar
  const hasAppointments = appointments.length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.appointmentId) { setError('Seleccioná la cita asociada a esta consulta'); return; }
    setError('');
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 medil-modal-overlay" onClick={onClose} />
      <div className="medil-modal relative bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva entrada</h2>

        {!hasAppointments ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-4">
              Este paciente no tiene citas registradas. No es posible agregar una entrada
              al historial sin una cita asociada. Agendá una cita primero.
            </p>
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cerrar</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <FormField label="Cita asociada" htmlFor="appointmentId" required>
              <select id="appointmentId" className={inputClass}
                value={form.appointmentId}
                onChange={e => setForm(f => ({ ...f, appointmentId: e.target.value }))} required>
                <option value="">Seleccioná una cita…</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.date} {a.time?.slice(0, 5) ?? ''} — {a.reason || 'Sin motivo'}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Fecha de atención" htmlFor="attendanceDate" required>
              <input id="attendanceDate" type="date" className={inputClass}
                value={form.attendanceDate}
                onChange={e => setForm(f => ({ ...f, attendanceDate: e.target.value }))} />
            </FormField>
            <FormField label="Diagnóstico" htmlFor="diagnosis" required>
              <input id="diagnosis" className={inputClass} value={form.diagnosis}
                onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} required />
            </FormField>
            <FormField label="Notas" htmlFor="notes">
              <textarea id="notes" className={`${inputClass} resize-none`} rows={3}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </FormField>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const { currentBranchId } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadP, setLoadP]     = useState(true);
  const [tab, setTab]         = useState(0);
  const [showRecord, setShowRecord] = useState(false);

  const { appointments, loading: loadA } = useAppointments(currentBranchId);
  const { records, loading: loadR, create: createRecord } = useMedicalRecords(id, currentBranchId);

  useEffect(() => {
    patientService.getById(id).then(p => { setPatient(p); setLoadP(false); });
  }, [id]);

  const patientAppointments = appointments.filter(a => a.patientId === id);

  const apptColumns = [
    { key: 'date', label: 'Fecha', render: r => r.date ? `${r.date} ${r.time?.slice(0,5) ?? ''}` : '—' },
    { key: 'professionalId', label: 'Profesional', render: r => r.professionalId ?? '—' },
    { key: 'status', label: 'Estado', render: r => <StatusBadge status={r.status} /> },
  ];

  const recordColumns = [
    { key: 'createdAt', label: 'Fecha', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-BO') : '—' },
    { key: 'diagnosis', label: 'Diagnóstico' },
    { key: 'notes',     label: 'Notas' },
  ];

  if (loadP || loadA || loadR) return <FullPageSpinner />;
  if (!patient) return (
    <div className="p-6 text-center text-gray-500">
      Paciente no encontrado. <Link to="/patients" className="text-primary hover:underline">Volver</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
        <ArrowLeft size={16} strokeWidth={2.25} /> Volver a Pacientes
      </Link>

      {/* Columnas: info + stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-navy">{patient.name}</h1>
            </div>
            <StatusBadge status={patient.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 leading-relaxed">
            <div><span className="font-medium">CI:</span> {patient.ci || '—'}</div>
            <div><span className="font-medium">Teléfono:</span> {patient.phone || '—'}</div>
            <div><span className="font-medium">Email:</span> {patient.email || '—'}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{patientAppointments.length}</p>
            <p className="text-xs text-gray-400 mt-1">Citas totales</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{records.length}</p>
            <p className="text-xs text-gray-400 mt-1">Registros médicos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === i ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <DataTable columns={apptColumns} rows={patientAppointments} emptyTitle="Sin citas" />
        )}

        {tab === 1 && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button label="Nueva entrada" icon={Plus} size="sm" onClick={() => setShowRecord(true)} />
            </div>
            <DataTable columns={recordColumns} rows={records} emptyTitle="Sin registros" />
          </div>
        )}
      </div>

      {showRecord && (
        <RecordModal
          appointments={patientAppointments}
          onSave={createRecord}
          onClose={() => setShowRecord(false)}
        />
      )}
    </div>
  );
}
