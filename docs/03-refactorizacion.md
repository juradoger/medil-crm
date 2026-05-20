[![English](https://img.shields.io/badge/Language-English-0E4A8A?style=flat-square&logo=googletranslate&logoColor=white)](03-refactorizacion.en.md)
[![README](https://img.shields.io/badge/←_Inicio-README-00A896?style=flat-square)](../README.es.md)
![Doc](https://img.shields.io/badge/doc-03%20de%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

</div>

# ♻️ Refactorizaciones / Refactorings — MediL CRM

---

## Refactorizaciones Aplicadas / Applied Refactorings

---

### R1 — Extract Custom Hook / Extract Custom Hook

---

**🇪🇸 Español**

**Problema detectado:**
El hook `useAppointments.js` manejaba de forma inconsistente los estados de `loading` y `error`: `filterByDate` los gestionaba correctamente, pero `createAppointment`, `cancelAppointment` y `markAsAttended` no tenían ningún manejo de estado, violando el principio de consistencia interna del hook.

**Código ANTES** (ver `useAppointments.BEFORE-R1.js`):

```js
// ANTES — sin manejo consistente de loading/error
// BEFORE — without consistent loading/error handling
async function createAppointment(appointmentData) {
  const newAppt = await createSvc(appointmentData);      // sin loading — no loading
  setAppointments((prev) => [...prev, newAppt]);         // sin error handling — no error handling
  return newAppt;
}

// filterByDate SÍ manejaba loading/error — inconsistencia — filterByDate DID handle loading/error — inconsistency
async function filterByDate(date) {
  setLoading(true);
  setError(null);
  try {
    const data = await getByDate(date);
    setAppointments(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

**Código DESPUÉS:**

```js
// DESPUÉS — withLoading() centraliza el manejo de estado para todas las operaciones
// AFTER — withLoading() centralizes state handling for all operations
async function withLoading(fn) {
  setLoading(true);
  setError(null);
  try {
    return await fn();
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}

async function createAppointment(data) {
  return withLoading(async () => {
    const newAppt = await createSvc(data);
    setAppointments((prev) => [...prev, newAppt]);
    return newAppt;
  });
}

async function filterByDate(date) {
  return withLoading(async () => {
    const data = await getByDate(date);
    setAppointments(data);
    return data;
  });
}
```

**Justificación técnica:**

| Principio | Antes | Después |
|:---|:---|:---|
| **DRY** | Lógica de loading/error repetida (o ausente) en cada función | `withLoading()` es la única fuente de verdad para el manejo de estado |
| **Alta cohesión** | El hook era inconsistente: algunas funciones manejaban estado, otras no | El hook encapsula completamente y de forma uniforme el estado de carga |
| **Consistencia** | Comportamiento distinto según qué función se llamara | Todas las operaciones del hook tienen el mismo comportamiento garantizado |
| **Reutilización** | La lógica de carga era no reutilizable y estaba duplicada | `withLoading()` aplica a cualquier operación asíncrona futura |

---

**🇬🇧 English**

**Problem detected:**
The `useAppointments.js` hook handled `loading` and `error` states inconsistently: `filterByDate` managed them correctly, but `createAppointment`, `cancelAppointment`, and `markAsAttended` had no state management at all, violating the hook's internal consistency principle.

**Code BEFORE** (see `useAppointments.BEFORE-R1.js`):

```js
// BEFORE — without consistent loading/error handling
async function createAppointment(appointmentData) {
  const newAppt = await createSvc(appointmentData);      // no loading
  setAppointments((prev) => [...prev, newAppt]);         // no error handling
  return newAppt;
}

// filterByDate DID handle loading/error — inconsistent with the above
async function filterByDate(date) {
  setLoading(true);
  setError(null);
  try {
    const data = await getByDate(date);
    setAppointments(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

**Code AFTER:**

```js
// AFTER — withLoading() centralizes state handling for all operations
async function withLoading(fn) {
  setLoading(true);
  setError(null);
  try {
    return await fn();
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}

async function createAppointment(data) {
  return withLoading(async () => {
    const newAppt = await createSvc(data);
    setAppointments((prev) => [...prev, newAppt]);
    return newAppt;
  });
}
```

**Technical justification:**

| Principle | Before | After |
|:---|:---|:---|
| **DRY** | Loading/error logic repeated (or missing) in each function | `withLoading()` is the single source of truth for state handling |
| **High cohesion** | Hook was inconsistent: some functions managed state, others did not | The hook fully and uniformly encapsulates loading state |
| **Consistency** | Different behavior depending on which function was called | All hook operations have the same guaranteed behavior |
| **Reuse** | Loading logic was non-reusable and duplicated | `withLoading()` applies to any future async operation |

---

### R2 — Replace Magic Number with Named Constant / Replace Magic Number with Named Constant

---

**🇪🇸 Español**

**Problema detectado:**
El valor `24` aparecía como número literal en `reminderService.js` sin expresar su significado semántico ni su relación con la regla de negocio: las horas de anticipación para enviar un recordatorio.

**Código ANTES:**

```js
// ANTES — número mágico sin contexto — BEFORE — magic number without context
function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // ¿Por qué 24? — Why 24?
  return reminderDate;
}
```

**Código DESPUÉS:**

```js
// En core/constants.js — In core/constants.js
// Horas de anticipación para el recordatorio — Hours before appointment for reminder
export const HOURS_BEFORE_REMINDER = 24;
```

```js
// En reminderService.js — In reminderService.js
const { HOURS_BEFORE_REMINDER } = require('../../frontend/src/core/constants');

// DESPUÉS — constante semántica y configurable por variante — AFTER — semantic constant, configurable per variant
function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - HOURS_BEFORE_REMINDER);
  return reminderDate;
}
```

**Justificación técnica:**

| Aspecto | Antes | Después |
|:---|:---|:---|
| **Legibilidad** | `24` no comunica su propósito en el dominio | `HOURS_BEFORE_REMINDER` es autodocumentado |
| **Mantenibilidad** | Cambiar la regla requiere buscar `24` en todo el código | Un cambio en `constants.js` se propaga a todo el sistema |
| **SPL** | No adaptable sin modificar lógica de negocio | Cada variante del CRM configura su propia constante |
| **DRY** | El valor se duplicaría si aparece en más de una función | Única fuente de verdad para la regla de anticipación |

---

**🇬🇧 English**

**Problem detected:**
The value `24` appeared as a literal number in `reminderService.js` without expressing its semantic meaning or its relationship to the business rule: the hours in advance to send a reminder.

**Code BEFORE:**

```js
// BEFORE — magic number without context
function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // Why 24?
  return reminderDate;
}
```

**Code AFTER:**

```js
// In core/constants.js
export const HOURS_BEFORE_REMINDER = 24; // Hours before appointment for reminder

// In reminderService.js
const { HOURS_BEFORE_REMINDER } = require('../../frontend/src/core/constants');

function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - HOURS_BEFORE_REMINDER); // semantic
  return reminderDate;
}
```

**Technical justification:**

| Aspect | Before | After |
|:---|:---|:---|
| **Readability** | `24` does not communicate its domain purpose | `HOURS_BEFORE_REMINDER` is self-documenting |
| **Maintainability** | Changing the rule requires searching for `24` across the code | One change in `constants.js` propagates system-wide |
| **SPL** | Not adaptable without modifying business logic | Each CRM variant configures its own constant |
| **DRY** | The value would be duplicated across multiple functions | Single source of truth for the advance-notice rule |

---

### R3 — Decompose Conditional / Decompose Conditional

---

**🇪🇸 Español**

**Problema detectado:**
La función `createAppointment()` en `appointmentService.js` concentraba múltiples validaciones directamente en su cuerpo, mezclando la lógica de validación con la lógica de creación y persistencia. Las condiciones no expresaban su propósito con claridad y eran difíciles de probar de forma aislada.

**Código ANTES** (ver `appointmentService.BEFORE-R3.js`):

```js
// ANTES — validaciones mezcladas en createAppointment — BEFORE — validations mixed inside createAppointment
async function createAppointment(data) {
  const apptDateTime = new Date(`${data.date}T${data.time}`);
  if (apptDateTime <= new Date()) {
    throw new Error('Fecha inválida — Invalid date');
  }
  const conflict = await checkTimeConflict(data.professionalId, data.date, data.time);
  if (conflict) {
    throw new Error('Horario ocupado — Time slot taken');
  }
  const patRes = await fetch(`${API_URL}/patients/${data.patientId}`, { headers: getHeaders() });
  const patient = await patRes.json();
  if (!patRes.ok || patient.status !== 'active') {
    throw new Error('Paciente inactivo — Inactive patient');
  }
  // ... lógica de creación mezclada a continuación — creation logic mixed in below
}
```

**Código DESPUÉS:**

```js
// DESPUÉS — funciones expresivas con nombre que comunica su propósito
// AFTER — expressive named functions that communicate their purpose

// Verifica si la fecha y hora de la cita son futuras — Checks if appointment date and time are in the future
function isFutureDate(date, time) {
  const appointmentDateTime = new Date(`${date}T${time}`);
  return appointmentDateTime > new Date();
}

// Verifica si el horario está libre para el profesional — Checks if time slot is free for the professional
async function isTimeSlotFree(professionalId, date, time) {
  const conflict = await checkTimeConflict(professionalId, date, time);
  return !conflict;
}

// Verifica si el paciente existe y está activo — Checks if patient exists and is active
async function isPatientActive(patientId) {
  const res = await fetch(`${API_URL}/patients/${patientId}`, { headers: getHeaders() });
  if (!res.ok) return false;
  const patient = await res.json();
  return patient.status === 'active';
}

async function createAppointment(data) {
  const { patientId, professionalId, date, time, reason } = data;
  if (!patientId || !professionalId || !date || !time || !reason) {
    throw new Error('Todos los campos son obligatorios — All fields are required');
  }

  if (!isFutureDate(date, time)) {
    throw new Error('La fecha de la cita debe ser futura — Appointment date must be in the future');
  }
  if (!await isPatientActive(patientId)) {
    throw new Error('El paciente no existe o está inactivo — Patient does not exist or is inactive');
  }
  if (!await isTimeSlotFree(professionalId, date, time)) {
    throw new Error('El profesional ya tiene una cita en ese horario — Professional already has an appointment at that time');
  }
  // ... lógica de creación limpia y separada — clean, separated creation logic
}
```

**Justificación técnica:**

| Principio | Antes | Después |
|:---|:---|:---|
| **Legibilidad** | Las condiciones no comunicaban su propósito | `isFutureDate`, `isPatientActive` se leen como lenguaje natural |
| **Reutilización** | Las validaciones estaban acopladas sin posibilidad de reutilizarse | `isFutureDate` e `isPatientActive` son exportables a otros módulos |
| **Testabilidad** | Probar una validación requería ejecutar toda la función | Cada función de validación se prueba de forma completamente aislada |
| **Bajo acoplamiento** | Validación y persistencia mezcladas en un solo bloque | Validación separada de la lógica de creación y del generador de recordatorios |

---

**🇬🇧 English**

**Problem detected:**
The `createAppointment()` function in `appointmentService.js` concentrated multiple validations directly in its body, mixing validation logic with creation and persistence logic. The conditions did not clearly express their purpose and were difficult to test in isolation.

**Code BEFORE** (see `appointmentService.BEFORE-R3.js`):

```js
// BEFORE — validations mixed inside createAppointment
async function createAppointment(data) {
  const apptDateTime = new Date(`${data.date}T${data.time}`);
  if (apptDateTime <= new Date()) {
    throw new Error('Invalid date');
  }
  const conflict = await checkTimeConflict(data.professionalId, data.date, data.time);
  if (conflict) {
    throw new Error('Time slot taken');
  }
  const patRes = await fetch(`${API_URL}/patients/${data.patientId}`, { headers: getHeaders() });
  const patient = await patRes.json();
  if (!patRes.ok || patient.status !== 'active') {
    throw new Error('Inactive patient');
  }
  // ... creation logic mixed in below
}
```

**Code AFTER:**

```js
// AFTER — expressive named functions that communicate their purpose
function isFutureDate(date, time) {
  return new Date(`${date}T${time}`) > new Date();
}

async function isTimeSlotFree(professionalId, date, time) {
  return !(await checkTimeConflict(professionalId, date, time));
}

async function isPatientActive(patientId) {
  const res = await fetch(`${API_URL}/patients/${patientId}`, { headers: getHeaders() });
  if (!res.ok) return false;
  return (await res.json()).status === 'active';
}

async function createAppointment(data) {
  if (!isFutureDate(data.date, data.time))
    throw new Error('Appointment date must be in the future');
  if (!await isPatientActive(data.patientId))
    throw new Error('Patient does not exist or is inactive');
  if (!await isTimeSlotFree(data.professionalId, data.date, data.time))
    throw new Error('Professional already has an appointment at that time');
  // ... clean, separated creation logic
}
```

**Technical justification:**

| Principle | Before | After |
|:---|:---|:---|
| **Readability** | Conditions did not communicate their purpose | `isFutureDate`, `isPatientActive` read like natural language |
| **Reuse** | Validations encapsulated with no possibility of reuse | `isFutureDate` and `isPatientActive` are exported and reusable |
| **Testability** | Testing one validation required executing the entire function | Each validation function is tested in complete isolation |
| **Low coupling** | Validation and persistence mixed in a single block | Validation separated from creation logic and reminder generation |

---

## Refactorizaciones Planificadas / Planned Refactorings

---

### R4 — Rename Variable / Rename Variable

*Aplicación futura — Etapa 4 / Future application — Stage 4*

**🇪🇸** Variables con nombres poco descriptivos (`d`, `res`, `data`, `err`) serán renombradas a nombres semánticos alineados con el vocabulario del dominio (`appointmentDate`, `patientRecord`, `apiResponse`, `validationError`) para mejorar la legibilidad y el mantenimiento del código.

**🇬🇧** Variables with non-descriptive names (`d`, `res`, `data`, `err`) will be renamed to semantic names aligned with domain vocabulary to improve code readability and maintainability.

---

### R5 — Separate Query from Modifier / Separate Query from Modifier

*Aplicación futura — Etapa 4 / Future application — Stage 4*

**🇪🇸** Funciones que actualmente consultan y modifican datos en la misma operación serán separadas siguiendo el principio **Command-Query Separation (CQS)**: `getReminders()` solo consulta y retorna datos, `markAsSent()` solo modifica y retorna `void`. Esto elimina efectos secundarios ocultos y facilita el razonamiento sobre el código.

**🇬🇧** Functions that currently query and modify data in the same operation will be separated following the **Command-Query Separation (CQS)** principle: `getReminders()` only queries and returns data, `markAsSent()` only modifies and returns `void`. This eliminates hidden side effects and makes the code easier to reason about.

---

<div align="center">

[← 🧩 Componentes](02-componentes.md) &nbsp;|&nbsp; [🛠️ Stack →](04-stack.md) &nbsp;|&nbsp; [← Volver al README](../README.es.md)

</div>
