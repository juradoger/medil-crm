# DATABASE.md — MedIL CRM/ERP
> Referencia de base de datos del proyecto.
> Leer antes de crear o modificar servicios que acceden a InsForge.
>
> **Schema sincronizado con InsForge real post-seed.**
> **Ver docs/evidence/ para el schema original planificado.**

---

## 1. Motor de base de datos
Motor:    InsForge (PostgreSQL 15 bajo el capó)
SDK:      @insforge/sdk ^1.2.10
Cliente:  frontend/src/lib/insforge.js
backend/infrastructure/insforge.js

---

## 2. Patrón de acceso — InsForge SDK

⚠️ Sintaxis verificada contra el código real en
 frontend/src/services/ y backend/adapters/
 Actualizada post-auditoría.

El SDK `@insforge/sdk` expone un **PostgrestQueryBuilder estilo Supabase/PostgREST**.
Toda llamada resuelve a un objeto `{ data, error }`: SIEMPRE desestructurar y lanzar
`new Error(error.message)` cuando `error` no es null. Nunca usar fetch directo a InsForge.

```js
import { db } from '../lib/insforge';

// Obtener todos (con filtro de sucursal)
const { data, error } = await db.from('patients')
  .select('*')
  .eq('branchId', branchId);
if (error) throw new Error(error.message);
const patients = data ?? [];

// Obtener por ID (una fila o null)
const { data, error } = await db.from('patients')
  .select('*')
  .eq('id', id);
if (error) throw new Error(error.message);
const patient = data?.[0] ?? null;

// Insertar (devuelve las filas creadas)
const { data: rows, error } = await db.from('patients')
  .insert(patientData)
  .select();
if (error) throw new Error(error.message);
const created = rows?.[0];

// Actualizar por filtro
const { error } = await db.from('patients')
  .update(updatedData)
  .eq('id', id);
if (error) throw new Error(error.message);

// Filtros múltiples (encadenar .eq())
const { data, error } = await db.from('appointments')
  .select('*')
  .eq('branchId', branchId)
  .eq('date', date)
  .eq('status', 'scheduled');
if (error) throw new Error(error.message);

// Helpers de fila única (PostgREST)
const { data } = await db.from('patients').select('*').eq('id', id).single();      // error si ≠ 1 fila
const { data } = await db.from('patients').select('*').eq('id', id).maybeSingle();  // null si no existe
```

> ❌ La sintaxis antigua `db.collection('x').where('campo', '==', valor).find()` **no existe**
> en el SDK y fue eliminada de esta documentación.

---

## 3. Colecciones y campos

### branches
id           string    identificador único
name         string    nombre de la sucursal
address      string    dirección física
city         string    ciudad (ej: La Paz, El Alto, Cochabamba)
phone        string    teléfono de contacto
email        string    correo electrónico
status       string    active | inactive
description  string    descripción pública de la clínica (nullable)
isPublic     boolean   visible en el portal público (default true)
coverPhoto   string    URL foto de portada Cloudinary (nullable)
photo1       string    URL foto galería 1 Cloudinary (nullable)
photo2       string    URL foto galería 2 Cloudinary (nullable)
photo3       string    URL foto galería 3 Cloudinary (nullable)
createdAt    string    ISO date

### users
id           string    identificador único
email        string    correo (único en el sistema)
passwordHash string    contraseña hasheada
role         string    admin | doctor | patient
branchId     string    FK → branches.id
isActive     boolean   true | false
fullName     string    nombre completo
createdAt    string    ISO date
updatedAt    string    ISO date

### patients
id        string    identificador único
name      string    nombre completo
phone     string    teléfono
email     string    correo electrónico
status    string    active | inactive
branchId  string    FK → branches.id
userId    string    FK → users.id (nullable, para portal)
photoUrl  string    URL foto Cloudinary (nullable)
createdAt string    ISO date

### professionals
id        string    identificador único
fullName  string    nombre completo
specialty string    especialidad médica
phone     string    teléfono
email     string    correo electrónico
isActive  boolean   true | false
photoUrl  string    URL foto Cloudinary (nullable)
bio       string    biografía corta para el portal (nullable)
isPublic  boolean   visible en el portal público (default true)
createdAt string    ISO date

### appointments
id             string    identificador único
patientId      string    FK → patients.id
professionalId string    FK → professionals.id
branchId       string    FK → branches.id
date           string    fecha (YYYY-MM-DD)
time           string    hora (HH:MM)
reason         string    motivo de la consulta
status         string    scheduled | cancelled | attended
createdAt      string    ISO date
updatedAt      string    ISO date

### medical_records
id             string    identificador único
patientId      string    FK → patients.id
appointmentId  string    FK → appointments.id (nullable)
branchId       string    FK → branches.id
attendanceDate string    fecha de atención (YYYY-MM-DD)
diagnosis      string    diagnóstico
notes          string    notas clínicas (motivo + tratamiento + observaciones)
createdAt      string    ISO date

### reminders
id            string    identificador único
appointmentId string    FK → appointments.id
patientId     string    FK → patients.id
branchId      string    FK → branches.id
message       string    texto del recordatorio
sendAt        string    fecha programada para envío (ISO date)
status        string    pending | sent | cancelled
sentBy        string    userId de quien lo marcó (nullable)
sentAt        string    fecha en que se marcó (nullable)
createdAt     string    ISO date

### payments
id            string    identificador único
appointmentId string    FK → appointments.id
branchId      string    FK → branches.id
amount        number    monto base (sin comisión)
commission    number    comisión calculada (amount * 0.02)
totalAmount   number    monto total (amount + commission)
paymentMethod string    qr | cash
transactionId string    ID de la transacción bancaria (nullable)
status        string    pending | approved | rejected
qrCode        string    código QR en base64 (nullable)
createdAt     string    ISO date
updatedAt     string    ISO date

### supplies
id           string    identificador único
name         string    nombre del insumo
branchId     string    FK → branches.id
stockCurrent number    stock actual
stockMinimum number    stock mínimo de alerta
unit         string    unidad (unidades, cajas, litros, etc.)
status       string    ok | low | critical
updatedAt    string    ISO date

---

## 4. Reglas de la base de datos

Nunca eliminar registros — solo desactivar (status: inactive)
Todo registro tiene createdAt como ISO string
Los registros modificables tienen updatedAt
branchId es obligatorio en todas las colecciones
excepto branches y users
El historial clínico (medical_records) nunca se modifica
email es único en users
No pueden existir dos appointments con el mismo
professionalId + date + time + status: scheduled


---

## 5. Valores por defecto al insertar

Siempre usar los Factories correspondientes.
Nunca construir objetos inline en los servicios.
patients:      PatientFactory.create(data)
→ status: PATIENT_STATUS.ACTIVE
→ createdAt: now()
appointments:  AppointmentFactory.create(data)
→ status: APPOINTMENT_STATUS.SCHEDULED
→ createdAt: now(), updatedAt: now()
reminders:     ReminderFactory.createFromAppointment(appointment)
→ status: REMINDER_STATUS.PENDING
→ sendAt: appointmentDateTime - 24hs
→ createdAt: now()
payments:      PaymentFactory.create(data)
→ commission: amount * QR_COMMISSION_PERCENTAGE
→ totalAmount: amount + commission
→ status: PAYMENT_STATUS.PENDING
→ createdAt: now()

---

## 6. Índices recomendados para rendimiento
patients:      branchId, documentId, status
appointments:  branchId, date, professionalId, status
reminders:     branchId, status, scheduledDate
payments:      branchId, status, appointmentId
supplies:      branchId, status
medical_records: patientId, branchId
