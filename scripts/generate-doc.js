// Generador de documento Word para MediL CRM — Word document generator for MediL CRM
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  ImageRun, AlignmentType, BorderStyle, WidthType, ShadingType, PageBreak,
  Header, Footer, PageNumber, NumberFormat, convertInchesToTwip, LevelFormat,
  TableLayoutType, VerticalAlign,
} = require('docx');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'docs', 'assets');
const OUT = path.join('C:\\Users\\USUARIO\\Downloads', 'MediL-CRM-Resumen.docx');

// ── Colores de marca ──────────────────────────────────────────────────────────
const C_BLUE   = '0E4A8A';
const C_AQUA   = '00A896';
const C_YELLOW = 'FFD100';
const C_WHITE  = 'FFFFFF';
const C_LGRAY  = 'F3F7FB';
const C_MGRAY  = 'E0E7EF';

// ── Helpers ───────────────────────────────────────────────────────────────────
function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    run: { color: C_BLUE, bold: true, size: 32 },
  });
}

function heading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    run: { color: C_BLUE, bold: true, size: 26 },
  });
}

function heading3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    run: { color: C_AQUA, bold: true, size: 22 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: '1A1A2E', ...opts })],
    spacing: { before: 80, after: 80 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 22, color: '1A1A2E' })],
    spacing: { before: 60, after: 60 },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      children: [new TextRun({ text: line, font: 'Courier New', size: 18, color: '1E3A5F' })],
      spacing: { before: 0, after: 0 },
      indent: { left: convertInchesToTwip(0.3) },
      shading: { type: ShadingType.SOLID, color: 'EEF4FB', fill: 'EEF4FB' },
    })
  );
}

function spacer(lines = 1) {
  return Array.from({ length: lines }, () =>
    new Paragraph({ children: [new TextRun('')], spacing: { before: 60, after: 60 } })
  );
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function blueRule() {
  return new Paragraph({
    children: [new TextRun('')],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C_AQUA } },
    spacing: { before: 80, after: 160 },
  });
}

function labelValue(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, size: 22, bold: true, color: C_BLUE }),
      new TextRun({ text: value, size: 22, color: '1A1A2E' }),
    ],
    spacing: { before: 60, after: 60 },
  });
}

function stackTable(rows) {
  const headerRow = new TableRow({
    children: ['Capa / Layer', 'Tecnología', 'Versión / Details'].map(h =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: C_WHITE, size: 22 })] })],
        shading: { type: ShadingType.SOLID, color: C_BLUE, fill: C_BLUE },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      })
    ),
  });
  const dataRows = rows.map((r, i) =>
    new TableRow({
      children: r.map(cell =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, color: '1A1A2E' })] })],
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? C_LGRAY : C_WHITE, fill: i % 2 === 0 ? C_LGRAY : C_WHITE },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
        })
      ),
    })
  );
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: C_MGRAY },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: C_MGRAY },
      left:   { style: BorderStyle.SINGLE, size: 4, color: C_MGRAY },
      right:  { style: BorderStyle.SINGLE, size: 4, color: C_MGRAY },
      insideH:{ style: BorderStyle.SINGLE, size: 2, color: C_MGRAY },
      insideV:{ style: BorderStyle.SINGLE, size: 2, color: C_MGRAY },
    },
  });
}

function refTable(rows) {
  const cols = ['Principio', 'ANTES', 'DESPUÉS'];
  const headerRow = new TableRow({
    children: cols.map(h =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: C_WHITE, size: 20 })] })],
        shading: { type: ShadingType.SOLID, color: C_AQUA, fill: C_AQUA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
      })
    ),
  });
  const dataRows = rows.map((r, i) =>
    new TableRow({
      children: r.map(cell =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 19, color: '1A1A2E' })] })],
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? 'F0FBF9' : C_WHITE, fill: i % 2 === 0 ? 'F0FBF9' : C_WHITE },
          margins: { top: 50, bottom: 50, left: 100, right: 100 },
        })
      ),
    })
  );
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });
}

