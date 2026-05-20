# Catálogo de Refactorizaciones / Refactoring Catalog

<details open>
<summary>🇪🇸 Español — clic para colapsar</summary>

Este documento registra las refactorizaciones aplicadas en Etapa 2 y las planificadas para Etapa 3, con justificación técnica basada en principios de ingeniería de software.

---

## Sección 1 — Refactorizaciones Aplicadas en Etapa 2

---

### R1 — Extract Custom Hook

**Categoría:** Refactorización de organización de código

#### Problema detectado

La lógica de carga de datos, manejo del estado de carga (`loading`), captura de errores y llamadas a servicios estaba mezclada directamente dentro de los componentes de página. Esto viola el principio de **separación de responsabilidades**: los componentes de vista deben ocuparse únicamente de renderizar la interfaz, no de gestionar efectos secundarios ni estado derivado de llamadas a APIs.

#### Código ANTES

```jsx
// Patients.jsx — ANTES de la refactorización
// Lógica de datos mezclada con la vista
import React, { useState, useEffect } from 'react';
import { getPatients, createPatient as createPatientSvc } from '../services/patientService';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err);
    }
  }

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>{/* Renderizado de la lista */}</div>;
}
```

#### Código DESPUÉS

```js
// hooks/usePatients.js — hook separado con única responsabilidad
import { useState, useEffect } from 'react';
import { getPatients, createPatient as createPatientSvc } from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
// pages/Patients.jsx — componente limpio, solo responsable de la vista
import React from 'react';
import { usePatients } from '../hooks/usePatients';

export default function Patients() {
  const { patients, loading, error } = usePatients();

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>{/* Renderizado limpio */}</div>;
}
```

#### Justificación técnica

| Principio | Antes | Después |
|---|---|---|
| **Cohesión** | Baja: la página mezclaba vista y gestión de datos | Alta: cada archivo tiene una sola responsabilidad |
| **Acoplamiento** | Alto: cambiar la fuente de datos requería modificar la vista | Bajo: cambiar el servicio no afecta al componente |
| **Reutilización** | Nula: la lógica era exclusiva del componente | Alta: el hook puede usarse en cualquier vista |
| **Testeabilidad** | Difícil: se necesitaba montar el componente completo | Sencilla: el hook se prueba de forma aislada |

---

### R2 — Replace Magic Number with Named Constant

**Categoría:** Refactorización de claridad de código

#### Problema detectado

