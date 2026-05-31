import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

let client = null;

export function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error(
      'Credenciales de Twilio no configuradas. ' +
      'Agregá TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN al .env'
    );
  }

  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

export const TWILIO_FROM = process.env.TWILIO_WHATSAPP_FROM
  || 'whatsapp:+14155238886';
