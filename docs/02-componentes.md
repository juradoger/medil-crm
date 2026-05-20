# Catálogo de Componentes Reutilizables / Reusable Component Catalog

<details open>
<summary>🇪🇸 Español — clic para colapsar</summary>

Este documento describe los 7 componentes reutilizables del sistema MedIL CRM, su rol en la arquitectura, sus métodos principales y por qué son reutilizables dentro de una línea de producto de software para el sector salud.

---

## Componente 1 — PatientService (backend)

**Tipo:** Servicio de dominio  
**Ubicación:** `backend/patients/patientService.js`

### Problema que resuelve

Sin este servicio, la lógica de negocio de pacientes estaría dispersa en múltiples controladores o directamente en las rutas del backend, generando duplicación y acoplamiento. PatientService centraliza toda la lógica relacionada con el ciclo de vida del paciente en un único módulo cohesivo.

### Métodos principales

| Método | Descripción |
|---|---|
| `createPatient(patientData)` | Crea y persiste un nuevo registro de paciente |
| `updatePatient(id, patientData)` | Actualiza datos de un paciente existente |
| `getPatientById(id)` | Recupera un paciente por su ID único |
| `searchPatients(query)` | Busca pacientes por nombre u otros criterios |
| `validatePatientData(patientData)` | Valida la integridad de los datos antes de persistir |

### Reutilizabilidad en SPL

El módulo es reutilizable en odontología, pediatría, psicología y fisioterapia porque el concepto de "paciente registrado" es común a todas las especialidades médicas. Solo `validatePatientData` requeriría extensión para campos específicos de la especialidad (ej. número de seguro dental, nombre del tutor en pediatría).

**Otros sistemas del sector salud donde podría usarse:**
- Sistema de gestión hospitalaria (HIS)
- Portal de telemedicina
- Sistema de farmacia con registro de clientes

---

## Componente 2 — AppointmentService (backend)

**Tipo:** Servicio de dominio  
**Ubicación:** `backend/appointments/appointmentService.js`

### Problema que resuelve

La gestión de citas requiere lógica compleja: verificación de conflictos de horario, transición de estados y vinculación con recordatorios. Sin un servicio dedicado, esta lógica se repite en cada punto de la aplicación que necesita crear o modificar una cita.

### Métodos principales

| Método | Descripción |
|---|---|
| `createAppointment(data)` | Crea una nueva cita médica |
| `cancelAppointment(id)` | Cancela una cita y actualiza su estado |
| `markAsAttended(id)` | Marca la cita como atendida |
| `listByDate(date)` | Lista todas las citas de una fecha |
| `checkTimeConflict(date, duration)` | Verifica colisión de horarios |

### Reutilizabilidad en SPL

El ciclo de vida de una cita (agendada → atendida/cancelada) es idéntico en todas las especialidades médicas. `checkTimeConflict` es especialmente valioso en fisioterapia (citas recurrentes semanales) y odontología (sesiones múltiples).

**Otros sistemas del sector salud:**
- Agendamiento quirúrgico
- Reserva de equipos médicos (resonancias, ecografías)

---

## Componente 3 — MedicalRecordService (backend)

**Tipo:** Servicio de dominio  
**Ubicación:** `backend/records/recordService.js`

### Problema que resuelve

El historial clínico requiere integridad temporal: las entradas nunca se eliminan, siempre se agregan, y deben presentarse en orden cronológico. Sin un servicio dedicado, la lógica de ordenamiento y creación de entradas estaría duplicada en múltiples módulos.

### Métodos principales

| Método | Descripción |
|---|---|
| `createEntry(patientId, entryData)` | Agrega una entrada al historial del paciente |
| `getPatientHistory(patientId)` | Recupera el historial completo del paciente |
| `sortByDate(entries)` | Ordena entradas por fecha descendente |

### Reutilizabilidad en SPL

Las notas clínicas son universales. En psicología, `createEntry` almacena notas de sesión. En fisioterapia, almacena evaluaciones de evolución motora. El formato de entrada puede variarse sin cambiar la interfaz del servicio.

