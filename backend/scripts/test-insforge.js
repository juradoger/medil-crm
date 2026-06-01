// Chequeo de conectividad con InsForge — lectura no destructiva
// InsForge connectivity check — non-destructive read
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// Import dinámico: el cliente lee process.env al evaluarse, así que cargamos .env primero
const { db } = await import('../infrastructure/insforge.js');

try {
  const { data, error } = await db.from('branches').select('*');
  if (error) throw new Error(error.message);
  console.log(`✅ InsForge conectado — ${data?.length ?? 0} sucursales encontradas`);
  process.exit(0);
} catch (e) {
  console.error(`❌ InsForge error: ${e.message}`);
  process.exit(1);
}
