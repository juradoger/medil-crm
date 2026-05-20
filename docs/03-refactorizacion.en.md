[![Español](https://img.shields.io/badge/Idioma-Español-00A896?style=flat-square)](03-refactorizacion.md)
[![README](https://img.shields.io/badge/←_Home-README-0E4A8A?style=flat-square)](../README.md)
![Doc](https://img.shields.io/badge/doc-03%20of%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# ♻️ Refactoring Catalog

*R1–R2 applied · R3–R5 planned · Stage 2 → Stage 3*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Principle](https://img.shields.io/badge/Principle-SoC_%7C_DRY_%7C_CQS-00A896?style=flat-square)

</div>

---

This document records the refactorings applied in Stage 2 and those planned for Stage 3, with technical justification based on software engineering principles.

---

## Section 1 — Refactorings Applied in Stage 2

---

### R1 — Extract Custom Hook

![Category](https://img.shields.io/badge/Category-Code_Organization-0E4A8A?style=flat-square)
![Principle](https://img.shields.io/badge/Principle-Separation_of_Concerns-00A896?style=flat-square)

#### Problem detected

The logic for data loading, loading state management (`loading`), error handling, and service calls was mixed directly inside page components. This violates the **separation of concerns** principle: view components should only be responsible for rendering the interface.

#### Code BEFORE

```jsx
// Patients.jsx — BEFORE
// Data logic mixed with the view
import React, { useState, useEffect } from 'react';
import { getPatients, createPatient as createPatientSvc } from '../services/patientService';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    getPatients()
      .then(data => setPatients(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(data) {
    try {
      const newPatient = await createPatientSvc(data);
      setPatients(prev => [...prev, newPatient]);
    } catch (err) { setError(err); }
  }

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error.message}</p>;
  return <div>{/* Rendering */}</div>;
}
```

#### Code AFTER

```js
// hooks/usePatients.js — hook with single responsibility
import { useState, useEffect } from 'react';
import { getPatients, createPatient as createPatientSvc } from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    getPatients()
      .then(data => setPatients(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  async function createPatient(data) {
    const newPatient = await createPatientSvc(data);
    setPatients(prev => [...prev, newPatient]);
  }

  return { patients, loading, error, createPatient };
}
```

```jsx
// pages/Patients.jsx — clean component, only the view
import React from 'react';
import { usePatients } from '../hooks/usePatients';

export default function Patients() {
  const { patients, loading, error } = usePatients();

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error.message}</p>;
  return <div>{/* Clean rendering */}</div>;
}
```

#### Technical justification

| Principle | Before | After |
|:---|:---|:---|
| **Cohesion** | Low — page mixed view and data management | High — each file has a single responsibility |
| **Coupling** | High — changing data source required modifying the view | Low — changing the service doesn't affect the component |
| **Reuse** | None — logic was exclusive to the component | High — the hook is usable in any view |
| **Testability** | Difficult — required mounting the full component | Simple — the hook is tested in isolation |

---

### R2 — Replace Magic Number with Named Constant

![Category](https://img.shields.io/badge/Category-Code_Clarity-0E4A8A?style=flat-square)
![Principle](https://img.shields.io/badge/Principle-DRY_%7C_Self_Documentation-00A896?style=flat-square)

#### Problem detected

The reminder service used the literal value `24` to calculate the hours in advance. This "magic number" does not communicate its meaning, makes maintenance difficult, and violates the **DRY** principle when it appears in multiple places.

#### Code BEFORE

```js
// reminders/reminderService.js — BEFORE
function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // Why 24?
  return reminderDate;
}
```

#### Code AFTER

```js
// core/constants.js
export const HOURS_BEFORE_REMINDER = 24;
```

```js
// reminders/reminderService.js — AFTER
const { HOURS_BEFORE_REMINDER } = require('../../frontend/src/core/constants');

function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - HOURS_BEFORE_REMINDER);
  return reminderDate;
}
```

#### Technical justification

| Aspect | Before | After |
|:---|:---|:---|
| **Readability** | `24` does not communicate its purpose | `HOURS_BEFORE_REMINDER` is self-documenting |
| **Maintainability** | Changing to 48h requires searching `24` throughout the code | One change in `constants.js` propagates system-wide |
| **SPL** | Not adaptable without modifying logic | Each variant configures its own constant |
| **DRY** | Violated if `24` appears in multiple functions | Single source of truth |

---

## Section 2 — Refactorings Planned for Stage 3

---

### R3 — Decompose Conditional

![Category](https://img.shields.io/badge/Category-Conditional_Simplification-0E4A8A?style=flat-square)
![Status](https://img.shields.io/badge/Status-Planned_Stage_3-FFD100?style=flat-square&logoColor=black)

**Target problem:** In `AppointmentService.checkTimeConflict()`, the overlap verification logic will involve complex nested conditions that are difficult to read and test.

**Application — Stage 3:** Extract each condition into named helper functions: `hasStartConflict`, `hasEndConflict`, `isContainedWithin`. The main conditional will read like natural language.

---

### R4 — Rename Variable

![Category](https://img.shields.io/badge/Category-Naming_Clarity-0E4A8A?style=flat-square)
![Status](https://img.shields.io/badge/Status-Planned_Stage_3-FFD100?style=flat-square&logoColor=black)

**Target problem:** Variables with generic names (`data`, `item`, `result`, `d`) do not communicate the domain and make code understanding difficult.

**Application — Stage 3:** Systematically rename to align with domain vocabulary:

| Generic name | Domain name |
|:---:|:---:|
| `data` | `patientData` |
| `item` | `appointmentRecord` |
| `result` | `reminderList` |

---

### R5 — Separate Query from Modifier

![Category](https://img.shields.io/badge/Category-CQS-0E4A8A?style=flat-square)
![Status](https://img.shields.io/badge/Status-Planned_Stage_3-FFD100?style=flat-square&logoColor=black)

**Target problem:** Functions that perform both a query (return data) and a modification (update state) in the same operation violate the **CQS principle** (Command-Query Separation).

**Application — Stage 3:** Separate into:
- `markAsAttended(id)` — modifier, returns `void`
- `listByDate(date)` — query, returns list

---

<div align="center">

[← 🧩 Components](02-componentes.en.md) &nbsp;|&nbsp; [🛠️ Stack →](04-stack.en.md) &nbsp;|&nbsp; [← Back to README](../README.md)

</div>
