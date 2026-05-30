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

const TABS = ['Citas', 'Historial'];

function RecordModal({ onSave, onClose }) {
  const [form, setForm] = useState({ diagnosis: '', treatment: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva entrada</h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Diagnóstico">
            <input className={inputClass} value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} required />
          </FormField>
          <FormField label="Tratamiento">
            <input className={inputClass} value={form.treatment} onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} />
          </FormField>
          <FormField label="Notas">
            <textarea className={`${inputClass} resize-none`} rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
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
  const { records, loading: loadR, create: createRecord } = useMedicalRecords(id);

  useEffect(() => {
    patientService.getById(id).then(p => { setPatient(p); setLoadP(false); });
  }, [id]);

  const patientAppointments = appointments.filter(a => a.patientId === id);

  const apptColumns = [
    { key: 'date', label: 'Fecha', render: r => r.date ? `${r.date} ${r.time?.slice(0,5) ?? ''}` : '—' },
    { key: 'professional', label: 'Profesional', render: r => r.professional ?? r.professionalId ?? '—' },
    { key: 'status', label: 'Estado', render: r => <StatusBadge status={r.status} /> },
  ];

  const recordColumns = [
    { key: 'createdAt', label: 'Fecha', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-BO') : '—' },
    { key: 'diagnosis', label: 'Diagnóstico' },
    { key: 'treatment', label: 'Tratamiento' },
    { key: 'notes', label: 'Notas' },
  ];

  if (loadP || loadA || loadR) return <FullPageSpinner />;
  if (!patient) return (
    <div className="p-6 text-center text-gray-500">
      Paciente no encontrado. <Link to="/patients" className="text-[#00B4D8] hover:underline">Volver</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link to="/patients" className="text-sm text-[#00B4D8] hover:underline">← Volver a Pacientes</Link>

      {/* Columnas: info + stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0E4A8A]">{patient.name}</h1>
            </div>
            <StatusBadge status={patient.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div><span className="font-medium">Teléfono:</span> {patient.phone || '—'}</div>
            <div><span className="font-medium">Email:</span> {patient.email || '—'}</div>
            <div><span className="font-medium">Nacimiento:</span> {patient.birthDate || '—'}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#00B4D8]">{patientAppointments.length}</p>
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
                tab === i ? 'border-[#00B4D8] text-[#00B4D8]' : 'border-transparent text-gray-500 hover:text-gray-700'
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
              <button
                onClick={() => setShowRecord(true)}
                className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4]"
              >
                + Nueva entrada
              </button>
            </div>
            <DataTable columns={recordColumns} rows={records} emptyTitle="Sin registros" />
          </div>
        )}
      </div>

      {showRecord && (
        <RecordModal
          onSave={createRecord}
          onClose={() => setShowRecord(false)}
        />
      )}
    </div>
  );
}
