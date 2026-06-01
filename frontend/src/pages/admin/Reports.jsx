// Reportes de desempeño por profesional (solo admin)
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useProfessionals } from '../../hooks/useProfessionals';
import { useReports } from '../../hooks/useReports';
import { EmptyState } from '../../organisms/EmptyState';
import { StatusBadge } from '../../molecules/StatusBadge';
import { FormField, inputClass } from '../../molecules/FormField';
import { Button } from '../../atoms/Button';
import { eventBus } from '../../core/eventBus';
import { MESSAGES } from '../../core/messages';
import { APPOINTMENT_STATUS } from '../../core/constants';

const TODAY = new Date().toISOString().slice(0, 10);
function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

const STATUS_LABELS = {
  [APPOINTMENT_STATUS.ATTENDED]:        'Atendida',
  [APPOINTMENT_STATUS.CANCELLED]:       'Cancelada',
  [APPOINTMENT_STATUS.SCHEDULED]:       'Agendada',
  [APPOINTMENT_STATUS.PENDING_PAYMENT]: 'Pago pendiente',
};
const statusLabel = (s) => STATUS_LABELS[s] ?? s;

function notify(message, type = 'info') {
  eventBus.emit('toast:show', { message, type });
}

function Metric({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function Reports() {
  const { professionals } = useProfessionals();
  const { report, loading, generate } = useReports();

  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo]     = useState(TODAY);

  const selectedProfName = useMemo(() => {
    if (!selectedProfessional) return 'Todos';
    return professionals.find(p => p.id === selectedProfessional)?.fullName ?? 'Todos';
  }, [selectedProfessional, professionals]);

  const handleGenerateReport = async () => {
    try {
      const result = await generate(selectedProfessional, dateFrom, dateTo);
      if (!result.rows.length) notify(MESSAGES.error.noReportData, 'warning');
      else notify(MESSAGES.success.reportGenerated, 'success');
    } catch {
      notify(MESSAGES.error.reportGenerationFailed, 'error');
    }
  };

  const handleDownloadPDF = () => {
    const { rows, metrics } = report;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(14, 74, 138);
    doc.text('MedIL CRM/ERP', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('Reporte de Desempeño Profesional', 14, 28);

    doc.setFontSize(10);
    doc.text(`Profesional: ${selectedProfName}`, 14, 38);
    doc.text(`Período: ${dateFrom} al ${dateTo}`, 14, 44);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-BO')}`, 14, 50);

    autoTable(doc, {
      startY: 58,
      head: [['Métrica', 'Valor']],
      body: [
        ['Citas atendidas', String(metrics.attended)],
        ['Citas canceladas', String(metrics.cancelled)],
        ['Pacientes únicos', String(metrics.uniquePatients)],
        ['Ingresos generados', `Bs. ${metrics.totalIncome}`],
        ['Comisión calculada', `Bs. ${metrics.commission}`],
      ],
      headStyles: { fillColor: [0, 180, 216] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Fecha', 'Paciente', 'Motivo', 'Estado', 'Monto']],
      body: rows.map(row => [
        row.date, row.patientName, row.reason,
        statusLabel(row.status), `Bs. ${row.amount || 0}`,
      ]),
      headStyles: { fillColor: [14, 74, 138] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `MedIL CRM/ERP — Página ${i} de ${pageCount}`,
        14, doc.internal.pageSize.height - 10
      );
    }

    doc.save(`reporte-medil-${dateFrom}-${dateTo}.pdf`);
    notify(MESSAGES.success.reportDownloaded, 'success');
  };

  const handleDownloadExcel = () => {
    const { rows, metrics } = report;
    const wsData = [
      ['MedIL CRM/ERP — Reporte de Desempeño'],
      [`Profesional: ${selectedProfName}`],
      [`Período: ${dateFrom} al ${dateTo}`],
      [],
      ['RESUMEN'],
      ['Citas atendidas', metrics.attended],
      ['Citas canceladas', metrics.cancelled],
      ['Pacientes únicos', metrics.uniquePatients],
      ['Ingresos generados (Bs)', metrics.totalIncome],
      ['Comisión (Bs)', metrics.commission],
      [],
      ['DETALLE DE CITAS'],
      ['Fecha', 'Paciente', 'Motivo', 'Estado', 'Monto (Bs)'],
      ...rows.map(row => [
        row.date, row.patientName, row.reason,
        statusLabel(row.status), row.amount || 0,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte-medil-${dateFrom}-${dateTo}.xlsx`);
    notify(MESSAGES.success.reportDownloaded, 'success');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Reportes</h1>
        <p className="text-sm text-gray-400">Análisis de desempeño por profesional</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Profesional">
            <select className={inputClass} value={selectedProfessional} onChange={e => setSelectedProfessional(e.target.value)}>
              <option value="">Todos los profesionales</option>
              {professionals.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </FormField>
          <FormField label="Desde">
            <input type="date" className={inputClass} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </FormField>
          <FormField label="Hasta">
            <input type="date" className={inputClass} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </FormField>
        </div>
        <div className="mt-4">
          <Button label="Generar reporte" loading={loading} onClick={handleGenerateReport} />
        </div>
      </div>

      {/* Resultados */}
      {report && (report.rows.length === 0 ? (
        <EmptyState title={MESSAGES.empty.reports.noData} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Metric label="Citas atendidas"   value={report.metrics.attended}            color="text-[#0E4A8A]" />
            <Metric label="Citas canceladas"  value={report.metrics.cancelled}           color="text-red-500" />
            <Metric label="Pacientes únicos"  value={report.metrics.uniquePatients}      color="text-[#00B4D8]" />
            <Metric label="Ingresos (Bs)"     value={`Bs. ${report.metrics.totalIncome}`} color="text-green-600" />
            <Metric label="Comisión (Bs)"     value={`Bs. ${report.metrics.commission}`}  color="text-orange-500" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Fecha</th>
                  <th className="text-left px-4 py-2 font-semibold">Paciente</th>
                  <th className="text-left px-4 py-2 font-semibold">Motivo</th>
                  <th className="text-left px-4 py-2 font-semibold">Estado</th>
                  <th className="text-right px-4 py-2 font-semibold">Monto</th>
                  <th className="text-right px-4 py-2 font-semibold">Comisión</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-700">{row.date}</td>
                    <td className="px-4 py-2 text-gray-700">{row.patientName}</td>
                    <td className="px-4 py-2 text-gray-500">{row.reason}</td>
                    <td className="px-4 py-2"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-2 text-right text-gray-700">Bs. {row.amount || 0}</td>
                    <td className="px-4 py-2 text-right text-gray-700">Bs. {row.commission || 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold text-[#0E4A8A]">
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-2" colSpan={4}>Totales</td>
                  <td className="px-4 py-2 text-right">Bs. {report.metrics.totalIncome}</td>
                  <td className="px-4 py-2 text-right">Bs. {report.metrics.commission}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-3">
            <Button label="📄 Descargar PDF"   variant="primary" onClick={handleDownloadPDF} />
            <Button label="📊 Descargar Excel" variant="ghost"   onClick={handleDownloadExcel} />
          </div>
        </>
      ))}
    </div>
  );
}
