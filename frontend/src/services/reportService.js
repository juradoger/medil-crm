// Servicio de reportes — agrega citas y pagos de un período para análisis
import { db } from '../lib/insforge';
import { APPOINTMENT_STATUS, DEFAULT_COMMISSION_RATE } from '../core/constants';
import { professionalService } from './professionalService';

export const reportService = {
  // Devuelve { rows, metrics } de las citas del período (filtrable por profesional)
  async getReport(professionalId, dateFrom, dateTo) {
    const { data: appts, error } = await db.from('appointments')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo);
    if (error) throw new Error(error.message);

    let appointments = appts ?? [];
    if (professionalId) {
      appointments = appointments.filter(a => a.professionalId === professionalId);
    }

    // Pagos del sistema indexados por cita
    const { data: payments } = await db.from('payments').select('*');
    const paymentByAppt = new Map((payments ?? []).map(p => [p.appointmentId, p]));

    // Tasa de comisión por profesional
    const professionals = await professionalService.getAll();
    const rateByProf = new Map(
      professionals.map(p => [p.id, p.commissionRate ?? DEFAULT_COMMISSION_RATE])
    );

    const rows = appointments.map(a => {
      const payment = paymentByAppt.get(a.id);
      const amount  = Number(payment?.amount ?? 0);
      const rate    = rateByProf.get(a.professionalId) ?? DEFAULT_COMMISSION_RATE;
      const commission = parseFloat((amount * rate).toFixed(2));
      return {
        date:        a.date,
        patientName: a.patientName ?? '—',
        reason:      a.reason ?? '—',
        status:      a.status,
        amount,
        commission,
      };
    });

    const metrics = {
      attended:      rows.filter(r => r.status === APPOINTMENT_STATUS.ATTENDED).length,
      cancelled:     rows.filter(r => r.status === APPOINTMENT_STATUS.CANCELLED).length,
      uniquePatients: new Set(appointments.map(a => a.patientId).filter(Boolean)).size,
      totalIncome:   parseFloat(rows.reduce((sum, r) => sum + r.amount, 0).toFixed(2)),
      commission:    parseFloat(rows.reduce((sum, r) => sum + r.commission, 0).toFixed(2)),
    };

    return { rows, metrics };
  },
};
