// Envío de prueba de WhatsApp — captura el error/código exacto de Twilio
// Uso: node scripts/test-whatsapp-send.js +5917XXXXXXX
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const { getTwilioClient, TWILIO_FROM } = await import('../lib/twilio.js');

const to = process.argv[2];
if (!to) {
  console.error('Falta el número. Uso: node scripts/test-whatsapp-send.js +5917XXXXXXX');
  process.exit(1);
}

const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

console.log(`From: ${TWILIO_FROM}`);
console.log(`To:   ${toFormatted}`);

try {
  const client = getTwilioClient();
  const msg = await client.messages.create({
    from: TWILIO_FROM,
    to: toFormatted,
    body: 'Prueba de recordatorio MedIL CRM ✅',
  });
  console.log(`\n✅ Mensaje aceptado por Twilio`);
  console.log(`   SID:    ${msg.sid}`);
  console.log(`   Status: ${msg.status}`);

  // Esperar y consultar el estado final de entrega
  await new Promise(r => setTimeout(r, 4000));
  const updated = await client.messages(msg.sid).fetch();
  console.log(`\n   Estado final: ${updated.status}`);
  if (updated.errorCode) {
    console.log(`   ⚠️  errorCode: ${updated.errorCode} — ${updated.errorMessage}`);
  }
} catch (e) {
  console.error(`\n❌ Error de Twilio`);
  console.error(`   code:    ${e.code}`);
  console.error(`   message: ${e.message}`);
  if (e.moreInfo) console.error(`   info:    ${e.moreInfo}`);
  process.exit(1);
}