**Otros sistemas del sector salud:**
- Sistema de historia clínica electrónica (HCE)
- Plataforma de seguimiento oncológico

---

## Componente 4 — ReminderService (backend)

**Tipo:** Servicio de dominio  
**Ubicación:** `backend/reminders/reminderService.js`

### Problema que resuelve

Sin este servicio, la lógica de cuándo y cómo enviar recordatorios estaría acoplada al módulo de citas. ReminderService aísla esta responsabilidad y usa la constante `HOURS_BEFORE_REMINDER` en lugar de valores literales, evitando el antipatrón "número mágico".

### Métodos principales

| Método | Descripción |
|---|---|
| `createReminderForAppointment(appointmentId)` | Crea un recordatorio vinculado a una cita |
| `calculateReminderDate(appointmentDate)` | Calcula la fecha de envío (cita − 24h) |
| `generateMessage(patientName, date)` | Genera el texto del recordatorio |
| `markAsSent(reminderId)` | Marca el recordatorio como enviado |
| `listPending()` | Lista recordatorios pendientes de envío |

### Reutilizabilidad en SPL

`HOURS_BEFORE_REMINDER` puede configurarse a 48h para psicología (sesiones de mayor compromiso) o a 2h para urgencias odontológicas. El servicio no cambia; solo cambia la constante.

**Otros sistemas del sector salud:**
- Sistema de notificaciones de vacunación
- Plataforma de seguimiento de medicación

---

## Componente 5 — StatusBadge (React component)

**Tipo:** Componente React presentacional  
**Ubicación:** `frontend/src/components/StatusBadge.jsx`

### Problema que resuelve

Sin este componente, cada página del CRM implementaría su propia lógica de colores y etiquetas para mostrar el estado de citas, recordatorios y pacientes. Esto genera inconsistencia visual y duplicación de código de presentación.

### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `status` | `string` | Estado del registro (ej. `'scheduled'`) |
| `type` | `'appointment' \| 'reminder' \| 'patient'` | Tipo de entidad para elegir el mapa de estilos |

### Reutilizabilidad en SPL

Para extender a una nueva especialidad solo se agrega una entrada al objeto `STYLES` y `LABELS`. El componente mismo no se modifica. Esto es el principio Abierto/Cerrado (Open/Closed Principle) aplicado.

**Otros sistemas del sector salud:**
- Cualquier interfaz clínica que necesite representar estados de forma consistente

---

## Componente 6 — usePatients (custom hook)

**Tipo:** Hook personalizado de React  
**Ubicación:** `frontend/src/hooks/usePatients.js`

### Problema que resuelve

Sin este hook, cada página que necesite listar o gestionar pacientes duplicaría la lógica de llamadas a la API, manejo de estados de carga y captura de errores. El hook extrae esta lógica en una unidad reutilizable (refactorización Extract Custom Hook).

### Interfaz del hook

```js
const { patients, loading, error, createPatient, updatePatient, searchPatients } = usePatients();
```

| Valor | Tipo | Descripción |
|---|---|---|
| `patients` | `Array` | Lista de pacientes cargados |
| `loading` | `boolean` | Verdadero mientras carga |
| `error` | `Error \| null` | Error capturado o null |
| `createPatient(data)` | `Function` | Crea paciente y actualiza estado |
| `updatePatient(id, data)` | `Function` | Actualiza paciente y refresca lista |
| `searchPatients(query)` | `Function` | Busca y filtra la lista |

### Reutilizabilidad en SPL

El hook puede ser importado por cualquier página del CRM que necesite datos de pacientes. En variantes de la SPL, solo cambia el servicio subyacente; la interfaz del hook permanece idéntica.

---

## Componente 7 — useAppointments (custom hook)

**Tipo:** Hook personalizado de React  
**Ubicación:** `frontend/src/hooks/useAppointments.js`

### Problema que resuelve

La gestión de citas implica múltiples operaciones de estado (crear, cancelar, filtrar) que, sin un hook dedicado, contaminarían los componentes de vista con lógica que no les corresponde, violando el principio de separación de responsabilidades.

### Interfaz del hook

