// Adaptador simulado para desarrollo — Simulated adapter for development
import { IPaymentAdapter } from './IPaymentAdapter';
import { PAYMENT_STATUS } from '../../core/constants';

export class SimulatedQRAdapter extends IPaymentAdapter {
  /**
   * Simula generación de QR con 500ms de latencia — Simulates QR generation with 500ms latency
   * @returns {Promise<{ qrCode: string, transactionId: string }>}
   */
  async generateQR(_data) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const transactionId = crypto.randomUUID();
    return {
      qrCode: `data:image/png;base64,SIMULATED_QR_${transactionId}`,
      transactionId,
    };
  }

  /**
   * Simula verificación de pago — Simulates payment verification
   * Siempre retorna approved después de 1500ms — Always returns approved after 1500ms
   * @returns {Promise<{ status: string }>}
   */
  async checkPaymentStatus(_transactionId) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { status: PAYMENT_STATUS.APPROVED };
  }
}
