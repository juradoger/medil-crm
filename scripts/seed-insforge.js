#!/usr/bin/env node
// Script de siembra de datos de prueba — Test data seeding script
// Uso: node scripts/seed-insforge.js
// Lee las credenciales de frontend/.env

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '../frontend/.env');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && key.trim()) env[key.trim()] = rest.join('=').trim();
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
    console.warn(`  ${collection} HTTP ${res.status}:`, JSON.stringify(body).slice(0, 150));
    return null;
  }
  return Array.isArray(body) ? body[0] : body;
}

const today    = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

console.log('\nSembrando datos de prueba en InsForge — Seeding test data in InsForge');
console.log(`   URL: ${BASE_URL}\n`);

// ── 1. Sucursal ──────────────────────────────────────────────────────────────
console.log('branches (1)');
const branch = await post('branches', {
  name:    'Clínica Central MedIL',
  address: 'Av. 6 de Agosto 1234',
  city:    'La Paz',
  phone:   '2-2441000',
  email:   'central@medil.com',
  status:  'active',
});
if (branch) console.log('   Clínica Central ->', branch.id);
const branchId = branch?.id ?? 'branch-seed';

// ── 2. Usuarios ──────────────────────────────────────────────────────────────
console.log('users (2)');
const adminUser = await post('users', {
  email:        'admin@medil.com',
  passwordHash: 'admin123',
  role:         'admin',
  branchId,
  isActive:     true,
});
if (adminUser) console.log('   Admin ->', adminUser.id);

const doctorUser = await post('users', {
  email:        'doctor@medil.com',
  passwordHash: 'doctor123',
  role:         'doctor',
  branchId,
  isActive:     true,
});
if (doctorUser) console.log('   Doctor ->', doctorUser.id);

// ── 3. Profesional vinculado al doctor ───────────────────────────────────────
console.log('professionals (1)');
const professional = await post('professionals', {
  fullName:  'Dra. Carmen Solís',
  specialty: 'Medicina General',
  phone:     '70099001',
  email:     'doctor@medil.com',
  branchId,
  userId:    doctorUser?.id ?? null,
  isActive:  true,
});
if (professional) console.log('   Dra. Carmen Solís ->', professional.id);

// ── 4. Pacientes ─────────────────────────────────────────────────────────────
console.log('patients (2)');
const patient1 = await post('patients', {
  fullName:   'María López Quispe',
  documentId: '12345678',
  phone:      '70011001',
  email:      'maria@example.com',
  birthDate:  '1985-03-15',
  status:     'active',
  branchId,
  userId:     null,
});
if (patient1) console.log('   María López ->', patient1.id);

const patient2 = await post('patients', {
  fullName:   'Carlos Mamani Flores',
  documentId: '87654321',
  phone:      '70022002',
  email:      'carlos@example.com',
  birthDate:  '1990-07-22',
  status:     'active',
  branchId,
  userId:     null,
});
if (patient2) console.log('   Carlos Mamani ->', patient2.id);

// ── 5. Citas de ejemplo ──────────────────────────────────────────────────────
console.log('appointments (2)');
const appt1 = await post('appointments', {
  patientId:      patient1?.id,
  professionalId: professional?.id,
  branchId,
  date:   today,
  time:   '09:00',
  reason: 'Control general',
  status: 'scheduled',
});
if (appt1) console.log('   Cita María hoy ->', appt1.id);

const appt2 = await post('appointments', {
  patientId:      patient2?.id,
  professionalId: professional?.id,
  branchId,
  date:   tomorrow,
  time:   '11:00',
  reason: 'Seguimiento pediatría',
  status: 'scheduled',
});
if (appt2) console.log('   Cita Carlos mañana ->', appt2.id);

// ── 6. Recordatorios ─────────────────────────────────────────────────────────
console.log('reminders (2)');
const rem1 = await post('reminders', {
  appointmentId: appt1?.id,
  patientId:     patient1?.id,
  branchId,
  message:       `Recordatorio: tiene una cita el ${today} a las 09:00`,
  scheduledDate: new Date(new Date(`${today}T09:00:00`).getTime() - 24 * 3_600_000).toISOString(),
  status:        'pending',
});
if (rem1) console.log('   Recordatorio María ->', rem1.id);

const rem2 = await post('reminders', {
  appointmentId: appt2?.id,
  patientId:     patient2?.id,
  branchId,
  message:       `Recordatorio: tiene una cita el ${tomorrow} a las 11:00`,
  scheduledDate: new Date(new Date(`${tomorrow}T11:00:00`).getTime() - 24 * 3_600_000).toISOString(),
  status:        'pending',
});
if (rem2) console.log('   Recordatorio Carlos ->', rem2.id);

console.log('\nDatos de acceso al sistema:');
console.log('  Admin  — admin@medil.com  / admin123');
console.log('  Doctor — doctor@medil.com / doctor123');
console.log('\nListo.\n');
