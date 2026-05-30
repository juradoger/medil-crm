# REFACTORING.md — MedIL CRM/ERP
> Referencia de técnicas de refactorización aplicadas y planificadas.
> Leer antes de modificar código existente o detectar un bad smell.

---

## 1. ¿Qué es refactorizar?

Refactorizar es mejorar la estructura interna del código
sin cambiar su comportamiento externo observable.

### Lo que ES refactorizar
- Renombrar una variable para que su nombre sea más descriptivo
- Dividir una función larga en funciones más pequeñas
- Mover lógica duplicada a un lugar centralizado
- Reemplazar un número literal por una constante con nombre

### Lo que NO ES refactorizar
- Agregar nueva funcionalidad
- Corregir un bug
- Cambiar el comportamiento del sistema
- Reescribir todo desde cero

### ¿Por qué refactorizamos?
El código que funciona hoy puede ser difícil de mantener mañana.
Refactorizar mantiene el código limpio, legible y escalable
a medida que el sistema crece.

### Regla de oro
Nunca refactorizar sin tests que verifiquen
que el comportamiento no cambió.
Los tests son la red de seguridad de la refactorización.

---

## 2. Cuándo refactorizar

Refactorizar cuando detectás alguna de estas señales:
✗ Una función tiene más de 20 líneas
✗ Un componente tiene más de 100 líneas
✗ El mismo código aparece en 2 o más lugares
✗ Hay un número o string literal sin nombre semántico
✗ Una condición tiene más de 2 operadores lógicos (&&, ||)
✗ Un método hace más de una cosa
✗ El nombre no describe claramente qué hace
✗ Hay que leer el código varias veces para entenderlo

### Proceso siempre igual

Identificar el bad smell (ver ARCHITECTURE.md sección 6)
Verificar que existe el test que cubre ese código
Si no existe, escribir el test primero
Aplicar la técnica de refactorización
Verificar que los tests siguen pasando
Documentar aquí con evidencia


---

## 3. Técnicas aplicadas en MedIL

---

### R1 — Extract Custom Hook

**Estado:** aplicado en useAppointments.js
**Evidencia:** docs/evidence/useAppointments.BEFORE-R1.js

#### ¿Qué es la técnica?
Extract Method aplicado a React.
Extraer lógica de estado, efectos y operaciones async
fuera de un componente visual hacia un hook reutilizable.

#### Problema detectado
El componente AppointmentsPage tenía mezclados:
- fetch de datos (lógica de datos)
- manejo de loading y error (lógica de estado)
- operaciones CRUD (lógica de negocio)
- renderizado de la UI (lógica de presentación)

Violaba el principio de Separación de Responsabilidades (SRP).
No era testeable de forma aislada.
No era reutilizable desde otras páginas.

#### Código ANTES
```jsx
// ANTES — lógica mezclada en el componente
function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_INSFORGE_API_URL}/appointments`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(data) {
    // Sin loading, sin error handling
    const res = await fetch('.../appointments', { method: 'POST', body: JSON.stringify(data) });
    const newAppt = await res.json();
    setAppointments(prev => [...prev, newAppt]);
  }

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{/* renderizado mezclado con lógica */}</div>;
}
```

#### Código DESPUÉS
```js
// DESPUÉS — hook separado y reutilizable
export function useAppointments(branchId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // withLoading: lógica de loading/error extraída una sola vez
  async function withLoading(fn) {
    setLoading(true);
    setError(null);
    try { return await fn(); }
    catch (err) { setError(err.message); throw err; }
    finally { setLoading(false); }
  }

  useEffect(() => {
    withLoading(() => appointmentService.getAll(branchId));
  }, [branchId]);

  async function createAppointment(data) {
    return withLoading(async () => {
      const newAppt = await appointmentService.create(data);
      setAppointments(prev => [...prev, newAppt]);
      return newAppt;
    });
  }

  return { appointments, loading, error, createAppointment };
}
```

```jsx
// Componente limpio — solo renderiza
function AppointmentsPage() {
  const { appointments, loading, error, createAppointment } = useAppointments(currentBranchId);
  if (loading) return <Spinner />;
  if (error) return <EmptyState title={error} />;
  return <DataTable data={appointments} />;
}
```

#### Mejora aplicada
- SRP: el componente solo renderiza
- Alta cohesión: toda la lógica de citas en un lugar
- Reutilización: useAppointments se usa en Dashboard,
  DoctorConsole y AppointmentsPage sin duplicar código
- Testeable: el hook se prueba independientemente

#### Cuándo aplicar R1
Cuando un componente hace fetch de datos directamente.
Cuando el mismo patrón de loading/error se repite.
Cuando la lógica de datos no puede reutilizarse desde otro componente.

---

### R2 — Replace Magic Number with Named Constant

**Estado:** aplicado en reminderService y billingService
**Evidencia:** docs/evidence/useAppointments.BEFORE-R1.js

#### ¿Qué es la técnica?
Reemplazar un valor literal (número o string) por una
constante con nombre semántico en core/constants.js.

#### Problema detectado
El valor 24 aparecía literal en el cálculo del recordatorio.
El valor 0.02 aparecía literal en el cálculo de comisión.
Sin nombres, nadie sabe qué significan esos valores
ni por qué tienen ese valor específico.

#### Código ANTES
```js
// ANTES — números mágicos
function calculateReminderDate(appointmentDate, appointmentTime) {
  const dt = new Date(`${appointmentDate}T${appointmentTime}`);
  dt.setHours(dt.getHours() - 24);  // ¿Por qué 24?
  return dt;
}

