// Chequeo de conectividad con Claude API — llamada mínima (5 tokens)
// Claude API connectivity check — minimal call (5 tokens)
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const { askClaude } = await import('../lib/claude.js');

try {
  const text = await askClaude('Respondé únicamente la palabra "ok".', 'ping', 5);
  console.log(`✅ Claude API conectada — respuesta: "${text.trim().slice(0, 40)}"`);
  process.exit(0);
} catch (e) {
  console.error(`❌ Claude error: ${e.message}`);
  process.exit(1);
}
