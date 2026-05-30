#!/usr/bin/env node
// Script de siembra de datos de prueba — Test data seeding script
// Uso: node scripts/seed-insforge.js
// Lee las credenciales de frontend/.env

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

const env = loadEnv();
const BASE_URL = env.VITE_INSFORGE_API_URL;
const API_KEY  = env.VITE_INSFORGE_API_KEY;

if (!BASE_URL || !API_KEY) {
  console.error('Faltan VITE_INSFORGE_API_URL o VITE_INSFORGE_API_KEY en frontend/.env');
  process.exit(1);
}

async function post(collection, data) {
  const res = await fetch(`${BASE_URL}/api/database/records/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = JSON.stringify(body);
    if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists')) {
      console.log(`   i   ${collection}: registro duplicado, omitiendo`);
      return null;
    }
    console.warn(`   !   ${collection} HTTP ${res.status}:`, msg.slice(0, 200));
    return null;
  }
  return Array.isArray(body) ? body[0] : body;
}

const today = new Date().toISOString().slice(0, 10);

// scheduledDate = 24 hs antes de la cita
function minus24h(time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

console.log('\nSembrando datos de prueba en InsForge');
console.log(`URL: ${BASE_URL}\n`);

// ── 1. BRANCH ────────────────────────────────────────────────────────────────
console.log('branches (1)');
const branch = await post('branches', {
  name:    'Clinica Central MedIL',
  address: 'Av. Arce 123',
  city:    'La Paz',
  phone:   '+591 2 2123456',
  status:  'active',
});
if (branch) console.log('   OK  Clinica Central MedIL ->', branch.id);

// ── 2. USERS ─────────────────────────────────────────────────────────────────
console.log('users (3)');
const adminUser = await post('users', {
  email:        'admin@medil.com',
  passwordHash: 'admin123',
  role:         'admin',
  fullName:     'Admin MedIL',
  isActive:     true,
});
if (adminUser) console.log('   OK  admin@medil.com ->', adminUser.id);

const doctorUser = await post('users', {
  email:        'doctor@medil.com',
  passwordHash: 'doctor123',
  role:         'doctor',
  fullName:     'Dra. Carmen Solis',
  isActive:     true,
});
if (doctorUser) console.log('   OK  doctor@medil.com ->', doctorUser.id);

const patientUser = await post('users', {
  email:        'paciente@medil.com',
  passwordHash: 'paciente123',
  role:         'patient',
  fullName:     'Carmen Solis Vega',
  isActive:     true,
});
if (patientUser) console.log('   OK  paciente@medil.com ->', patientUser.id);

// ── 3. PROFESSIONAL ──────────────────────────────────────────────────────────
console.log('professionals (1)');
const prof = await post('professionals', {
  fullName:  'Dra. Carmen Solis',
  specialty: 'Medicina General',
  phone:     '+591 70011223',
  email:     'doctor@medil.com',
});
if (prof) console.log('   OK  Dra. Carmen Solis ->', prof.id);

// ── 4. PATIENTS ──────────────────────────────────────────────────────────────
// El schema real de InsForge usa 'name', no 'fullName'
console.log('patients (3)');
const p1 = await post('patients', {
  name:   'Carmen Solis Vega',
  email:  'carmen@gmail.com',
  phone:  '+591 70011223',
  status: 'active',
});
if (p1) console.log('   OK  Carmen Solis Vega ->', p1.id);

const p2 = await post('patients', {
  name:   'Marco Antonio Ruiz',
  email:  'm.ruiz@outlook.com',
  phone:  '+591 71288904',
  status: 'active',
});
if (p2) console.log('   OK  Marco Antonio Ruiz ->', p2.id);

const p3 = await post('patients', {
  name:   'Lucia Fernandez Paz',
  email:  'lucia.fp@gmail.com',
  phone:  '+591 76540117',
  status: 'active',
});
if (p3) console.log('   OK  Lucia Fernandez Paz ->', p3.id);

// ── 5. APPOINTMENTS ──────────────────────────────────────────────────────────
console.log('appointments (3)');
const a1 = await post('appointments', {
  patientId:      p1?.id ?? null,
  patientName:    'Carmen Solis Vega',
  professionalId: prof?.id ?? null,
  professional:   'Dra. Carmen Solis',
  date:           today,
  time:           '08:30',
  reason:         'Control de presion arterial',
  status:         'scheduled',
});
if (a1) console.log('   OK  Cita Carmen 08:30 ->', a1.id);

const a2 = await post('appointments', {
  patientId:      p2?.id ?? null,
  patientName:    'Marco Antonio Ruiz',
  professionalId: prof?.id ?? null,
  professional:   'Dra. Carmen Solis',
  date:           today,
  time:           '09:15',
  reason:         'Consulta dermatologica',
  status:         'scheduled',
});
if (a2) console.log('   OK  Cita Marco 09:15 ->', a2.id);

const a3 = await post('appointments', {
  patientId:      p3?.id ?? null,
  patientName:    'Lucia Fernandez Paz',
  professionalId: prof?.id ?? null,
  professional:   'Dra. Carmen Solis',
  date:           today,
  time:           '10:00',
  reason:         'Resultados de laboratorio',
  status:         'attended',
});
if (a3) console.log('   OK  Cita Lucia 10:00 (atendida) ->', a3.id);

// ── 6. REMINDERS ─────────────────────────────────────────────────────────────
// El schema real usa 'sendAt', no 'scheduledDate'
console.log('reminders (2)');
const r1 = await post('reminders', {
  appointmentId: a1?.id ?? null,
  patientId:     p1?.id ?? null,
  message:       `Recordatorio: tiene una cita el ${today} a las 08:30`,
  sendAt:        minus24h('08:30'),
  status:        'pending',
});
if (r1) console.log('   OK  Recordatorio Carmen ->', r1.id);

const r2 = await post('reminders', {
  appointmentId: a2?.id ?? null,
  patientId:     p2?.id ?? null,
  message:       `Recordatorio: tiene una cita el ${today} a las 09:15`,
  sendAt:        minus24h('09:15'),
  status:        'pending',
});
if (r2) console.log('   OK  Recordatorio Marco ->', r2.id);

console.log('\nListo!\n');
console.log('Credenciales de acceso:');
console.log('  Admin    - admin@medil.com    / admin123');
console.log('  Doctor   - doctor@medil.com   / doctor123');
console.log('  Paciente - paciente@medil.com / paciente123\n');
