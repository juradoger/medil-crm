/**
 * Interfaz base para adaptadores de pago — Base interface for payment adapters
 *
 * Define el contrato que todo adaptador debe implementar.
 * Defines the contract that every adapter must implement.
 *
 * Uso — Usage:
 *   class MyAdapter extends IPaymentAdapter { ... }
 */
export class IPaymentAdapter {
  /**
   * Genera un código QR para iniciar el pago — Generates a QR code to initiate payment
   * @param {Object} data
   * @param {string} data.appointmentId
   * @param {number} data.amount - Monto en Bs — Amount in Bs
   * @param {string} data.branchId
   * @returns {Promise<{ qrCode: string, transactionId: string }>}
   */
  async generateQR(data) {
    throw new Error('Not implemented — No implementado: generateQR');
  }

  /**
   * Verifica el estado de una transacción — Checks the status of a transaction
   * @param {string} transactionId
   * @returns {Promise<{ status: string }>} status: 'pending' | 'approved' | 'rejected'
   */
  async checkPaymentStatus(transactionId) {
    throw new Error('Not implemented — No implementado: checkPaymentStatus');
  }
}