function calculateTotal(amount) {
  const commission = amount * 0.02;  // ¿Por qué 0.02?
  return { subtotal: amount, commission, total: amount + commission };
}
```

#### Código DESPUÉS
```js
// core/constants.js
export const HOURS_BEFORE_REMINDER = 24;
export const QR_COMMISSION_PERCENTAGE = 0.02;

// DESPUÉS — constantes con nombre semántico
import { HOURS_BEFORE_REMINDER, QR_COMMISSION_PERCENTAGE } from '../core/constants';

function calculateReminderDate(appointmentDate, appointmentTime) {
  const dt = new Date(`${appointmentDate}T${appointmentTime}`);
  dt.setHours(dt.getHours() - HOURS_BEFORE_REMINDER);
  return dt;
}

function calculateTotal(amount) {
  const commission = amount * QR_COMMISSION_PERCENTAGE;
  return { subtotal: amount, commission, total: amount + commission };
}
```

#### Mejora aplicada
- Legibilidad: HOURS_BEFORE_REMINDER comunica intención
- Mantenibilidad: cambiar la regla de negocio = una línea en constants.js
- Reglas explícitas: las constantes documentan decisiones del dominio
- Sin duplicación: el valor no se repite en múltiples archivos

#### Cuándo aplicar R2
Cuando aparece un número o string literal en lógica de negocio.
Cuando el valor podría cambiar según la variante de la SPL.
Cuando el valor se repite en más de un lugar.

---

### R3 — Decompose Conditional

**Estado:** aplicado en appointmentService.js
**Evidencia:** docs/evidence/appointmentService.BEFORE-R3.js

#### ¿Qué es la técnica?
Extraer condiciones complejas o anidadas en funciones
con nombres que expresen claramente su propósito.

#### Problema detectado
La función createAppointment() tenía validaciones
mezcladas con lógica de creación en una sola función.
Las condiciones no comunicaban su propósito.

#### Código ANTES
```js
// ANTES — validaciones mezcladas y sin nombre
async function createAppointment(data) {
  const apptDateTime = new Date(`${data.date}T${data.time}`);
  if (apptDateTime <= new Date()) {
    throw new Error('Fecha inválida');
  }
  const existing = await db.collection('appointments')
    .where('professionalId', '==', data.professionalId)
    .where('date', '==', data.date)
    .where('time', '==', data.time)
    .find();
  if (existing.length > 0) {
    throw new Error('Horario ocupado');
  }
  const patient = await db.collection('patients')
    .where('id', '==', data.patientId).find();
  if (!patient[0] || patient[0].status !== 'active') {
    throw new Error('Paciente inactivo');
  }
  // ... lógica de creación
}
```

#### Código DESPUÉS
```js
// DESPUÉS — condiciones descompuestas en funciones expresivas
function isFutureDate(date, time) {
  return new Date(`${date}T${time}`) > new Date();
}

async function isTimeSlotFree(professionalId, date, time) {
  const conflict = await appointmentRepo.findConflict(professionalId, date, time);
  return !conflict;
}

async function isPatientActive(patientId) {
  const patient = await patientRepo.findById(patientId);
  return patient?.isActive() ?? false;
}

