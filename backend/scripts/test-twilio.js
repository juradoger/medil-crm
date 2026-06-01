// Chequeo de conectividad con Twilio — valida credenciales (no envía mensajes)
// Twilio connectivity check — validates credentials (does not send messages)
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const { getTwilioClient } = await import('../lib/twilio.js');

try {
  const client = getTwilioClient();
  const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
  console.log(`✅ Twilio conectado — cuenta "${account.friendlyName}" (${account.status})`);
  process.exit(0);
} catch (e) {
  console.error(`❌ Twilio error: ${e.message}`);
  process.exit(1);
}
