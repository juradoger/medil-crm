// Adaptador para PagoFácil Bolivia (producción)
import { IPaymentAdapter } from './IPaymentAdapter';

export class PagoFacilAdapter extends IPaymentAdapter {
  constructor() {
    super();
    const apiUrl = import.meta.env.VITE_PAGOFACIL_API_URL;
    const apiKey = import.meta.env.VITE_PAGOFACIL_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error(
        'PagoFácil no configurado: VITE_PAGOFACIL_API_URL y VITE_PAGOFACIL_API_KEY son requeridas'
      );
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Genera un QR real a través de la API de PagoFácil — Generates a real QR via PagoFácil API
   * TODO: configurar credenciales reales de PagoFácil Bolivia — configure real PagoFácil Bolivia credentials
   */
  async generateQR(data) {
    const response = await fetch(`${this.apiUrl}/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`PagoFácil error al generar QR: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Verifica el estado de pago con PagoFácil — Checks payment status with PagoFácil
   * TODO: configurar credenciales reales de PagoFácil Bolivia — configure real PagoFácil Bolivia credentials
   */
  async checkPaymentStatus(transactionId) {
    const response = await fetch(`${this.apiUrl}/check-status/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`PagoFácil error al verificar estado: ${response.status}`);
    }

    return response.json();
  }
}