El servicio de recordatorios usaba el valor literal `24` para calcular cuántas horas antes de la cita debía enviarse un recordatorio. Este "número mágico" no comunica su significado a quien lee el código, dificulta el mantenimiento y viola el principio **DRY** (Don't Repeat Yourself) cuando aparece en múltiples lugares.

#### Código ANTES

```js
// reminders/reminderService.js — ANTES
function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // ¿Por qué 24?
  return reminderDate;
}
```

#### Código DESPUÉS

```js
// core/constants.js
export const HOURS_BEFORE_REMINDER = 24;
```

```js
// reminders/reminderService.js — DESPUÉS
const { HOURS_BEFORE_REMINDER } = require('../../frontend/src/core/constants');

function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - HOURS_BEFORE_REMINDER);
  return reminderDate;
}
```

#### Justificación técnica

| Aspecto | Antes | Después |
|---|---|---|
| **Legibilidad** | `24` no comunica su propósito | `HOURS_BEFORE_REMINDER` es autodocumentado |
| **Mantenibilidad** | Cambiar a 48h requiere buscar `24` en todo el código | Un solo cambio en `constants.js` propaga a todo el sistema |
| **SPL** | No adaptable sin modificar lógica | Cada variante del CRM configura su propia constante |
| **DRY** | Violado si `24` aparece en múltiples funciones | Fuente única de verdad |

---

## Sección 2 — Refactorizaciones Planificadas para Etapa 3

---

### R3 — Decompose Conditional

**Categoría:** Simplificación de lógica condicional

**Problema objetivo:** En `AppointmentService.checkTimeConflict()`, la lógica de verificación de solapamiento de horarios involucrará condiciones anidadas complejas. Una condicional larga dificulta la lectura y el testing.

**Aplicación — Etapa 3:** Extraer cada condición de solapamiento en funciones auxiliares nombradas (`hasStartConflict`, `hasEndConflict`, `isContainedWithin`) para que la condicional principal lea como lenguaje natural.

---

### R4 — Rename Variable

**Categoría:** Claridad de nombres

**Problema objetivo:** Variables con nombres genéricos como `data`, `item`, `result` o `d` no comunican el dominio y dificultan la comprensión del código.

**Aplicación — Etapa 3:** Renombrar sistemáticamente para alinear con el vocabulario del dominio: `data` → `patientData`, `item` → `appointmentRecord`, `result` → `reminderList`. Aplicar tanto en backend como en hooks del frontend.

---

### R5 — Separate Query from Modifier

**Categoría:** Separación de comando y consulta (CQS)

**Problema objetivo:** Funciones que realizan tanto una consulta (retornan datos) como una modificación (actualizan estado) en la misma operación violan el principio CQS.

**Aplicación — Etapa 3:** Separar en `markAsAttended(id)` (modifier, retorna void) y `listByDate(date)` (query, retorna lista). El componente que consume el hook llama a ambas en secuencia, manteniendo cada función con una única responsabilidad observable.

</details>

---

<details>
<summary>🇬🇧 English — click to expand</summary>

This document records the refactorings applied in Stage 2 and those planned for Stage 3, with technical justification based on software engineering principles.

---

## Section 1 — Refactorings Applied in Stage 2

---

### R1 — Extract Custom Hook

**Category:** Code organization refactoring

#### Problem detected

The logic for data loading, loading state management (`loading`), error handling, and service calls was mixed directly inside page components. This violates the **separation of concerns** principle: view components should only be responsible for rendering the interface, not managing side effects or state derived from API calls.

#### Code BEFORE

```jsx
// Patients.jsx — BEFORE refactoring
// Data logic mixed with the view
import React, { useState, useEffect } from 'react';
import { getPatients, createPatient as createPatientSvc } from '../services/patientService';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>{/* Patient list rendering */}</div>;
}
```

#### Code AFTER

```js
// hooks/usePatients.js — separated hook with single responsibility
import { useState, useEffect } from 'react';
import { getPatients, createPatient as createPatientSvc } from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
// pages/Patients.jsx — clean component, only responsible for the view
import React from 'react';
import { usePatients } from '../hooks/usePatients';

export default function Patients() {
  const { patients, loading, error } = usePatients();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>{/* Clean rendering */}</div>;
}
```

#### Technical justification

| Principle | Before | After |
|---|---|---|
| **Cohesion** | Low: page mixed view and data management | High: each file has a single responsibility |
| **Coupling** | High: changing data source required modifying the view | Low: changing the service doesn't affect the component |
| **Reuse** | None: logic was exclusive to the component | High: the hook can be used in any view |
| **Testability** | Difficult: required mounting the full component | Simple: the hook is tested in isolation |

---

### R2 — Replace Magic Number with Named Constant

**Category:** Code clarity refactoring

#### Problem detected

The reminder service used the literal value `24` to calculate how many hours before the appointment a reminder should be sent. This "magic number" does not communicate its meaning to code readers, makes maintenance difficult, and violates the **DRY** (Don't Repeat Yourself) principle when it appears in multiple places.

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
|---|---|---|
| **Readability** | `24` does not communicate its purpose | `HOURS_BEFORE_REMINDER` is self-documenting |
| **Maintainability** | Changing to 48h requires searching `24` throughout the code | One change in `constants.js` propagates system-wide |
| **SPL** | Not adaptable without modifying logic | Each CRM variant configures its own constant |
| **DRY** | Violated if `24` appears in multiple functions | Single source of truth |

---

## Section 2 — Refactorings Planned for Stage 3

---

### R3 — Decompose Conditional

**Category:** Conditional logic simplification

**Target problem:** In `AppointmentService.checkTimeConflict()`, the time overlap verification logic will involve complex nested conditions. A long conditional makes reading and testing difficult.

**Application — Stage 3:** Extract each overlap condition into named helper functions (`hasStartConflict`, `hasEndConflict`, `isContainedWithin`) so the main conditional reads like natural language.

---

### R4 — Rename Variable

**Category:** Naming clarity

**Target problem:** Variables with generic names like `data`, `item`, `result`, or `d` do not communicate the domain and make code understanding difficult.

**Application — Stage 3:** Systematically rename to align with domain vocabulary: `data` → `patientData`, `item` → `appointmentRecord`, `result` → `reminderList`. Apply in both backend and frontend hooks.

---

### R5 — Separate Query from Modifier

**Category:** Command-Query Separation (CQS)

**Target problem:** Functions that perform both a query (return data) and a modification (update state) in the same operation violate the CQS principle.

**Application — Stage 3:** Separate into `markAsAttended(id)` (modifier, returns void) and `listByDate(date)` (query, returns list). The component consuming the hook calls both in sequence, keeping each function with a single observable responsibility.

</details>
