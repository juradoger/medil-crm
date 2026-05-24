#!/usr/bin/env node
// Script de siembra de datos — Data seeding script
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
  console.error('❌  Faltan VITE_INSFORGE_API_URL o VITE_INSFORGE_API_KEY en frontend/.env');
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
    console.warn(`  ⚠  ${collection} HTTP ${res.status}:`, JSON.stringify(body).slice(0, 150));
    return null;
  }
  return Array.isArray(body) ? body[0] : body;
}

// Fecha de hoy y mañana — today and tomorrow
const today    = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

// ─── Schemas reales en InsForge ───────────────────────────────────────────────
// patients:       id, name, email, phone, status, createdAt
// appointments:   id, patientId, patientName, professionalId, professional, date, time, reason, status, createdAt
// reminders:      id, appointmentId, patientId, message, sendAt, status
// medical_records:id, patientId, appointmentId, notes, diagnosis, createdAt
// users, branches, professionals: deben crearse en el panel de InsForge
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n🌱  Sembrando datos en InsForge — Seeding data in InsForge');
console.log(`   URL: ${BASE_URL}\n`);

// ── Pacientes ──
console.log('📦  patients (3)');
const p1 = await post('patients', { name: 'María López',    email: 'maria@example.com',  phone: '70011001', status: 'active' });
const p2 = await post('patients', { name: 'Carlos Mamani',  email: 'carlos@example.com', phone: '70022002', status: 'active' });
const p3 = await post('patients', { name: 'Ana Quispe',     email: 'ana@example.com',    phone: '70033003', status: 'active' });
if (p1) console.log('   ✅  María López →', p1.id);
if (p2) console.log('   ✅  Carlos Mamani →', p2.id);
if (p3) console.log('   ✅  Ana Quispe →', p3.id);

// ── Citas ──
console.log('📦  appointments (3)');
const a1 = await post('appointments', {
  patientId: p1?.id, patientName: 'María López',
  professional: 'Dra. Carmen Solís',
  date: today, time: '09:00', reason: 'Control general',
});
const a2 = await post('appointments', {
  patientId: p2?.id, patientName: 'Carlos Mamani',
  professional: 'Dr. Roberto Quiroga',
  date: today, time: '11:00', reason: 'Pediatría - seguimiento',
});
const a3 = await post('appointments', {
  patientId: p3?.id, patientName: 'Ana Quispe',
  professional: 'Dra. Carmen Solís',
  date: tomorrow, time: '10:00', reason: 'Revisión',
});
if (a1) console.log('   ✅  Cita María →', a1.id);
if (a2) console.log('   ✅  Cita Carlos →', a2.id);
if (a3) console.log('   ✅  Cita Ana (mañana) →', a3.id);

// ── Recordatorios ──
console.log('📦  reminders (2)');
const r1 = await post('reminders', {
  appointmentId: a1?.id, patientId: p1?.id,
  message: `Recuerde su cita el ${today} a las 09:00`,
  sendAt: new Date(Date.now() - 3_600_000).toISOString(), // hace 1h
});
const r2 = await post('reminders', {
  appointmentId: a3?.id, patientId: p3?.id,
  message: `Recuerde su cita el ${tomorrow} a las 10:00`,
  sendAt: new Date(new Date(`${tomorrow}T10:00:00`).getTime() - 24 * 3_600_000).toISOString(),
});
if (r1) console.log('   ✅  Recordatorio María →', r1.id);
if (r2) console.log('   ✅  Recordatorio Ana →', r2.id);

// ── Historial médico ──
console.log('📦  medical_records (1)');
const rec1 = await post('medical_records', {
  patientId: p3?.id, appointmentId: null,
  diagnosis: 'Hipertensión leve',
  notes: 'PA: 140/90 mmHg — Enalapril 5mg, control en 1 mes',
});
if (rec1) console.log('   ✅  Registro Ana →', rec1.id);

console.log('\n✨  Listo — Done!\n');
console.log('─────────────────────────────────────────────────────');
console.log('⚠️   Aún necesitas crear estas 3 tablas en InsForge:');
console.log('');
console.log('   1. TABLA: users');
console.log('      Columnas: email (text), passwordHash (text),');
console.log('                role (text), fullName (text), isActive (boolean)');
console.log('');
console.log('   2. TABLA: branches');
console.log('      Columnas: name (text), city (text), address (text), phone (text)');
console.log('');
console.log('   3. TABLA: professionals');
console.log('      Columnas: fullName (text), specialty (text)');
console.log('');
console.log('   Luego insertá un admin en users:');
console.log('      email: admin@medil.com');
console.log('      passwordHash: admin123');
console.log('      role: admin');
console.log('      fullName: Admin MedIL');
console.log('      isActive: true');
console.log('─────────────────────────────────────────────────────\n');
