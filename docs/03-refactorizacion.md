# Catálogo de Refactorizaciones / Refactoring Catalog

<details open>
<summary>🇪🇸 Introducción</summary>

Este documento registra las refactorizaciones aplicadas en Etapa 2 y las planificadas para Etapa 3, con justificación técnica basada en principios de ingeniería de software.

</details>

<details>
<summary>🇬🇧 Introduction</summary>

This document records the refactorings applied in Stage 2 and those planned for Stage 3, with technical justification based on software engineering principles.

</details>

---

## Sección 1 / Section 1 — Refactorizaciones Aplicadas en Etapa 2 / Refactorings Applied in Stage 2

---

### R1 — Extract Custom Hook

**Categoría / Category:** Refactorización de organización de código — Code organization refactoring

<details open>
<summary>🇪🇸 Problema detectado</summary>

La lógica de carga de datos, manejo del estado de carga (`loading`), captura de errores y llamadas a servicios estaba mezclada directamente dentro de los componentes de página. Esto viola el principio de **separación de responsabilidades**: los componentes de vista deben ocuparse únicamente de renderizar la interfaz, no de gestionar efectos secundarios ni estado derivado de llamadas a APIs.

</details>

<details>
<summary>🇬🇧 Problem detected</summary>

The logic for data loading, loading state management (`loading`), error handling, and service calls was mixed directly inside page components. This violates the **separation of concerns** principle: view components should only be responsible for rendering the interface, not managing side effects or state derived from API calls.

</details>

#### Código ANTES / Code BEFORE

```jsx
// Patients.jsx — ANTES / BEFORE
// Lógica de datos mezclada con la vista — Data logic mixed with the view
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

  return (
    <div>
      {/* Renderizado de la lista */}
    </div>
  );
}
```

#### Código DESPUÉS / Code AFTER

```js
// hooks/usePatients.js — DESPUÉS / AFTER
// Hook separado con única responsabilidad — Separated hook with single responsibility
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
// pages/Patients.jsx — DESPUÉS / AFTER
// Componente limpio, solo responsable de la vista — Clean component, only responsible for the view
import React from 'react';
import { usePatients } from '../hooks/usePatients';

export default function Patients() {
  const { patients, loading, error } = usePatients();

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* Renderizado limpio — Clean rendering */}
    </div>
  );
}
```

#### Justificación técnica / Technical justification

| Principio / Principle | Antes / Before | Después / After |
|---|---|---|
| **Cohesión** | Baja: la página mezclaba vista y gestión de datos — Low: page mixed view and data management | Alta: cada archivo tiene una sola responsabilidad — High: each file has a single responsibility |
| **Acoplamiento** | Alto: cambiar la fuente de datos requería modificar la vista — High: changing data source required modifying the view | Bajo: cambiar el servicio no afecta al componente — Low: changing the service doesn't affect the component |
| **Reutilización** | Nula: la lógica era exclusiva del componente — None: logic was exclusive to the component | Alta: el hook puede usarse en cualquier vista — High: the hook can be used in any view |
| **Testeabilidad** | Difícil: se necesitaba montar el componente completo — Difficult: required mounting the full component | Sencilla: el hook se prueba de forma aislada — Simple: the hook is tested in isolation |

---

### R2 — Replace Magic Number with Named Constant

**Categoría / Category:** Refactorización de claridad de código — Code clarity refactoring

<details open>
<summary>🇪🇸 Problema detectado</summary>