async function createAppointment(data) {
  if (!isFutureDate(data.date, data.time))
    throw new Error(MESSAGES.error.validation.futureDate);

  if (!await isPatientActive(data.patientId))
    throw new Error(MESSAGES.error.validation.inactivePatient);

  if (!await isTimeSlotFree(data.professionalId, data.date, data.time))
    throw new Error(MESSAGES.error.validation.timeConflict);

  const appointment = AppointmentFactory.create(data);
  return appointmentRepo.save(appointment);
}
```

#### Mejora aplicada
- Legibilidad: cada condición tiene nombre que expresa su propósito
- Reutilización: isFutureDate e isPatientActive son exportables
- Testabilidad: cada función se prueba de forma aislada
- Bajo acoplamiento: validación separada de persistencia

#### Cuándo aplicar R3
Cuando una condición necesita comentario para entenderse.
Cuando una función tiene más de 2 condiciones encadenadas.
Cuando la misma condición aparece en varios lugares.

---

### R4 — Rename Variable

**Estado:** planificada — aplicar en Etapa 4
**Dónde aplicar:** servicios y hooks con variables sin semántica

#### ¿Qué es la técnica?
Renombrar variables, parámetros y funciones para que
su nombre comunique claramente qué contienen o qué hacen.

#### Problema a resolver
Variables genéricas sin semántica aparecen en servicios y hooks:
```js
// Variables sin semántica
const d = new Date(`${date}T${time}`);
const res = await fetch(url);
const data = await res.json();
const err = catch(e);
const tmp = [...patients];
```

#### Código ANTES
```js
async function getAll(branchId) {
  const res = await db.collection('patients')
    .where('branchId', '==', branchId).find();
  return res;
}

function calculateReminderDate(d, t) {
  const dt = new Date(`${d}T${t}`);
  dt.setHours(dt.getHours() - HOURS_BEFORE_REMINDER);
  return dt;
}
```

#### Código DESPUÉS
```js
async function getAll(branchId) {
  const patients = await db.collection('patients')
    .where('branchId', '==', branchId).find();
  return patients;
}

function calculateReminderDate(appointmentDate, appointmentTime) {
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
  appointmentDateTime.setHours(
    appointmentDateTime.getHours() - HOURS_BEFORE_REMINDER
  );
  return appointmentDateTime;
}
```

#### Cuándo aplicar R4
Cuando una variable se llama d, res, data, tmp, err, e, i, j.
Cuando hay que leer el contexto para entender qué contiene.
Cuando el tipo y propósito no son obvios por el nombre.

---

### R5 — Separate Query from Modifier

**Estado:** planificada — aplicar en Etapa 4
**Dónde aplicar:** reminderService.js, billingService.js

#### ¿Qué es la técnica?
Principio Command-Query Separation (CQS).
Una función que consulta datos no debe modificarlos.
Una función que modifica datos no debe retornarlos.

#### Problema a resolver
Funciones que hacen dos cosas: consultan Y modifican.

#### Código ANTES
```js
// ANTES — consulta y modifica en la misma función
async function getAndMarkReminders(branchId) {
  const reminders = await db.collection('reminders')
    .where('branchId', '==', branchId)
    .where('status', '==', 'pending')
    .find();

  // Esta función también modifica — viola CQS
  await db.collection('reminders')
    .where('status', '==', 'pending')
    .update({ status: 'sent' });

  return reminders;
}
```

#### Código DESPUÉS
```js
// DESPUÉS — query separado de modifier
// Query: solo consulta, no modifica
async function getPendingReminders(branchId) {
  return db.collection('reminders')
    .where('branchId', '==', branchId)
    .where('status', '==', REMINDER_STATUS.PENDING)
    .find();
}

// Modifier: solo modifica, retorna confirmación
async function markReminderAsSent(id, sentBy) {
  return db.collection('reminders')
    .where('id', '==', id)
    .update({
      status: REMINDER_STATUS.SENT,
      sentBy,
      sentAt: new Date().toISOString(),
    });
}
```

#### Cuándo aplicar R5
Cuando una función hace fetch Y modifica datos en la misma operación.
Cuando el nombre sugiere dos acciones (getAndMark, fetchAndUpdate).
Cuando es difícil saber si llamar la función tiene efectos secundarios.

---

## 4. Criterios para detectar cuándo refactorizar
Señal                              Técnica a aplicar
────────────────────────────────────────────────────────────────
Función de más de 20 líneas        R1 (Extract Method/Hook)
Lógica mezclada en componente      R1 (Extract Custom Hook)
Número o string literal            R2 (Replace Magic Number)
Condición compleja sin nombre      R3 (Decompose Conditional)
Variable sin semántica             R4 (Rename Variable)
Función que consulta y modifica    R5 (Separate Query from Modifier)

---

## 5. Registro de refactorizaciones aplicadas
R1  Extract Custom Hook       Etapa 2  useAppointments.js     ✅ aplicado
R2  Replace Magic Number      Etapa 2  constants.js           ✅ aplicado
R3  Decompose Conditional     Etapa 2  appointmentService.js  ✅ aplicado
R4  Rename Variable           Etapa 4  servicios y hooks      🔄 planificado
R5  Separate Query/Modifier   Etapa 4  reminderService.js     🔄 planificado
