// Chequeo de conectividad con la IA (Groq) — llamada mínima
// AI (Groq) connectivity check — minimal call
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const { askGroq } = await import('../lib/groq.js');

async function testAI() {
  console.log('Verificando Groq API...');
  console.log('API Key:', (process.env.GROQ_API_KEY?.slice(0, 15) ?? '(ausente)') + '...');

  try {
    const response = await askGroq(
      'Respondé solo en español.',
      'Decí exactamente: "Groq API funcionando correctamente"',
      50
    );
    console.log('✅ Groq API conectada correctamente');
    console.log('Respuesta:', response);
    process.exit(0);
  } catch (error) {
    if (error.message.includes('GROQ_API_KEY')) {
      console.error('❌ GROQ_API_KEY no configurada');
      console.log('Obtené una gratis en console.groq.com');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

await testAI();
