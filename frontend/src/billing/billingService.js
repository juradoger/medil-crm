// Servicio de facturación con Adapter Pattern — Billing service with Adapter Pattern
import { QR_COMMISSION_PERCENTAGE } from '../core/constants';
import { SimulatedQRAdapter } from './adapters/SimulatedQRAdapter';
import { PagoFacilAdapter } from './adapters/PagoFacilAdapter';

/**
 * Calcula la comisión QR sobre un monto — Calculates QR commission on an amount
 * Función pura extraída para facilitar pruebas — Pure function extracted for testability
 * @param {number} amount
 * @returns {number}
 */
function calculateCommission(amount) {
  return parseFloat((amount * QR_COMMISSION_PERCENTAGE).toFixed(2));
}

export class BillingService {
  /**
   * @param {import('./adapters/IPaymentAdapter').IPaymentAdapter} adapter
   */
  constructor(adapter) {
    this.adapter = adapter;
  }

  /**
   * Calcula subtotal, comisión y total — Calculates subtotal, commission and total
   * @param {number} amount - Monto base en Bs — Base amount in Bs
   * @returns {{ subtotal: number, commission: number, total: number }}
   */
  calculateTotal(amount) {
    if (amount <= 0) {
      throw new Error(
        'El monto debe ser mayor a cero — Amount must be greater than zero'
      );
    }

    const commission = calculateCommission(amount);
    return {
      subtotal:   amount,
      commission,
      total:      amount + commission,
    };
  }

  /**
   * Genera un QR delegando al adaptador — Generates a QR delegating to the adapter
   * @param {{ appointmentId: string, amount: number, branchId: string }} data
   * @returns {Promise<{ qrCode: string, transactionId: string }>}
   */
  async generatePaymentQR(data) {
    return this.adapter.generateQR(data);
  }

  /**
   * Verifica el estado de pago delegando al adaptador — Checks payment status delegating to adapter
   * @param {string} transactionId
   * @returns {Promise<{ status: string }>}
   */
  async checkPaymentStatus(transactionId) {
    return this.adapter.checkPaymentStatus(transactionId);
  }
}

// Instancia por defecto según entorno — Default instance by environment
const adapter = import.meta.env.PROD
  ? new PagoFacilAdapter()
  : new SimulatedQRAdapter();

export const billingService = new BillingService(adapter);
