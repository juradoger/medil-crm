# DATABASE.md — MedIL CRM/ERP
> Referencia de base de datos del proyecto.
> Leer antes de crear o modificar servicios que acceden a InsForge.

---

## 1. Motor de base de datos
Motor:    InsForge (PostgreSQL 15 bajo el capó)
SDK:      @insforge/sdk ^1.2.10
Cliente:  frontend/src/lib/insforge.js
backend/infrastructure/insforge.js

---

## 2. Patrón de acceso — InsForge SDK

Siempre usar estos patrones. Nunca usar fetch directo a InsForge.

```js
import { db } from '../lib/insforge';

// Obtener todos (con filtro de sucursal)
const result = await db.collection('patients')
  .where('branchId', '==', branchId)
  .find();

// Obtener por ID
const result = await db.collection('patients')
  .where('id', '==', id)
  .find();
const patient = result[0] ?? null;

// Insertar
const created = await db.collection('patients')
  .insert(patientData);

// Actualizar
const updated = await db.collection('patients')
  .where('id', '==', id)
  .update(updatedData);

// Filtros múltiples
const result = await db.collection('appointments')
  .where('branchId', '==', branchId)
  .where('date', '==', date)
  .where('status', '==', 'scheduled')
  .find();
```

---

## 3. Colecciones y campos

### branches
id          string    identificador único
name        string    nombre de la sucursal
address     string    dirección física
city        string    ciudad (ej: La Paz, El Alto, Cochabamba)
phone       string    teléfono de contacto
email       string    correo electrónico
status      string    active | inactive
createdAt   string    ISO date

### users
id          string    identificador único
email       string    correo (único en el sistema)
passwordHash string   contraseña hasheada
role        string    admin | doctor | patient
branchId    string    FK → branches.id
isActive    boolean   true | false
fullName    string    nombre completo
createdAt   string    ISO date
updatedAt   string    ISO date

### patients
id          string    identificador único
fullName    string    nombre completo
documentId  string    CI o documento (único en el sistema)
phone       string    teléfono
email       string    correo electrónico
birthDate   string    fecha de nacimiento (YYYY-MM-DD)
status      string    active | inactive
branchId    string    FK → branches.id
userId      string    FK → users.id (nullable, para portal)
createdAt   string    ISO date
updatedAt   string    ISO date

### professionals
id          string    identificador único
fullName    string    nombre completo
specialty   string    especialidad médica
phone       string    teléfono
email       string    correo electrónico
branchId    string    FK → branches.id
userId      string    FK → users.id
isActive    boolean   true | false
createdAt   string    ISO date

### appointments
id             string    identificador único
patientId      string    FK → patients.id
professionalId string    FK → professionals.id
branchId       string    FK → branches.id
date           string    fecha (YYYY-MM-DD)
time           string    hora (HH:MM)
reason         string    motivo de la consulta
status         string    scheduled | cancelled | attended | pending_payment
createdAt      string    ISO date
updatedAt      string    ISO date

### medical_records
id                  string    identificador único
patientId           string    FK → patients.id
appointmentId       string    FK → appointments.id (nullable)
branchId            string    FK → branches.id
attendanceDate      string    fecha de atención (YYYY-MM-DD)
consultationReason  string    motivo de consulta
diagnosis           string    diagnóstico
treatment           string    tratamiento e indicaciones
observations        string    observaciones adicionales (nullable)
createdAt           string    ISO date

### reminders
id            string    identificador único
appointmentId string    FK → appointments.id
patientId     string    FK → patients.id
branchId      string    FK → branches.id
message       string    texto del recordatorio
scheduledDate string    fecha programada (ISO date)
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
documentId es único en patients
email es único en users
No pueden existir dos appointments con el mismo
professionalId + date + time + status: scheduled


---

## 5. Valores por defecto al insertar

Siempre usar los Factories correspondientes.
Nunca construir objetos inline en los servicios.
patients:      PatientFactory.create(data)
→ status: PATIENT_STATUS.ACTIVE
→ createdAt: now(), updatedAt: now()
appointments:  AppointmentFactory.create(data)
→ status: APPOINTMENT_STATUS.SCHEDULED
→ createdAt: now(), updatedAt: now()
reminders:     ReminderFactory.createFromAppointment(appointment)
→ status: REMINDER_STATUS.PENDING
→ scheduledDate: appointmentDateTime - 24hs
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
