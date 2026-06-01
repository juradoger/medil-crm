#!/usr/bin/env node
// Seed de datos bolivianos realistas para MedIL CRM
// Uso: node scripts/seed-insforge.js
//
// Schema real detectado (columnas existentes por tabla):
//   branches:      id, name, city, address, phone, status, created_at, updated_at
//   users:         id, email, passwordHash, role, fullName, isActive, created_at, updated_at, branchId, photoUrl
//   patients:      id, name, email, phone, status, createdAt, photoUrl, insuranceCode, isInsured, whatsappPhone
//   professionals: id, fullName, specialty, email, phone, created_at, updated_at, branchId, isActive, commissionRate, photoUrl, bio, isPublic
//   appointments:  id, patientId, patientName, professionalId, professional, date, time, reason, status, createdAt
//   reminders:     id, appointmentId, patientId, message, sendAt, status
//   medical_records: id, patientId, appointmentId, notes, diagnosis, createdAt
//   payments:      (nueva) id, appointmentId, branchId, amount, commission, totalAmount, paymentMethod, status
//   supplies:      (nueva) id, name, branchId, stockCurrent, stockMinimum, unit, status

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const lines = readFileSync(resolve(__dirname, '../frontend/.env'), 'utf8').split('\n');
    const env = {};
    for (const line of lines) {
      const [k, ...rest] = line.split('=');
      if (k?.trim()) env[k.trim()] = rest.join('=').trim();
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const BASE = process.env.INSFORGE_API_URL ?? env.VITE_INSFORGE_API_URL;
const KEY  = process.env.INSFORGE_API_KEY  ?? env.VITE_INSFORGE_API_KEY;

if (!BASE || !KEY) {
  console.error('Faltan VITE_INSFORGE_API_URL o VITE_INSFORGE_API_KEY en frontend/.env');
  process.exit(1);
}

// ── API ──────────────────────────────────────────────────────────────────────

const col = (columnName, type, extra = {}) =>
  ({ columnName, type, isNullable: true, isUnique: false, ...extra });

async function createTable(name, columns) {
  try {
    const res = await fetch(`${BASE}/api/database/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
      body: JSON.stringify({ tableName: name, columns }),
    });
    const j   = await res.json().catch(() => ({}));
    const msg = JSON.stringify(j);
    if (res.ok)
      console.log(`  tabla '${name}' creada`);
    else if (res.status === 409 || msg.includes('already exists') || msg.includes('duplicate'))
      console.log(`  tabla '${name}' ya existe`);
    else
      console.warn(`  tabla '${name}' error ${res.status}:`, msg.slice(0, 120));
  } catch (e) {
    console.warn(`  tabla '${name}' error:`, e.message);
  }
}

async function ins(collection, data) {
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
    const msg = JSON.stringify(body);
    if (msg.includes('duplicate') || msg.includes('unique')) return null;
    console.warn(`  ${collection} HTTP ${res.status}:`, msg.slice(0, 160));
    return null;
  }
  return Array.isArray(body) ? body[0] : body;
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

let _idSeq = 0;
function generateId() {
  _idSeq++;
  return `${Date.now()}-${_idSeq}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function bolivianPhone() {
  const digits = String(1000000 + Math.floor(Math.random() * 8999999));
  return `+591 7${digits}`;
}

const _usedCIs = new Set();
function bolivianCI() {
  let ci;
  do {
    ci = String(6100000 + Math.floor(Math.random() * 3899999));
  } while (_usedCIs.has(ci));
  _usedCIs.add(ci);
  return ci;
}

const TODAY = new Date().toISOString().slice(0, 10);

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function reminderSendAt(dateStr, time) {
  const dt = new Date(`${dateStr}T${time}:00`);
  dt.setHours(dt.getHours() - 24);
  return dt.toISOString();
}

function slug(name) {
  return name.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '.');
}

// ── DATA ─────────────────────────────────────────────────────────────────────

const M_FIRST = [
  'Marco Antonio', 'Luis Fernando', 'Carlos Alberto', 'Jorge Enrique', 'Roberto Carlos',
  'Diego Armando', 'Juan Pablo', 'Rodrigo Alejandro', 'Sebastián Andrés', 'Álvaro Marcelo',
  'Gustavo Adolfo', 'Hernán David', 'Mauricio Javier', 'Óscar René', 'Patricio Ignacio',
  'Raúl Eduardo', 'Sergio Nicolás', 'Víctor Hugo', 'Walter Gonzalo', 'Arturo Emilio',
];

const F_FIRST = [
  'Carmen Solís', 'Lucía Fernández', 'Valeria Quispe', 'María Elena', 'Ana Beatriz',
  'Sandra Patricia', 'Rosa Angélica', 'Patricia Viviana', 'Laura Cristina', 'Mónica Alejandra',
  'Claudia Marcela', 'Diana Carolina', 'Fernanda Isabel', 'Gloria Esperanza', 'Irene Magdalena',
  'Jimena Lorena', 'Katia Milenka', 'Lidia Concepción', 'Natalia Roxana', 'Paola Verónica',
];

const LAST = [
  'Mamani', 'Quispe', 'Condori', 'Huanca', 'Choque', 'López', 'García', 'Flores',
  'Vargas', 'Morales', 'Gutierrez', 'Rojas', 'Castro', 'Ortiz', 'Mendoza', 'Vásquez',
  'Cruz', 'Torres', 'Herrera', 'Jiménez', 'Poma', 'Collo', 'Cusi', 'Apaza',
  'Zenteno', 'Balderrama', 'Arispe', 'Cuentas', 'Torrez', 'Fernández',
];

const REASONS = [
  'Control de presión arterial', 'Consulta pediátrica de rutina', 'Dolor de cabeza persistente',
  'Revisión dermatológica', 'Control prenatal', 'Dolor lumbar crónico', 'Revisión oftalmológica',
  'Control de diabetes', 'Consulta por ansiedad', 'Limpieza dental', 'Fiebre y malestar general',
  'Chequeo médico anual', 'Dolor abdominal', 'Revisión de miopía', 'Control de tiroides',
  'Consulta por insomnio', 'Seguimiento post-operatorio', 'Control de hipertensión',
  'Vacunación infantil', 'Extracción dental',
];

const DIAGNOSES = [
  'Hipertensión arterial controlada', 'Gastritis crónica', 'Anemia leve', 'Diabetes tipo 2',
  'Bronquitis aguda', 'Dermatitis atópica', 'Migraña tensional', 'Lumbalgia mecánica',
  'Otitis media', 'Conjuntivitis viral', 'Faringitis bacteriana', 'Hipotiroidismo',
  'Ansiedad generalizada', 'Insomnio primario', 'Caries dental', 'Miopía leve',
  'Sobrepeso', 'Rinitis alérgica',
];

const TREATMENTS = [
  'Losartán 50mg, 1 comprimido diario por la mañana.',
  'Omeprazol 20mg antes de las comidas principales.',
  'Sulfato ferroso 300mg, 1 comprimido al día.',
  'Metformina 850mg con las comidas, control en 3 meses.',
  'Amoxicilina 500mg cada 8 horas por 7 días.',
  'Loratadina 10mg en caso de picazón.',
  'Ibuprofeno 400mg cada 8 horas con comida, máximo 5 días.',
  'Ejercicios de estiramiento lumbar 2 veces al día.',
  'Gotas óticas Ciprofloxacino 3 gotas cada 12 horas.',
  'Lágrimas artificiales 1 gota cada 4 horas.',
];

const SUPPLY_NAMES = [
  'Guantes de látex', 'Jeringas 5ml', 'Gasas estériles', 'Alcohol isopropílico', 'Vendas elásticas',
  'Mascarillas N95', 'Termómetros digitales', 'Tensiómetros', 'Oxímetros', 'Solución salina 0.9%',
  'Algodón médico', 'Esparadrapo', 'Bisturís desechables', 'Sutura 3-0', 'Glucómetros',
];

const UNITS = ['cajas', 'unidades', 'bolsas', 'frascos', 'paquetes'];

// ── STATIC DEFINITIONS ───────────────────────────────────────────────────────

const BRANCHES_DEF = [
  {
    name: 'Clínica Central MedIL', address: 'Av. Arce 2547',
    city: 'La Paz', phone: '+591 2 2441123', status: 'active',
    description: 'Clínica especializada en atención médica de calidad en el corazón de La Paz.',
    isPublic: true, coverPhoto: null, photo1: null, photo2: null, photo3: null,
  },
  {
    name: 'Sucursal Norte MedIL',  address: 'Calle 6 de Marzo 123',
    city: 'El Alto', phone: '+591 2 2812456', status: 'active',
    description: 'Clínica especializada en atención médica de calidad para la zona norte.',
    isPublic: true, coverPhoto: null, photo1: null, photo2: null, photo3: null,
  },
  {
    name: 'Sucursal Valle MedIL',  address: 'Av. Blanco Galindo 890',
    city: 'Cochabamba', phone: '+591 4 4521789', status: 'active',
    description: 'Clínica especializada en atención médica de calidad en el valle boliviano.',
    isPublic: true, coverPhoto: null, photo1: null, photo2: null, photo3: null,
  },
];

// 6 doctores: 2 por sucursal, especialidades variadas
const DOCTORS_DEF = [
  { fullName: 'Marco Antonio Mamani Quispe', specialty: 'Medicina General', email: 'mamani.marco@medil.com',    phone: '+591 71234567', branchIdx: 0 },
  { fullName: 'Carmen Solís Fernández',      specialty: 'Pediatría',        email: 'solis.carmen@medil.com',    phone: '+591 71345678', branchIdx: 0 },
  { fullName: 'Carlos Alberto Condori',      specialty: 'Cardiología',      email: 'condori.carlos@medil.com',  phone: '+591 72456789', branchIdx: 1 },
  { fullName: 'Lucía Fernández Huanca',      specialty: 'Dermatología',     email: 'fernandez.lucia@medil.com', phone: '+591 72567890', branchIdx: 1 },
  { fullName: 'Luis Fernando Huanca',        specialty: 'Ginecología',      email: 'huanca.luis@medil.com',     phone: '+591 73678901', branchIdx: 2 },
  { fullName: 'Valeria Quispe Morales',      specialty: 'Traumatología',    email: 'quispe.valeria@medil.com',  phone: '+591 73789012', branchIdx: 2 },
];

// Genera nombre de paciente — índice global 0-89
function makeName(idx) {
  const local = idx % 30;
  if (local < 15) {
    const first = M_FIRST[local % M_FIRST.length];
    const last  = LAST[(idx * 3) % LAST.length];
    return `${first} ${last}`;
  }
  const fi   = (local - 15) % F_FIRST.length;
  const last = LAST[(idx * 7 + 5) % LAST.length];
  return `${F_FIRST[fi]} ${last}`;
}

// 11 citas por doctor: 5 pasadas | 3 hoy | 3 futuras
const APPT_DATE_OFFSETS = [-5, -4, -3, -2, -1,  0,  0,  0,  1,  2,  3];
const APPT_STATUSES     = [
  'attended', 'cancelled', 'attended', 'cancelled', 'attended',
  'scheduled', 'attended', 'scheduled',
  'scheduled', 'scheduled', 'scheduled',
];
const APPT_TIMES        = [
  '08:00', '09:00', '10:00', '11:00', '14:00',
  '08:30', '10:30', '15:00',
  '09:00', '10:00', '11:00',
];

// Códigos de seguro para los primeros 10 pacientes:
// 5 terminan en MED (afiliados/gratis) | 5 sin cobertura
const SEED_INSURANCE = [
  'CNSALUD-MED', 'CAJANAC-MED', 'SEGUSALUD-MED', 'CNS-LAPAZ-MED', 'CAJABANCARIA-MED',
  'PARTICULAR-001', 'SEG-PRIV-123', 'PARTICULAR-002', 'PRIVADO-XYZ', 'SINSEGURO-009',
];

// Regla de afiliación: el código termina en MED o SAL
function computeIsInsured(code) {
  if (!code) return false;
  const upper = code.toUpperCase();
  return upper.endsWith('MED') || upper.endsWith('SAL');
}

// Stock: ok × 2, low × 2, critical × 1
const STOCK_PATTERNS = [
  { curr: 45, min: 20 },
  { curr: 30, min: 15 },
  { curr: 12, min: 15 },
  { curr: 5,  min: 20 },
  { curr: 0,  min: 10 },
];

const C = {
  branches: 0, users: 0, professionals: 0, patients: 0,
  appointments: 0, records: 0, reminders: 0, payments: 0, supplies: 0,
};

// ── MAIN ─────────────────────────────────────────────────────────────────────

console.log('\nSembrando datos bolivianos en InsForge...');
console.log(`URL: ${BASE}\n`);

// Crear tablas nuevas (payments y supplies no existen aún)
console.log('Verificando tablas nuevas...');
await createTable('payments', [
  col('appointmentId',  'string', { isNullable: false }),
  col('branchId',       'string'),
  col('amount',         'float'),
  col('commission',     'float'),
  col('totalAmount',    'float'),
  col('paymentMethod',  'string'),
  col('status',         'string'),
]);
await createTable('supplies', [
  col('name',         'string', { isNullable: false }),
  col('branchId',     'string'),
  col('stockCurrent', 'integer'),
  col('stockMinimum', 'integer'),
  col('unit',         'string'),
  col('status',       'string'),
]);

// ── 1. BRANCHES ───────────────────────────────────────────────────────────────
console.log('\n1. branches (3)...');
const branchIds   = [];
const branchNames = [];
try {
  for (const b of BRANCHES_DEF) {
    const r = await ins('branches', b);
    branchIds.push(r?.id ?? null);
    branchNames.push(b.name);
    if (r) { C.branches++; console.log(`   OK ${b.city}: ${r.id}`); }
  }
} catch (e) {
  console.error('  branches error:', e.message);
}

// ── 2. ADMINS ─────────────────────────────────────────────────────────────────
console.log('\n2. admins (2)...');
try {
  for (const a of [
    { email: 'admin.lapaz@medil.com',      passwordHash: 'admin123', role: 'admin', fullName: 'Rodrigo Alejandro García',  branchId: branchIds[0], isActive: true, photoUrl: null },
    { email: 'admin.cochabamba@medil.com', passwordHash: 'admin123', role: 'admin', fullName: 'Patricia Viviana Morales', branchId: branchIds[2], isActive: true, photoUrl: null },
  ]) {
    const r = await ins('users', a);
    if (r) { C.users++; console.log(`   OK ${a.email}: ${r.id}`); }
  }
} catch (e) {
  console.error('  admins error:', e.message);
}

// ── 3. DOCTORS → users + professionals ────────────────────────────────────────
console.log('\n3. doctores y profesionales (6)...');
const profIds    = [];
const profNames  = [];
const profBranch = [];

try {
  for (let i = 0; i < DOCTORS_DEF.length; i++) {
    const d  = DOCTORS_DEF[i];
    const bId = branchIds[d.branchIdx];

    const u = await ins('users', {
      email: d.email, passwordHash: 'doctor123', role: 'doctor',
      fullName: d.fullName, branchId: bId, isActive: true, photoUrl: null,
    });
    if (u) C.users++;

    // Comisión: 15% para los 5 primeros doctores, 10% para el resto
    const commissionRate = i < 5 ? 0.15 : 0.10;
    const p = await ins('professionals', {
      fullName: d.fullName, specialty: d.specialty,
      email: d.email, phone: d.phone,
      photoUrl: null, bio: null, isPublic: true,
      branchId: bId, isActive: true, commissionRate,
    });
    profIds.push(p?.id ?? null);
    profNames.push(d.fullName);
    profBranch.push(bId);

    if (p) {
      C.professionals++;
      console.log(`   OK [${d.specialty}] ${d.fullName}: ${p.id}`);
    }
  }
} catch (e) {
  console.error('  doctores/profesionales error:', e.message);
}

// ── 4. PATIENTS (90: 30 por sucursal) ─────────────────────────────────────────
console.log('\n4. pacientes (90)...');
const patData = []; // { id, name }

try {
  for (let i = 0; i < 90; i++) {
    const name   = makeName(i);
    const email  = `${slug(name)}.${i}@gmail.com`;
    const status = (i % 12 === 0) ? 'inactive' : 'active';
    const phone  = bolivianPhone();
    const insuranceCode = i < SEED_INSURANCE.length ? SEED_INSURANCE[i] : null;
    const isInsured     = computeIsInsured(insuranceCode);

    const r = await ins('patients', {
      name, email, phone, status, photoUrl: null,
      insuranceCode, isInsured, whatsappPhone: phone,
    });
    patData.push({ id: r?.id ?? null, name });
    if (r) C.patients++;
  }
  console.log(`   ${C.patients} pacientes insertados`);
} catch (e) {
  console.error('  patients error:', e.message);
}

// ── 5. APPOINTMENTS + MEDICAL_RECORDS + REMINDERS + PAYMENTS ──────────────────
console.log('\n5. citas, historial, recordatorios y pagos...');

try {
  for (let di = 0; di < 6; di++) {
    const profId  = profIds[di];
    const profName = profNames[di];
    const bId     = profBranch[di];
    if (!profId) { console.warn(`   Doctor ${di + 1}: sin ID de profesional, omitido`); continue; }

    const branchIdx  = DOCTORS_DEF[di].branchIdx;
    const halfOffset = (di % 2) * 15;
    const start      = branchIdx * 30 + halfOffset;
    const docPats    = patData.slice(start, start + 15);

    for (let ai = 0; ai < APPT_DATE_OFFSETS.length; ai++) {
      const pat = docPats[ai % docPats.length];
      if (!pat.id) continue;

      const apptDate = dateOffset(APPT_DATE_OFFSETS[ai]);
      const apptTime = APPT_TIMES[ai];
      const status   = APPT_STATUSES[ai];

      const appt = await ins('appointments', {
        patientId:      pat.id,
        patientName:    pat.name,
        professionalId: profId,
        professional:   profName,
        date:           apptDate,
        time:           apptTime,
        reason:         randomFrom(REASONS),
        status,
      });
      if (!appt) continue;
      C.appointments++;

      // Historial clínico + pago para citas atendidas
      if (status === 'attended') {
        const diagnosis = randomFrom(DIAGNOSES);
        const treatment = randomFrom(TREATMENTS);
        const reason    = randomFrom(REASONS);
        const rec = await ins('medical_records', {
          patientId:     pat.id,
          appointmentId: appt.id,
          diagnosis,
          notes: `Motivo: ${reason}. Tratamiento: ${treatment} Control en 30 días.`,
        });
        if (rec) C.records++;

        const amount     = 80 + Math.floor(Math.random() * 271);
        const commission = parseFloat((amount * 0.02).toFixed(2));
        const pay = await ins('payments', {
          appointmentId: appt.id,
          branchId:      bId,
          amount,
          commission,
          totalAmount:   parseFloat((amount + commission).toFixed(2)),
          paymentMethod: Math.random() > 0.4 ? 'qr' : 'cash',
          status:        'approved',
        });
        if (pay) C.payments++;
      }

      // Recordatorio para citas futuras programadas
      if (APPT_DATE_OFFSETS[ai] > 0 && status === 'scheduled') {
        const rem = await ins('reminders', {
          appointmentId: appt.id,
          patientId:     pat.id,
          message:       `Recordatorio: tiene una cita el ${apptDate} a las ${apptTime} con su médico.`,
          sendAt:        reminderSendAt(apptDate, apptTime),
          status:        Math.random() > 0.3 ? 'pending' : 'sent',
        });
        if (rem) C.reminders++;
      }
    }

    const doc = DOCTORS_DEF[di];
    console.log(`   Doctor ${di + 1}/6 — ${doc.fullName} (${doc.specialty}): OK`);
  }
} catch (e) {
  console.error('  appointments/records/reminders/payments error:', e.message);
}

// ── 6. SUPPLIES (5 por sucursal = 15) ─────────────────────────────────────────
console.log('\n6. insumos (15)...');
try {
  for (let b = 0; b < 3; b++) {
    const bId = branchIds[b];
    for (let s = 0; s < 5; s++) {
      const { curr, min } = STOCK_PATTERNS[s];
      const status = curr === 0 ? 'critical' : curr <= min ? 'low' : 'ok';
      const sup = await ins('supplies', {
        name:         SUPPLY_NAMES[b * 5 + s],
        branchId:     bId,
        stockCurrent: curr,
        stockMinimum: min,
        unit:         randomFrom(UNITS),
        status,
      });
      if (sup) C.supplies++;
    }
    console.log(`   Sucursal ${b + 1} (${BRANCHES_DEF[b].city}): 5 insumos`);
  }
} catch (e) {
  console.error('  supplies error:', e.message);
}

// ── RESUMEN FINAL ─────────────────────────────────────────────────────────────
console.log('\n========================================');
console.log(`Seed completado: ${C.branches} branches, ${C.users} users, ${C.professionals} professionals, ${C.patients} patients, ${C.appointments} appointments, ${C.records} records, ${C.reminders} reminders, ${C.payments} payments, ${C.supplies} supplies`);
console.log('========================================');
console.log('\nCredenciales de prueba:');
console.log('  Admin  : admin.lapaz@medil.com      / admin123');
console.log('  Admin  : admin.cochabamba@medil.com / admin123');
console.log('  Doctor : mamani.marco@medil.com     / doctor123');
console.log('  Doctor : solis.carmen@medil.com     / doctor123\n');