El servicio de recordatorios usaba el valor literal `24` para calcular cuántas horas antes de la cita debía enviarse un recordatorio. Este "número mágico" no comunica su significado a quien lee el código, dificulta el mantenimiento (si el valor cambia, debe buscarse en todo el código) y viola el principio **DRY** (Don't Repeat Yourself) cuando aparece en múltiples lugares.

</details>

<details>
<summary>🇬🇧 Problem detected</summary>

The reminder service used the literal value `24` to calculate how many hours before the appointment a reminder should be sent. This "magic number" does not communicate its meaning to code readers, makes maintenance difficult (if the value changes, it must be searched throughout the code), and violates the **DRY** (Don't Repeat Yourself) principle when it appears in multiple places.

</details>

#### Código ANTES / Code BEFORE

```js
// reminders/reminderService.js — ANTES / BEFORE
// Número mágico sin contexto — Magic number without context
function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24); // ¿Por qué 24? — Why 24?
  return reminderDate;
}
```

#### Código DESPUÉS / Code AFTER

```js
// core/constants.js — Constante nombrada con significado — Named constant with meaning
// Horas de anticipación para recordatorio — Hours before appointment to send reminder
export const HOURS_BEFORE_REMINDER = 24;
```

```js
// reminders/reminderService.js — DESPUÉS / AFTER
// Uso de la constante nombrada — Using the named constant
const { HOURS_BEFORE_REMINDER } = require('../../frontend/src/core/constants');

function calculateReminderDate(appointmentDate) {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - HOURS_BEFORE_REMINDER);
  return reminderDate;
}
```

#### Justificación técnica / Technical justification

| Aspecto / Aspect | Antes / Before | Después / After |
|---|---|---|
| **Legibilidad** | `24` no comunica su propósito — `24` does not communicate its purpose | `HOURS_BEFORE_REMINDER` es autodocumentado — `HOURS_BEFORE_REMINDER` is self-documenting |
| **Mantenibilidad** | Cambiar a 48h requiere buscar `24` en todo el código — Changing to 48h requires searching `24` throughout the code | Un solo cambio en `constants.js` propaga a todo el sistema — One change in `constants.js` propagates system-wide |
| **SPL** | No adaptable sin modificar lógica — Not adaptable without modifying logic | Cada variante del CRM configura su propia constante — Each CRM variant configures its own constant |
| **DRY** | Violado si `24` aparece en múltiples funciones — Violated if `24` appears in multiple functions | Fuente única de verdad — Single source of truth |

---

## Sección 2 / Section 2 — Refactorizaciones Planificadas para Etapa 3 / Refactorings Planned for Stage 3

---

### R3 — Decompose Conditional

**Categoría / Category:** Simplificación de lógica condicional — Conditional logic simplification

<details open>
<summary>🇪🇸 Problema objetivo y aplicación futura</summary>

**Problema objetivo:** En `AppointmentService.checkTimeConflict()`, la lógica de verificación de solapamiento de horarios involucrará condiciones anidadas complejas (comparar rangos de tiempo, considerar la duración de la cita existente y la nueva). Una condicional larga dificulta la lectura y el testing.

**Aplicación — Etapa 3:** Extraer cada condición de solapamiento en funciones auxiliares nombradas (`hasStartConflict`, `hasEndConflict`, `isContainedWithin`) para que la condicional principal lea como lenguaje natural.

</details>

<details>
<summary>🇬🇧 Target problem and future application</summary>

**Target problem:** In `AppointmentService.checkTimeConflict()`, the time overlap verification logic will involve complex nested conditions (comparing time ranges, considering both existing and new appointment duration). A long conditional makes reading and testing difficult.

**Application — Stage 3:** Extract each overlap condition into named helper functions (`hasStartConflict`, `hasEndConflict`, `isContainedWithin`) so the main conditional reads like natural language.

</details>

---

### R4 — Rename Variable

**Categoría / Category:** Claridad de nombres — Naming clarity

<details open>
<summary>🇪🇸 Problema objetivo y aplicación futura</summary>

**Problema objetivo:** Durante el desarrollo de Etapa 1, variables con nombres genéricos como `data`, `item`, `result` o `d` pueden aparecer en las funciones de servicio. Estos nombres no comunican el dominio y dificultan la comprensión al leer código sin contexto.

**Aplicación — Etapa 3:** Renombrar sistemáticamente para alinear con el vocabulario del dominio: `data` → `patientData`, `item` → `appointmentRecord`, `result` → `reminderList`. Aplicar tanto en backend como en hooks del frontend.

</details>

<details>
<summary>🇬🇧 Target problem and future application</summary>

**Target problem:** During Stage 1 development, variables with generic names like `data`, `item`, `result`, or `d` may appear in service functions. These names do not communicate the domain and make code understanding difficult when reading without context.

**Application — Stage 3:** Systematically rename to align with domain vocabulary: `data` → `patientData`, `item` → `appointmentRecord`, `result` → `reminderList`. Apply in both backend and frontend hooks.

</details>

---

### R5 — Separate Query from Modifier

**Categoría / Category:** Separación de comando y consulta (CQS) — Command-Query Separation (CQS)

<details open>
<summary>🇪🇸 Problema objetivo y aplicación futura</summary>

**Problema objetivo:** Funciones que realizan tanto una consulta (retornan datos) como una modificación (actualizan estado) en la misma operación violan el principio CQS. Por ejemplo, una función que marca una cita como atendida Y retorna el listado actualizado mezcla dos responsabilidades.

**Aplicación — Etapa 3:** Separar en `markAsAttended(id)` (modifier, retorna void) y `listByDate(date)` (query, retorna lista). El componente que consume el hook llama a ambas en secuencia, manteniendo cada función con una única responsabilidad observable.

</details>

<details>
<summary>🇬🇧 Target problem and future application</summary>

**Target problem:** Functions that perform both a query (return data) and a modification (update state) in the same operation violate the CQS principle. For example, a function that marks an appointment as attended AND returns the updated list mixes two responsibilities.

**Application — Stage 3:** Separate into `markAsAttended(id)` (modifier, returns void) and `listByDate(date)` (query, returns list). The component consuming the hook calls both in sequence, keeping each function with a single observable responsibility.

</details>