```js
const { appointments, loading, error, createAppointment, cancelAppointment, filterByDate } = useAppointments();
```

| Valor | Tipo | Descripción |
|---|---|---|
| `appointments` | `Array` | Lista de citas cargadas |
| `loading` | `boolean` | Verdadero mientras carga |
| `error` | `Error \| null` | Error capturado o null |
| `createAppointment(data)` | `Function` | Crea cita y actualiza estado |
| `cancelAppointment(id)` | `Function` | Cancela cita y refresca lista |
| `filterByDate(date)` | `Function` | Filtra citas por fecha |

### Reutilizabilidad en SPL

En fisioterapia (citas recurrentes) o psicología (sesiones con duración fija diferente), solo se modifica `appointmentService.js`. El hook `useAppointments` y todos los componentes que lo consumen no requieren cambios.

**Otros sistemas del sector salud:**
- Sistema de gestión de turnos de guardia
- Agendamiento de salas quirúrgicas

</details>

---

<details>
<summary>🇬🇧 English — click to expand</summary>

This document describes the 7 reusable components of the MedIL CRM system, their role in the architecture, their main methods, and why they are reusable within a software product line for the healthcare sector.

---

## Component 1 — PatientService (backend)

**Type:** Domain service  
**Location:** `backend/patients/patientService.js`

### Problem it solves

Without this service, patient business logic would be scattered across multiple controllers or directly in backend routes, generating duplication and coupling. PatientService centralizes all logic related to the patient lifecycle in a single cohesive module.

### Main methods

| Method | Description |
|---|---|
| `createPatient(patientData)` | Creates and persists a new patient record |
| `updatePatient(id, patientData)` | Updates data of an existing patient |
| `getPatientById(id)` | Retrieves a patient by unique ID |
| `searchPatients(query)` | Searches patients by name or other criteria |
| `validatePatientData(patientData)` | Validates data integrity before persisting |

### SPL Reusability

The module is reusable in dentistry, pediatrics, psychology, and physiotherapy because the concept of "registered patient" is common to all medical specialties. Only `validatePatientData` would require extension for specialty-specific fields (e.g., dental insurance number, guardian name in pediatrics).

**Other healthcare systems where it could be used:**
- Hospital Information System (HIS)
- Telemedicine portal
- Pharmacy system with customer records

---

## Component 2 — AppointmentService (backend)

**Type:** Domain service  
**Location:** `backend/appointments/appointmentService.js`

### Problem it solves

Appointment management requires complex logic: time conflict verification, state transitions, and linking with reminders. Without a dedicated service, this logic is repeated at every application point that needs to create or modify an appointment.

### Main methods

| Method | Description |
|---|---|
| `createAppointment(data)` | Creates a new medical appointment |
| `cancelAppointment(id)` | Cancels an appointment and updates its status |
| `markAsAttended(id)` | Marks the appointment as attended |
| `listByDate(date)` | Lists all appointments for a date |
| `checkTimeConflict(date, duration)` | Checks for time slot collision |

### SPL Reusability

The appointment lifecycle (scheduled → attended/cancelled) is identical across all medical specialties. `checkTimeConflict` is especially valuable in physiotherapy (weekly recurring appointments) and dentistry (multiple sessions).

**Other healthcare systems:**
- Surgical scheduling
- Medical equipment booking (MRI, ultrasound)

---

## Component 3 — MedicalRecordService (backend)

**Type:** Domain service  
**Location:** `backend/records/recordService.js`

### Problem it solves

Medical records require temporal integrity: entries are never deleted, always appended, and must be presented in chronological order. Without a dedicated service, sorting and entry creation logic would be duplicated across multiple modules.

### Main methods

| Method | Description |
|---|---|
| `createEntry(patientId, entryData)` | Appends an entry to the patient's history |
| `getPatientHistory(patientId)` | Retrieves the patient's complete history |
| `sortByDate(entries)` | Sorts entries by descending date |

### SPL Reusability

Clinical notes are universal. In psychology, `createEntry` stores session notes. In physiotherapy, it stores motor evolution evaluations. The entry format can vary without changing the service interface.

