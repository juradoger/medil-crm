// Servicio de insumos y suministros médicos
import { db } from '../lib/insforge';
import { SUPPLY_STATUS } from '../core/constants';

export const supplyService = {
  calculateStatus(current, minimum) {
    const curr = Number(current);
    const min  = Number(minimum);
    if (curr === 0) return SUPPLY_STATUS.CRITICAL;
    if (curr <= min) return SUPPLY_STATUS.LOW;
    return SUPPLY_STATUS.OK;
  },

  async getAll(branchId) {
    if (!branchId) return [];
    const { data, error } = await db.from('supplies').select('*').eq('branchId', branchId);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(branchId, payload) {
    const status = this.calculateStatus(payload.stockCurrent, payload.stockMinimum);
    const { data, error } = await db.from('supplies').insert({
      name:         payload.name,
      branchId:     branchId,
      stockCurrent: Number(payload.stockCurrent),
      stockMinimum: Number(payload.stockMinimum),
      unit:         payload.unit,
      status:       status,
    }).select();
    if (error) throw new Error(error.message);
    return data?.[0];
  },

  async update(id, payload) {
    const updateData = { ...payload };
    if (payload.stockCurrent !== undefined && payload.stockMinimum !== undefined) {
      updateData.status = this.calculateStatus(payload.stockCurrent, payload.stockMinimum);
    }
    const { data, error } = await db.from('supplies').update(updateData).eq('id', id).select();
    if (error) throw new Error(error.message);
    return data?.[0];
  },

  async adjustStock(id, newStock, minimum) {
    const status = this.calculateStatus(newStock, minimum);
    const { data, error } = await db.from('supplies').update({
      stockCurrent: Number(newStock),
      status:       status,
    }).eq('id', id).select();
    if (error) throw new Error(error.message);
    return data?.[0];
  },

  async remove(id) {
    const { error } = await db.from('supplies').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
};