function tryImage(filePath, width, height) {
  try {
    const data = fs.readFileSync(filePath);
    return new ImageRun({ data, transformation: { width, height }, type: 'png' });
  } catch {
    return new TextRun({ text: `[imagen no encontrada: ${path.basename(filePath)}]`, italics: true, color: 'CC0000' });
  }
}

// ── Contenido del documento ───────────────────────────────────────────────────
function buildDoc() {
  const logoImg = tryImage(path.join(ASSETS, 'logo.png'), 120, 60);

  // ── PORTADA ─────────────────────────────────────────────────────────────────
  const cover = [
    new Paragraph({ children: [logoImg], alignment: AlignmentType.CENTER, spacing: { before: 720, after: 480 } }),
    new Paragraph({
      children: [new TextRun({ text: 'MediL CRM', bold: true, size: 72, color: C_BLUE })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Sistema de Gestión de Clínica Médica', size: 32, color: C_AQUA, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Medical Clinic Management System', size: 28, color: '888888', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Ingeniería de Software II — Software Engineering II', size: 24, color: '444444' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Resumen de Proyecto · Project Summary', size: 24, color: '444444' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Mayo 2026', size: 24, color: '888888' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    pageBreak(),
  ];

  // ── 1. DESCRIPCIÓN DEL PROYECTO ─────────────────────────────────────────────
  const desc = [
    heading1('1. Descripción del Proyecto'),
    blueRule(),
    body('MediL CRM es una Línea de Producto de Software (SPL) para el sector salud, diseñada para centralizar la gestión de pacientes, citas médicas, historial clínico y recordatorios automáticos en clínicas especializadas.'),
    ...spacer(),
    body('La arquitectura modular por dominio permite que cada módulo (pacientes, citas, registros, recordatorios) sea reutilizable como unidad independiente en distintas variantes del CRM: odontología, psicología, fisioterapia, entre otras.'),
    ...spacer(),
    heading2('1.1 Objetivos del Sistema'),
    bullet('Registrar y gestionar pacientes con datos completos del expediente clínico'),
    bullet('Agendar citas médicas con validación de conflictos de horario'),
    bullet('Mantener historial clínico estructurado por paciente'),
    bullet('Generar recordatorios automáticos 24 horas antes de cada cita'),
    bullet('Proveer un dashboard con métricas operativas en tiempo real'),
    ...spacer(),
    heading2('1.2 Stack Tecnológico'),
    ...spacer(),
    stackTable([
      ['Frontend',        'React 18 + Vite 5',            'SPA, Hot Module Replacement'],
      ['Estilos',         'TailwindCSS v4',               'Tokens de marca vía @theme'],
      ['Enrutamiento',    'React Router v6',              'Client-side routing'],
      ['Backend / BaaS',  'InsForge',                     'PostgreSQL 15 + PostgREST'],
      ['SDK Backend',     '@insforge/sdk',                'Fluent API tipo Supabase'],
      ['Base de datos',   'PostgreSQL 15',                '4 tablas con camelCase'],
      ['Despliegue',      'Vercel (previsto)',             'CI/CD automático'],
      ['Control de versiones', 'Git + GitHub',            'github.com/juradoger/medil-crm'],
    ]),
    pageBreak(),
  ];

  // ── 2. MVP ──────────────────────────────────────────────────────────────────
  const mvp = [
    heading1('2. MVP — Producto Mínimo Viable'),
    blueRule(),
    body('El MVP de MediL CRM incluye las funcionalidades core para operar una clínica médica básica, agrupadas en 4 módulos principales:'),
    ...spacer(),
    heading2('2.1 Módulo de Pacientes'),
    bullet('Alta de paciente: nombre, fecha de nacimiento, teléfono, correo, dirección, seguro médico'),
    bullet('Edición y actualización de datos del paciente'),
    bullet('Búsqueda por nombre (ilike) con resultados en tiempo real'),
    bullet('Vista de detalle de paciente con historial clínico y citas'),
    bullet('Cambio de estado activo / inactivo'),
    ...spacer(),
    heading2('2.2 Módulo de Citas'),
    bullet('Creación de cita con validación: fecha futura, paciente activo, sin conflicto de horario'),
    bullet('Listado de citas por fecha con filtros'),
    bullet('Cancelación de cita (soft delete con cambio de estado)'),
    bullet('Marcado de cita como "atendida"'),
    bullet('Creación automática de recordatorio al crear cita'),
    ...spacer(),
    heading2('2.3 Módulo de Historial Clínico'),
    bullet('Registro de entradas clínicas asociadas a un paciente'),
    bullet('Campos: diagnóstico, tratamiento, notas, fecha'),
    bullet('Ordenado por fecha descendente (más reciente primero)'),
    ...spacer(),
    heading2('2.4 Módulo de Recordatorios'),
    bullet('Generación automática de recordatorio 24 horas antes de cada cita'),
    bullet('Listado de recordatorios pendientes'),
    bullet('Marcado de recordatorio como enviado'),
    bullet('Constante configurable HOURS_BEFORE_REMINDER en core/constants.js'),
    ...spacer(),
    heading2('2.5 Dashboard'),
    bullet('Total de pacientes activos'),
    bullet('Citas de hoy'),
    bullet('Recordatorios pendientes'),
    bullet('Acceso rápido a módulos principales'),
    pageBreak(),
  ];

  // ── 3. ARQUITECTURA ─────────────────────────────────────────────────────────
  const arch = [
    heading1('3. Arquitectura del Sistema'),
    blueRule(),
    body('MediL CRM adopta el patrón de Arquitectura Modular por Dominio (Domain-Driven Modular Architecture). El código se organiza alrededor de los conceptos del negocio, no de capas técnicas horizontales.'),
    ...spacer(),
    heading2('3.1 Principios de Arquitectura'),
    bullet('Alta cohesión interna: toda la lógica de un dominio vive junta (service + repository)'),
    bullet('Bajo acoplamiento externo: los dominios se comunican solo a través de interfaces definidas (servicios)'),
    bullet('Reutilización SPL: cada módulo puede trasplantarse a otra variante del CRM sin dependencias no deseadas'),
    bullet('Servicios intercambiables: cambiar el backend solo requiere modificar *Service.js, no hooks ni páginas'),
    ...spacer(),
    heading2('3.2 Diagrama de Arquitectura'),
    new Paragraph({
      children: [tryImage(path.join(ASSETS, 'diagrama-es.png'), 580, 320)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 160 },
    }),
    heading2('3.3 Flujo Principal del MVP (Diagrama de Secuencia)'),
    new Paragraph({
      children: [tryImage(path.join(ASSETS, 'secuencia-es.png'), 580, 380)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 160 },
    }),
    heading2('3.4 Tablas de Base de Datos (InsForge / PostgreSQL 15)'),
    stackTable([
      ['patients',        'id, "patientId", name, birthDate, phone, email, address, insurance, status, "createdAt"', 'Registro maestro de pacientes'],
      ['appointments',    'id, "patientId", "professionalId", date, time, reason, status, "createdAt"', 'Citas con control de conflictos'],
      ['medical_records', 'id, "patientId", diagnosis, treatment, notes, "createdAt"', 'Historial clínico por paciente'],
      ['reminders',       'id, "appointmentId", "reminderDate", status, "createdAt"', 'Recordatorios automáticos 24h antes'],
    ]),
    pageBreak(),
  ];

  // ── 4. COMPONENTES REUTILIZABLES ────────────────────────────────────────────
  const comps = [
    heading1('4. Componentes Reutilizables'),
    blueRule(),
    body('El sistema implementa 7 componentes reutilizables diseñados con alta cohesión y bajo acoplamiento para la Línea de Producto de Software:'),
    ...spacer(),
    stackTable([
      ['1. PatientService',      'backend/patients/patientService.js',        'CRUD de pacientes, validación'],
      ['2. AppointmentService',  'backend/appointments/appointmentService.js', 'Citas con validación de conflictos'],
      ['3. MedicalRecordService','backend/records/recordService.js',           'Historial clínico por paciente'],
      ['4. ReminderService',     'backend/reminders/reminderService.js',       'Recordatorios automáticos'],
      ['5. usePatients',         'frontend/src/hooks/usePatients.js',          'Hook: estado + operaciones de paciente'],
      ['6. useAppointments',     'frontend/src/hooks/useAppointments.js',      'Hook: estado + operaciones de cita (R1)'],
      ['7. StatusBadge',         'frontend/src/components/StatusBadge.jsx',    'Badge genérico de estado (OCP)'],
    ]),
    pageBreak(),
  ];

  // ── 5. REFACTORIZACIONES ────────────────────────────────────────────────────
  const r1Before = [
    '// ANTES — sin manejo consistente de loading/error',
    'async function createAppointment(appointmentData) {',
    '  const newAppt = await createSvc(appointmentData);  // sin loading',
    '  setAppointments((prev) => [...prev, newAppt]);     // sin error handling',
    '  return newAppt;',
    '}',
    '',
    '// filterByDate SÍ manejaba loading/error — inconsistencia',
    'async function filterByDate(date) {',
    '  setLoading(true); setError(null);',
    '  try {',
    '    const data = await getByDate(date);',
    '    setAppointments(data);',
    '  } catch (err) { setError(err.message); }',
    '  finally { setLoading(false); }',
    '}',
  ];

  const r1After = [
    '// DESPUÉS — withLoading() centraliza el manejo de estado para todas las operaciones',
    'async function withLoading(fn) {',
    '  setLoading(true); setError(null);',
    '  try { return await fn(); }',
    '  catch (err) { setError(err.message); throw err; }',
    '  finally { setLoading(false); }',
    '}',
    '',
    'async function createAppointment(data) {',
    '  return withLoading(async () => {',
    '    const newAppt = await createSvc(data);',
    '    setAppointments((prev) => [...prev, newAppt]);',
    '    return newAppt;',
    '  });',
    '}',
    '',
    'async function filterByDate(date) {',
    '  return withLoading(async () => {',
    '    const data = await getByDate(date);',
    '    setAppointments(data);',
    '    return data;',
    '  });',
    '}',
  ];

  const r2Before = [
    '// ANTES — número mágico sin contexto',
    'function calculateReminderDate(appointmentDate) {',
    '  const reminderDate = new Date(appointmentDate);',
    '  reminderDate.setHours(reminderDate.getHours() - 24); // ¿Por qué 24?',
    '  return reminderDate;',
    '}',
  ];

  const r2After = [
    '// En core/constants.js — constante semántica y configurable',
    'export const HOURS_BEFORE_REMINDER = 24;',
    '',
    '// En reminderService.js',
    'const { HOURS_BEFORE_REMINDER } = require("../../frontend/src/core/constants");',
    '',
    'function calculateReminderDate(appointmentDate) {',
    '  const reminderDate = new Date(appointmentDate);',
    '  reminderDate.setHours(reminderDate.getHours() - HOURS_BEFORE_REMINDER);',
    '  return reminderDate;',
    '}',
  ];

  const r3Before = [
    '// ANTES — validaciones mezcladas en createAppointment',
    'async function createAppointment(data) {',
    '  const apptDateTime = new Date(`${data.date}T${data.time}`);',
    '  if (apptDateTime <= new Date()) {',
    '    throw new Error("Fecha inválida — Invalid date");',
    '  }',
    '  const conflict = await checkTimeConflict(data.professionalId, data.date, data.time);',
    '  if (conflict) throw new Error("Horario ocupado — Time slot taken");',
    '  const patRes = await fetch(`${API_URL}/patients/${data.patientId}`, { headers: getHeaders() });',
    '  const patient = await patRes.json();',
    '  if (!patRes.ok || patient.status !== "active")',
    '    throw new Error("Paciente inactivo — Inactive patient");',
    '  // ... lógica de creación mezclada ...',
    '}',
  ];

  const r3After = [
    '// DESPUÉS — funciones expresivas con nombre que comunica su propósito',
    'function isFutureDate(date, time) {',
    '  return new Date(`${date}T${time}`) > new Date();',
    '}',
    '',
    'async function isTimeSlotFree(professionalId, date, time) {',
    '  return !(await checkTimeConflict(professionalId, date, time));',
    '}',
    '',
    'async function isPatientActive(patientId) {',
    '  const res = await fetch(`${API_URL}/patients/${patientId}`, { headers: getHeaders() });',
    '  if (!res.ok) return false;',
    '  return (await res.json()).status === "active";',
    '}',
    '',
    'async function createAppointment(data) {',
    '  if (!isFutureDate(date, time))',
    '    throw new Error("La fecha de la cita debe ser futura");',
    '  if (!await isPatientActive(patientId))',
    '    throw new Error("El paciente no existe o está inactivo");',
    '  if (!await isTimeSlotFree(professionalId, date, time))',
    '    throw new Error("El profesional ya tiene una cita en ese horario");',
    '  // ... lógica de creación limpia y separada ...',
    '}',
  ];

  const refact = [
    heading1('5. Refactorizaciones Aplicadas'),
    blueRule(),
    body('Se aplicaron 3 refactorizaciones estructurales (R1–R3) con evidencia de código ANTES/DESPUÉS y justificación técnica por principio de diseño.'),
    ...spacer(),

    // R1
    heading2('R1 — Extract Custom Hook (withLoading)'),
    body('Archivo: frontend/src/hooks/useAppointments.js', { bold: true }),
    ...spacer(),
    body('Problema detectado: El hook useAppointments.js manejaba de forma inconsistente los estados loading y error. filterByDate los gestionaba correctamente, pero createAppointment, cancelAppointment y markAsAttended no tenían ningún manejo de estado, violando la consistencia interna del hook.'),
    ...spacer(),
    heading3('Código ANTES:'),
    ...codeBlock(r1Before),
    ...spacer(),
    heading3('Código DESPUÉS:'),
    ...codeBlock(r1After),
    ...spacer(),
    refTable([
      ['DRY',            'Lógica de loading/error repetida o ausente en cada función', 'withLoading() es la única fuente de verdad para el manejo de estado'],
      ['Alta cohesión',  'El hook era inconsistente: algunas funciones manejaban estado, otras no', 'El hook encapsula completamente y de forma uniforme el estado de carga'],
      ['Consistencia',   'Comportamiento distinto según qué función se llamara', 'Todas las operaciones del hook tienen el mismo comportamiento garantizado'],
      ['Reutilización',  'La lógica de carga era no reutilizable y estaba duplicada', 'withLoading() aplica a cualquier operación asíncrona futura'],
    ]),
    ...spacer(2),

    // R2
    heading2('R2 — Replace Magic Number with Named Constant'),
    body('Archivo: frontend/src/core/constants.js / backend/reminders/reminderService.js', { bold: true }),
    ...spacer(),
    body('Problema detectado: El valor 24 aparecía como número literal en reminderService.js sin expresar su significado semántico ni su relación con la regla de negocio: las horas de anticipación para enviar un recordatorio.'),
    ...spacer(),
    heading3('Código ANTES:'),
    ...codeBlock(r2Before),
    ...spacer(),
    heading3('Código DESPUÉS:'),
    ...codeBlock(r2After),
    ...spacer(),
    refTable([
      ['Legibilidad',     '24 no comunica su propósito en el dominio', 'HOURS_BEFORE_REMINDER es autodocumentado'],
      ['Mantenibilidad',  'Cambiar la regla requiere buscar 24 en todo el código', 'Un cambio en constants.js se propaga a todo el sistema'],
      ['SPL',             'No adaptable sin modificar lógica de negocio', 'Cada variante del CRM configura su propia constante'],
      ['DRY',             'El valor se duplicaría si aparece en más de una función', 'Única fuente de verdad para la regla de anticipación'],
    ]),
    ...spacer(2),

    // R3
    heading2('R3 — Decompose Conditional'),
    body('Archivo: backend/appointments/appointmentService.js', { bold: true }),
    ...spacer(),
    body('Problema detectado: La función createAppointment() concentraba múltiples validaciones directamente en su cuerpo, mezclando la lógica de validación con la lógica de creación y persistencia. Las condiciones no expresaban su propósito con claridad y eran difíciles de probar de forma aislada.'),
    ...spacer(),
    heading3('Código ANTES:'),
    ...codeBlock(r3Before),
    ...spacer(),
    heading3('Código DESPUÉS:'),
    ...codeBlock(r3After),
    ...spacer(),
    refTable([
      ['Legibilidad',    'Las condiciones no comunicaban su propósito', 'isFutureDate, isPatientActive se leen como lenguaje natural'],
      ['Reutilización',  'Las validaciones estaban acopladas sin posibilidad de reutilizarse', 'isFutureDate e isPatientActive son exportables a otros módulos'],
      ['Testabilidad',   'Probar una validación requería ejecutar toda la función', 'Cada función de validación se prueba de forma completamente aislada'],
      ['Bajo acoplamiento', 'Validación y persistencia mezcladas en un solo bloque', 'Validación separada de la lógica de creación y del generador de recordatorios'],
    ]),
    pageBreak(),
  ];

  // ── 6. CÓDIGO CLAVE ─────────────────────────────────────────────────────────
  const codeKey = [
    heading1('6. Código Clave del Sistema'),
    blueRule(),
    heading2('6.1 Cliente InsForge (frontend/src/lib/insforge.js)'),
    ...codeBlock([
      'import { createClient } from "@insforge/sdk";',
      '',
      'const client = createClient({',
      '  baseUrl: import.meta.env.VITE_INSFORGE_API_URL,',
      '  anonKey:  import.meta.env.VITE_INSFORGE_API_KEY,',
      '});',
      '',
      'export const db = client.database;',
    ]),
    ...spacer(),
    heading2('6.2 Servicio de Pacientes (frontend/src/services/patientService.js)'),
    ...codeBlock([
      'import { db } from "../lib/insforge";',
      '',
      'export async function getPatients() {',
      '  const { data, error } = await db.from("patients").select();',
      '  if (error) throw new Error(error.message);',
      '  return data;',
      '}',
      '',
      'export async function createPatient(patientData) {',
      '  const { data, error } = await db.from("patients")',
      '    .insert(patientData).select().single();',
      '  if (error) throw new Error(error.message);',
      '  return data;',
      '}',
      '',
      'export async function searchPatients(query) {',
      '  const { data, error } = await db.from("patients")',
      '    .select().ilike("name", `%${query}%`);',
      '  if (error) throw new Error(error.message);',
      '  return data;',
      '}',
    ]),
    ...spacer(),
    heading2('6.3 Navegación — App.jsx (fragmento)'),
    ...codeBlock([
      'export default function App() {',
      '  const [open, setOpen] = useState(false);',
      '  return (',
      '    <BrowserRouter>',
      '      <header className="flex items-center justify-between px-5 py-3 ...">',
      '        <NavLink to="/" onClick={() => setOpen(false)}>',
      '          <img src="/logo.png" alt="MediL CRM" className="h-16 w-auto" />',
      '        </NavLink>',
      '        <button onClick={() => setOpen(o => !o)}>☰</button>',
      '      </header>',
      '      {open && (',
      '        <div className="fixed inset-0 z-50 flex">',
      '          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />',
      '          <nav className="relative w-64 bg-white shadow-2xl ...">',
      '            {NAV_LINKS.map(l => <NavItem key={l.to} {...l} onClick={() => setOpen(false)} />)}',
      '          </nav>',
      '        </div>',
      '      )}',
      '      <main><Routes>...</Routes></main>',
      '    </BrowserRouter>',
      '  );',
      '}',
    ]),
    pageBreak(),
  ];

  // ── 7. ANEXOS ───────────────────────────────────────────────────────────────
  const annexes = [
    heading1('Anexos / Appendices'),
    blueRule(),
    heading2('A. Repositorio GitHub'),
    ...spacer(),
    new Paragraph({
      children: [
        new TextRun({ text: 'Repositorio público: ', size: 22, bold: true, color: C_BLUE }),
        new TextRun({ text: 'https://github.com/juradoger/medil-crm', size: 22, color: C_AQUA }),
      ],
      spacing: { before: 80, after: 80 },
    }),
    labelValue('Branch principal', 'main'),
    labelValue('Etapas completadas', 'Etapa 0 (estructura), Etapa 1 (componentes), Etapa 2 (refactorizaciones)'),
    labelValue('Commits principales', 'etapa-0 → InsForge integration → R1/R2/R3 → navbar redesign'),
    ...spacer(2),
    heading2('B. Diagrama de Arquitectura Completo'),
    new Paragraph({
      children: [tryImage(path.join(ASSETS, 'diagrama-es.png'), 600, 340)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 240 },
    }),
    heading2('C. Diagrama de Secuencia MVP'),
    new Paragraph({
      children: [tryImage(path.join(ASSETS, 'secuencia-es.png'), 600, 400)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 240 },
    }),
    heading2('D. Variables de Entorno Requeridas'),
    ...codeBlock([
      '# frontend/.env  (no incluido en git)',
      'VITE_INSFORGE_API_URL=https://<appkey>.us-east.insforge.app',
      'VITE_INSFORGE_API_KEY=ik_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    ]),
    ...spacer(),
    heading2('E. Comandos para Ejecutar el Proyecto'),
    ...codeBlock([
      '# Clonar repositorio',
      'git clone https://github.com/juradoger/medil-crm.git',
      'cd medil-crm',
      '',
      '# Configurar variables de entorno',
      'cp frontend/.env.example frontend/.env',
      '# Editar frontend/.env con tus credenciales InsForge',
      '',
      '# Instalar dependencias e iniciar dev server',
      'cd frontend',
      'npm install',
      'npm run dev',
      '# → http://localhost:5173',
    ]),
  ];

  // ── Documento final ──────────────────────────────────────────────────────────
  const doc = new Document({
    creator: 'MediL CRM — Ingeniería de Software II',
    title: 'MediL CRM — Resumen del Proyecto',
    description: 'Resumen técnico completo: arquitectura, MVP, refactorizaciones, código y anexos',
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          run: { bold: true, size: 32, color: C_BLUE, font: 'Calibri' },
          paragraph: { spacing: { before: 360, after: 160 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          run: { bold: true, size: 26, color: C_BLUE, font: 'Calibri' },
          paragraph: { spacing: { before: 280, after: 120 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          run: { bold: true, size: 22, color: C_AQUA, font: 'Calibri' },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left:   convertInchesToTwip(1.2),
            right:  convertInchesToTwip(1.2),
          },
        },
      },
      children: [
        ...cover,
        ...desc,
        ...mvp,
        ...arch,
        ...comps,
        ...refact,
        ...codeKey,
        ...annexes,
      ],
    }],
  });

  return doc;
}

// ── Ejecutar ──────────────────────────────────────────────────────────────────
(async () => {
  try {
    const doc = buildDoc();
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(OUT, buffer);
    console.log(`✅ Documento generado: ${OUT}`);
    console.log(`   Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
