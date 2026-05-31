// Facturación y pagos (solo admin)
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import { paymentService } from '../../services/paymentService';
import { DataTable } from '../../organisms/DataTable';
import { StatusBadge } from '../../molecules/StatusBadge';
import { ConfirmModal } from '../../molecules/ConfirmModal';
import { PaymentModal } from '../../organisms/PaymentModal';
import { FullPageSpinner } from '../../atoms/Spinner';

const STANDARD_FEE = 150; // Tarifa estándar por consulta en Bs

export default function Billing() {
  const { currentBranchId } = useAuth();
  const { appointments, loading: loadA, reload: reloadA } = useAppointments(currentBranchId);

  const [payments, setPayments]       = useState([]);
  const [loadP, setLoadP]             = useState(true);
  const [qrTarget, setQrTarget]       = useState(null);
  const [cashTarget, setCashTarget]   = useState(null);
  const [processing, setProcessing]   = useState(false);

  const loadPayments = async () => {
    if (!currentBranchId) return;
    setLoadP(true);
    try {
      const data = await paymentService.getAll(currentBranchId);
      setPayments(data);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoadP(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranchId]);

  // Mapear pagos por appointmentId para búsqueda rápida
  const paymentMap = useMemo(() => {
    const map = new Map();
    for (const p of payments) {
      if (p.status === 'approved') {
        map.set(p.appointmentId, p);
      }
    }
    return map;
  }, [payments]);

  // Resumen de Facturación
  const { totalCollected, totalPending } = useMemo(() => {
    let collected = 0;
    let pending = 0;

    for (const p of payments) {
      if (p.status === 'approved') {
        collected += Number(p.amount);
      }
    }

    // Citas atendidas sin pago registrado se consideran pendientes
    for (const a of appointments) {
      if (a.status === 'attended' && !paymentMap.has(a.id)) {
        pending += STANDARD_FEE;
      }
    }

    return { totalCollected: collected, totalPending: pending };
  }, [appointments, payments, paymentMap]);

  // Citas que requieren facturación/seguimiento (atendidas)
  const billingRows = useMemo(() => {
    return appointments
      .filter(a => a.status === 'attended')
      .map(a => {
        const payment = paymentMap.get(a.id);
        return {
          ...a,
          paymentStatus: payment ? 'approved' : 'pending',
          paymentMethod: payment ? payment.paymentMethod : null,
          amountPaid: payment ? payment.amount : null,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, paymentMap]);

  const columns = [
    { key: 'date',         label: 'Fecha', render: r => `${r.date} ${r.time?.slice(0, 5) ?? ''}` },
    { key: 'patientName',  label: 'Paciente' },
    { key: 'professional', label: 'Profesional' },
    { key: 'cost',         label: 'Monto', render: r => `Bs. ${r.amountPaid ?? STANDARD_FEE}` },
    {
      key: 'paymentStatus',
      label: 'Estado de Pago',
      render: r => (
        <StatusBadge
          status={r.paymentStatus}
          label={r.paymentStatus === 'approved' ? `Cobrado (${r.paymentMethod === 'qr' ? 'QR' : 'Efectivo'})` : 'Pendiente'}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      render: r => r.paymentStatus === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => setQrTarget(r)}
            className="p-1.5 text-white bg-[#00B4D8] hover:bg-[#0096B4] rounded transition-colors"
            title="Cobrar con QR"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
          <button
            onClick={() => setCashTarget(r)}
            className="p-1.5 text-[#00B4D8] border border-[#00B4D8] hover:bg-[#00B4D8]/10 rounded transition-colors"
            title="Cobrar en efectivo"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const handleQrSuccess = async () => {
    if (!qrTarget) return;
    setProcessing(true);
    try {
      await paymentService.create({
        appointmentId: qrTarget.id,
        branchId:      currentBranchId,
        amount:        STANDARD_FEE,
        commission:    STANDARD_FEE * 0.02,
        totalAmount:   STANDARD_FEE * 1.02,
        paymentMethod: 'qr',
        status:        'approved',
      });
      await loadPayments();
      await reloadA();
    } catch (e) {
      console.error(e.message);
    } finally {
      setProcessing(false);
      setQrTarget(null);
    }
  };

  const handleCashSuccess = async () => {
    if (!cashTarget) return;
    setProcessing(true);
    try {
      await paymentService.create({
        appointmentId: cashTarget.id,
        branchId:      currentBranchId,
        amount:        STANDARD_FEE,
        commission:    0,
        totalAmount:   STANDARD_FEE,
        paymentMethod: 'cash',
        status:        'approved',
      });
      await loadPayments();
      await reloadA();
    } catch (e) {
      console.error(e.message);
    } finally {
      setProcessing(false);
      setCashTarget(null);
    }
  };

  if (loadA || loadP || processing) return <FullPageSpinner />;

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
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Facturación y Cobros</h1>
        <p className="text-sm text-gray-400 mt-0.5">Control de ingresos y pagos de consultas médicas</p>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Cobrado</p>
            <p className="text-2xl font-bold text-green-600 mt-1">Bs. {totalCollected.toFixed(2)}</p>
          </div>
          <span className="h-3 w-3 rounded-full bg-green-600" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Por Cobrar (Pendiente)</p>
            <p className="text-2xl font-bold text-orange-500 mt-1">Bs. {totalPending.toFixed(2)}</p>
          </div>
          <span className="h-3 w-3 rounded-full bg-orange-500" />
        </div>
      </div>

      {/* Listado de Consultas para facturar */}
      <DataTable columns={columns} rows={billingRows} emptyTitle="Sin consultas por facturar" />

      {qrTarget && (
        <PaymentModal
          isOpen={!!qrTarget}
          onClose={() => setQrTarget(null)}
          appointmentId={qrTarget.id}
          amount={STANDARD_FEE}
          branchId={currentBranchId}
          onPaymentSuccess={handleQrSuccess}
        />
      )}

      <ConfirmModal
        open={!!cashTarget}
        title="Confirmar cobro en efectivo"
        description={`¿Registrar cobro en efectivo de Bs. ${STANDARD_FEE} para la consulta de ${cashTarget?.patientName}?`}
        onConfirm={handleCashSuccess}
        onCancel={() => setCashTarget(null)}
      />
    </div>
  );
}
