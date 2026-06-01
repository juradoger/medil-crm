// Limpieza total de InsForge — elimina todos los registros de todas las tablas
// Total InsForge cleanup — deletes all records from all tables
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// Import dinámico: el cliente lee process.env al evaluarse, así que cargamos .env primero
const { db } = await import('../infrastructure/insforge.js');

async function cleanInsforge() {
  console.log('🧹 Limpiando InsForge...');
  console.log('⚠️  Esto eliminará TODOS los datos existentes');
  console.log('');

  // Orden respeta dependencias: primero las tablas que referencian a otras
  const tables = [
    'reminders',
    'medical_records',
    'payments',
    'appointments',
    'supplies',
    'patients',
    'professionals',
    'users',
    'branches',
  ];

  for (const table of tables) {
    try {
      const { data: existing, error } = await db.from(table).select('id');
      if (error) throw new Error(error.message);

      if (!existing?.length) {
        console.log(`  ⏭  ${table}: vacía`);
        continue;
      }

      const ids = existing.map(r => r.id);
      for (const id of ids) {
        await db.from(table).delete().eq('id', id);
      }

      console.log(`  ✅ ${table}: ${ids.length} registros eliminados`);
    } catch (error) {
      console.log(`  ❌ ${table}: ${error.message}`);
    }
  }

  console.log('\n✅ Limpieza completada');
  console.log('Ahora corré: node scripts/seed-insforge.js');
}

await cleanInsforge();
