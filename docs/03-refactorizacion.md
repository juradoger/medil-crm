[![English](https://img.shields.io/badge/Language-English-0E4A8A?style=flat-square)](03-refactorizacion.en.md)
[![README](https://img.shields.io/badge/←_Inicio-README-00A896?style=flat-square)](../README.es.md)
![Doc](https://img.shields.io/badge/doc-03%20de%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# ♻️ Catálogo de Refactorizaciones

*R1–R2 aplicadas · R3–R5 planificadas · Etapa 2 → Etapa 3*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Principio](https://img.shields.io/badge/Principio-SoC_%7C_DRY_%7C_CQS-00A896?style=flat-square)

</div>

---

Este documento registra las refactorizaciones aplicadas en Etapa 2 y las planificadas para Etapa 3, con justificación técnica basada en principios de ingeniería de software.

---

## Sección 1 — Refactorizaciones Aplicadas en Etapa 2

---

### R1 — Extract Custom Hook

![Categoría](https://img.shields.io/badge/Categoría-Organización_de_código-0E4A8A?style=flat-square)
![Principio](https://img.shields.io/badge/Principio-Separación_de_responsabilidades-00A896?style=flat-square)

#### Problema detectado

La lógica de carga de datos, manejo del estado de carga (`loading`), captura de errores y llamadas a servicios estaba mezclada directamente dentro de los componentes de página. Esto viola el principio de **separación de responsabilidades**: los componentes de vista deben ocuparse únicamente de renderizar la interfaz.

#### Código ANTES

```jsx
// Patients.jsx — ANTES
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
    } catch (err) { setError(err); }
  }

  if (loading) return <p>Cargando...</p>;
  if (error)   return <p>Error: {error.message}</p>;
  return <div>{/* Renderizado */}</div>;
}
```

#### Código DESPUÉS

```js
// hooks/usePatients.js — hook con única responsabilidad
import { useState, useEffect } from 'react';
import { getPatients, createPatient as createPatientSvc } from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

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
// pages/Patients.jsx — componente limpio, solo la vista
import React from 'react';
import { usePatients } from '../hooks/usePatients';

export default function Patients() {
  const { patients, loading, error } = usePatients();

  if (loading) return <p>Cargando...</p>;
  if (error)   return <p>Error: {error.message}</p>;
  return <div>{/* Renderizado limpio */}</div>;
}
```

#### Justificación técnica

| Principio | Antes | Después |
|:---|:---|:---|
| **Cohesión** | Baja — página mezclaba vista y datos | Alta — cada archivo tiene una sola responsabilidad |
| **Acoplamiento** | Alto — cambiar datos requería modificar la vista | Bajo — cambiar el servicio no afecta al componente |
| **Reutilización** | Nula — lógica exclusiva del componente | Alta — el hook es usable en cualquier vista |
| **Testeabilidad** | Difícil — requería montar el componente completo | Sencilla — el hook se prueba de forma aislada |

---

### R2 — Replace Magic Number with Named Constant

![Categoría](https://img.shields.io/badge/Categoría-Claridad_de_código-0E4A8A?style=flat-square)
![Principio](https://img.shields.io/badge/Principio-DRY_%7C_Autodocumentación-00A896?style=flat-square)

#### Problema detectado

El servicio de recordatorios usaba el valor literal `24` para calcular las horas de anticipación. Este "número mágico" no comunica su significado, dificulta el mantenimiento y viola el principio **DRY** cuando aparece en múltiples lugares.

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
|:---|:---|:---|
| **Legibilidad** | `24` no comunica su propósito | `HOURS_BEFORE_REMINDER` es autodocumentado |
| **Mantenibilidad** | Cambiar a 48h requiere buscar `24` en todo el código | Un cambio en `constants.js` propaga a todo el sistema |
| **SPL** | No adaptable sin modificar lógica | Cada variante configura su propia constante |
| **DRY** | Violado si `24` aparece en múltiples funciones | Fuente única de verdad |

---

## Sección 2 — Refactorizaciones Planificadas para Etapa 3

---

### R3 — Decompose Conditional

![Categoría](https://img.shields.io/badge/Categoría-Simplificación_condicional-0E4A8A?style=flat-square)
![Estado](https://img.shields.io/badge/Estado-Planificada_Etapa_3-FFD100?style=flat-square&logoColor=black)

**Problema objetivo:** En `AppointmentService.checkTimeConflict()`, la lógica de verificación de solapamiento involucrará condiciones anidadas complejas difíciles de leer y testear.

**Aplicación — Etapa 3:** Extraer cada condición en funciones auxiliares nombradas: `hasStartConflict`, `hasEndConflict`, `isContainedWithin`. La condicional principal leerá como lenguaje natural.

---

### R4 — Rename Variable

![Categoría](https://img.shields.io/badge/Categoría-Claridad_de_nombres-0E4A8A?style=flat-square)
![Estado](https://img.shields.io/badge/Estado-Planificada_Etapa_3-FFD100?style=flat-square&logoColor=black)

**Problema objetivo:** Variables con nombres genéricos (`data`, `item`, `result`, `d`) no comunican el dominio y dificultan la comprensión del código.

**Aplicación — Etapa 3:** Renombrar sistemáticamente alineando con el vocabulario del dominio:

| Nombre genérico | Nombre del dominio |
|:---:|:---:|
| `data` | `patientData` |
| `item` | `appointmentRecord` |
| `result` | `reminderList` |

---

### R5 — Separate Query from Modifier

![Categoría](https://img.shields.io/badge/Categoría-CQS-0E4A8A?style=flat-square)
![Estado](https://img.shields.io/badge/Estado-Planificada_Etapa_3-FFD100?style=flat-square&logoColor=black)

**Problema objetivo:** Funciones que realizan tanto una consulta (retornan datos) como una modificación (actualizan estado) en la misma operación violan el **principio CQS** (Command-Query Separation).

**Aplicación — Etapa 3:** Separar en:
- `markAsAttended(id)` — modifier, retorna `void`
- `listByDate(date)` — query, retorna lista

---

<div align="center">

[← 🧩 Componentes](02-componentes.md) &nbsp;|&nbsp; [🛠️ Stack →](04-stack.md) &nbsp;|&nbsp; [← Volver al README](../README.es.md)

</div>
