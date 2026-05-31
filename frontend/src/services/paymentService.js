// Servicio de facturación y pagos — Payment service
import { db } from '../lib/insforge';
import { PAYMENT_STATUS } from '../core/constants';

export const paymentService = {
  async getAll(branchId) {
    if (!branchId) return [];
    const { data, error } = await db.from('payments').select('*').eq('branchId', branchId);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(payload) {
    const { data, error } = await db.from('payments').insert({
      appointmentId: payload.appointmentId,
      branchId:      payload.branchId,
      amount:        Number(payload.amount),
      commission:    Number(payload.commission),
      totalAmount:   Number(payload.totalAmount),
      paymentMethod: payload.paymentMethod,
      status:        payload.status ?? PAYMENT_STATUS.APPROVED,
    }).select();
    if (error) throw new Error(error.message);
    return data?.[0];
  }
};
