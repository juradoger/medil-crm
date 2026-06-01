// Chequeo de conectividad con Cloudinary — api.ping (no destructivo)
// Cloudinary connectivity check — api.ping (non-destructive)
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const cloudinary = (await import('../lib/cloudinary.js')).default;

try {
  const res = await cloudinary.api.ping();
  console.log(`✅ Cloudinary conectado — estado: ${res.status}`);
  process.exit(0);
} catch (e) {
  console.error(`❌ Cloudinary error: ${e.message}`);
  process.exit(1);
}
