#!/usr/bin/env node
// Crea las tablas faltantes en InsForge — Creates missing InsForge tables
// Uso: node scripts/create-tables.js

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const lines = readFileSync(resolve(__dirname, '../frontend/.env'), 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const [k, ...rest] = line.split('=');
    if (k?.trim()) env[k.trim()] = rest.join('=').trim();
  }
  return env;
}

const { VITE_INSFORGE_API_URL: BASE, VITE_INSFORGE_API_KEY: KEY } = loadEnv();

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, ok: res.ok, json };
}

async function createTable(tableName, columns) {
  const { status, ok, json } = await request('POST', '/api/database/tables', { tableName, columns });
  if (ok) {
    console.log(`   ✅  Tabla '${tableName}' creada`);
  } else if (status === 409 || JSON.stringify(json).includes('already exists') || JSON.stringify(json).includes('duplicate')) {
    console.log(`   ℹ️   Tabla '${tableName}' ya existe — skipping`);
  } else {
    console.warn(`   ⚠️   '${tableName}' HTTP ${status}:`, JSON.stringify(json).slice(0, 200));
  }
}

async function post(collection, data) {
  const res = await fetch(`${BASE}/api/database/records/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (JSON.stringify(body).includes('duplicate') || JSON.stringify(body).includes('unique')) {
      console.log(`   ℹ️   Registro ya existe — record already exists`);
      return null;
    }
    console.warn(`   ⚠️   ${collection} HTTP ${res.status}:`, JSON.stringify(body).slice(0, 150));
    return null;
  }
  return Array.isArray(body) ? body[0] : body;
}

// Definición de columnas — Column definition helper
const col = (columnName, type, extra = {}) => ({
  columnName,
  type,
  isNullable: true,
  isUnique: false,
  ...extra,
});

console.log('\n🏗️   Creando tablas en InsForge — Creating tables in InsForge\n');

// ── 1. Tabla users ──
await createTable('users', [
  col('email',        'string', { isNullable: false, isUnique: true }),
  col('passwordHash', 'string', { isNullable: false }),
  col('role',         'string', { isNullable: false }),
  col('fullName',     'string'),
  col('isActive',     'boolean', { defaultValue: 'true' }),
]);

// ── 2. Tabla branches ──
await createTable('branches', [
  col('name',    'string', { isNullable: false }),
  col('city',    'string'),
  col('address', 'string'),
  col('phone',   'string'),
  col('status',  'string', { defaultValue: "'active'" }),
]);

// ── 3. Tabla professionals ──
await createTable('professionals', [
  col('fullName',  'string', { isNullable: false }),
  col('specialty', 'string'),
  col('email',     'string'),
  col('phone',     'string'),
]);

console.log('\n👤  Insertando datos iniciales — Inserting initial data\n');

// ── Sucursal central ──
console.log('📦  branches');
const branch = await post('branches', {
  name: 'Clínica Central', city: 'La Paz', address: 'Av. Arce 1234', phone: '2-2345678', status: 'active',
});
if (branch) console.log('   ✅  Clínica Central →', branch.id);

// ── Profesionales ──
console.log('📦  professionals');
const prof1 = await post('professionals', { fullName: 'Dra. Carmen Solís',   specialty: 'Medicina General' });
const prof2 = await post('professionals', { fullName: 'Dr. Roberto Quiroga', specialty: 'Pediatría' });
if (prof1) console.log('   ✅  Dra. Carmen Solís →', prof1.id);
if (prof2) console.log('   ✅  Dr. Roberto Quiroga →', prof2.id);

// ── Admin user ──
console.log('📦  users');
const admin = await post('users', {
  email: 'admin@medil.com', passwordHash: 'admin123',
  role: 'admin', fullName: 'Admin MedIL', isActive: true,
});
const doctor = await post('users', {
  email: 'doctor@medil.com', passwordHash: 'doctor123',
  role: 'doctor', fullName: 'Dra. Carmen Solís', isActive: true,
});
if (admin)  console.log('   ✅  admin@medil.com →', admin.id);
if (doctor) console.log('   ✅  doctor@medil.com →', doctor.id);

console.log('\n✨  Listo — Done!\n');
console.log('═══════════════════════════════════════════');
console.log('  Abrí http://localhost:5173 y loguéate:');
console.log('  📧  admin@medil.com');
console.log('  🔑  admin123');
console.log('═══════════════════════════════════════════\n');