**Other healthcare systems:**
- Electronic Health Record (EHR) system
- Oncology follow-up platform

---

## Component 4 — ReminderService (backend)

**Type:** Domain service  
**Location:** `backend/reminders/reminderService.js`

### Problem it solves

Without this service, the logic of when and how to send reminders would be coupled to the appointment module. ReminderService isolates this responsibility and uses the `HOURS_BEFORE_REMINDER` constant instead of literal values, avoiding the "magic number" anti-pattern.

### Main methods

| Method | Description |
|---|---|
| `createReminderForAppointment(appointmentId)` | Creates a reminder linked to an appointment |
| `calculateReminderDate(appointmentDate)` | Calculates send date (appointment − 24h) |
| `generateMessage(patientName, date)` | Generates the reminder text |
| `markAsSent(reminderId)` | Marks the reminder as sent |
| `listPending()` | Lists pending reminders |

### SPL Reusability

`HOURS_BEFORE_REMINDER` can be configured to 48h for psychology (higher-commitment sessions) or 2h for dental emergencies. The service does not change; only the constant changes.

**Other healthcare systems:**
- Vaccination notification system
- Medication adherence tracking platform

---

## Component 5 — StatusBadge (React component)

**Type:** Presentational React component  
**Location:** `frontend/src/components/StatusBadge.jsx`

### Problem it solves

Without this component, each CRM page would implement its own color and label logic to display appointment, reminder, and patient statuses. This generates visual inconsistency and presentation code duplication.

### Props

| Prop | Type | Description |
|---|---|---|
| `status` | `string` | Record status (e.g., `'scheduled'`) |
| `type` | `'appointment' \| 'reminder' \| 'patient'` | Entity type to select the style map |

### SPL Reusability

To extend to a new specialty, only an entry is added to the `STYLES` and `LABELS` objects. The component itself is not modified. This is the Open/Closed Principle applied.

**Other healthcare systems:**
- Any clinical interface needing consistent status representation

---

## Component 6 — usePatients (custom hook)

**Type:** React custom hook  
**Location:** `frontend/src/hooks/usePatients.js`

### Problem it solves

Without this hook, every page needing to list or manage patients would duplicate API call logic, loading state management, and error handling. The hook extracts this logic into a reusable unit (Extract Custom Hook refactoring).

### Hook interface

```js
const { patients, loading, error, createPatient, updatePatient, searchPatients } = usePatients();
```

| Value | Type | Description |
|---|---|---|
| `patients` | `Array` | Loaded patient list |
| `loading` | `boolean` | True while loading |
| `error` | `Error \| null` | Captured error or null |
| `createPatient(data)` | `Function` | Creates patient and updates state |
| `updatePatient(id, data)` | `Function` | Updates patient and refreshes list |
| `searchPatients(query)` | `Function` | Searches and filters the list |

### SPL Reusability

The hook can be imported by any CRM page that needs patient data. In SPL variants, only the underlying service changes; the hook interface remains identical.

---

## Component 7 — useAppointments (custom hook)

**Type:** React custom hook  
**Location:** `frontend/src/hooks/useAppointments.js`

### Problem it solves

Appointment management involves multiple state operations (create, cancel, filter) that, without a dedicated hook, would contaminate view components with logic that doesn't belong there, violating the separation of concerns principle.

### Hook interface

```js
const { appointments, loading, error, createAppointment, cancelAppointment, filterByDate } = useAppointments();
```

| Value | Type | Description |
|---|---|---|
| `appointments` | `Array` | Loaded appointment list |
| `loading` | `boolean` | True while loading |
| `error` | `Error \| null` | Captured error or null |
| `createAppointment(data)` | `Function` | Creates appointment and updates state |
| `cancelAppointment(id)` | `Function` | Cancels appointment and refreshes list |
| `filterByDate(date)` | `Function` | Filters appointments by date |

### SPL Reusability

In physiotherapy (recurring appointments) or psychology (sessions with different fixed duration), only `appointmentService.js` is modified. The `useAppointments` hook and all components consuming it require no changes.

**Other healthcare systems:**
- On-call shift management system
- Surgical room scheduling

</details>
