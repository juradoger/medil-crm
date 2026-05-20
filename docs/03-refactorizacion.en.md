[![Español](https://img.shields.io/badge/Idioma-Español-00A896?style=flat-square)](03-refactorizacion.md)
[![README](https://img.shields.io/badge/←_Home-README-0E4A8A?style=flat-square)](../README.md)
![Doc](https://img.shields.io/badge/doc-03%20of%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# ♻️ Refactoring Catalog — MediL CRM

*R1–R3 applied · R4–R5 planned · Stage 2 → Stage 4*

</div>

---

## Applied Refactorings

---

### R1 — Extract Custom Hook

![Category](https://img.shields.io/badge/Category-Code_Organization-0E4A8A?style=flat-square)
![Principle](https://img.shields.io/badge/Principle-DRY_%7C_Consistency-00A896?style=flat-square)
![Status](https://img.shields.io/badge/Status-Applied_Stage_2-00A896?style=flat-square)

#### Problem detected

The `useAppointments.js` hook handled `loading` and `error` states inconsistently: `filterByDate` managed them correctly, but `createAppointment`, `cancelAppointment`, and `markAsAttended` had no state management at all, violating the hook's internal consistency principle.

#### Code BEFORE (see `useAppointments.BEFORE-R1.js`)

```js
// BEFORE — without consistent loading/error handling
async function createAppointment(appointmentData) {
  const newAppt = await createSvc(appointmentData);   // no loading
  setAppointments((prev) => [...prev, newAppt]);      // no error handling
  return newAppt;
}
```

#### Code AFTER

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

#### Technical justification

| Principle | Before | After |
|:---|:---|:---|
| **DRY** | Loading/error logic repeated (or missing) in each function | `withLoading()` is the single source of truth for state handling |
| **High cohesion** | Hook was inconsistent: some functions managed state, others did not | The hook fully and uniformly encapsulates loading state |
| **Consistency** | Different behavior depending on which function was called | All hook operations have the same guaranteed behavior |
| **Reuse** | Loading logic was non-reusable and duplicated | `withLoading()` applies to any future async operation |

---

### R2 — Replace Magic Number with Named Constant

![Category](https://img.shields.io/badge/Category-Code_Clarity-0E4A8A?style=flat-square)
![Principle](https://img.shields.io/badge/Principle-DRY_%7C_Self_Documentation-00A896?style=flat-square)
![Status](https://img.shields.io/badge/Status-Applied_Stage_1-00A896?style=flat-square)

#### Problem detected

The value `24` appeared as a literal number in `reminderService.js` without expressing its semantic meaning or its relationship to the business rule: the hours in advance to send a reminder.

#### Code BEFORE

```js
// BEFORE — magic number without context
function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // Why 24?
  return reminderDate;
}
```

#### Code AFTER

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

#### Technical justification

| Aspect | Before | After |
|:---|:---|:---|
| **Readability** | `24` does not communicate its domain purpose | `HOURS_BEFORE_REMINDER` is self-documenting |
| **Maintainability** | Changing the rule requires searching for `24` across the code | One change in `constants.js` propagates system-wide |
| **SPL** | Not adaptable without modifying business logic | Each CRM variant configures its own constant |
| **DRY** | The value would be duplicated across multiple functions | Single source of truth for the advance-notice rule |

---

### R3 — Decompose Conditional

![Category](https://img.shields.io/badge/Category-Conditional_Simplification-0E4A8A?style=flat-square)
![Principle](https://img.shields.io/badge/Principle-Readability_%7C_SRP-00A896?style=flat-square)
![Status](https://img.shields.io/badge/Status-Applied_Stage_2-00A896?style=flat-square)

#### Problem detected

The `createAppointment()` function in `appointmentService.js` concentrated multiple validations directly in its body, mixing validation logic with creation and persistence logic. The conditions did not clearly express their purpose and were difficult to test in isolation.

#### Code BEFORE (see `appointmentService.BEFORE-R3.js`)

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

#### Code AFTER

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

#### Technical justification

| Principle | Before | After |
|:---|:---|:---|
| **Readability** | Conditions did not communicate their purpose | `isFutureDate`, `isPatientActive` read like natural language |
| **Reuse** | Validations encapsulated with no possibility of reuse | `isFutureDate` and `isPatientActive` are exported and reusable |
| **Testability** | Testing one validation required executing the entire function | Each validation function is tested in complete isolation |
| **Low coupling** | Validation and persistence mixed in a single block | Validation separated from creation logic and reminder generation |

---

## Planned Refactorings

---

### R4 — Rename Variable

![Category](https://img.shields.io/badge/Category-Naming_Clarity-0E4A8A?style=flat-square)
![Status](https://img.shields.io/badge/Status-Planned_Stage_4-FFD100?style=flat-square&logoColor=black)

Variables with non-descriptive names (`d`, `res`, `data`, `err`) will be renamed to semantic names aligned with domain vocabulary (`appointmentDate`, `patientRecord`, `apiResponse`, `validationError`) to improve code readability and maintainability.

| Generic name | Domain name |
|:---:|:---:|
| `data` | `appointmentData` / `patientData` |
| `res` | `apiResponse` |
| `err` | `validationError` |
| `d` | `appointmentDate` |

---

### R5 — Separate Query from Modifier

![Category](https://img.shields.io/badge/Category-CQS-0E4A8A?style=flat-square)
![Status](https://img.shields.io/badge/Status-Planned_Stage_4-FFD100?style=flat-square&logoColor=black)

Functions that currently query and modify data in the same operation will be separated following the **Command-Query Separation (CQS)** principle:
- `getReminders()` — query only, returns list, no side effects
- `markAsSent()` — command only, returns `void`, modifies state

This eliminates hidden side effects and makes the code easier to reason about.

---

<div align="center">

[← 🧩 Components](02-componentes.en.md) &nbsp;|&nbsp; [🛠️ Stack →](04-stack.en.md) &nbsp;|&nbsp; [← Back to README](../README.md)

</div>
