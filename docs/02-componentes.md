# Catálogo de Componentes Reutilizables — Reusable Component Catalog

Este documento describe los 7 componentes reutilizables del sistema MedIL CRM, su rol en la arquitectura, sus métodos principales y por qué son reutilizables dentro de una línea de producto de software para el sector salud.

This document describes the 7 reusable components of the MedIL CRM system, their role in the architecture, their main methods, and why they are reusable within a software product line for the healthcare sector.

---

## Componente 1 — PatientService (backend)

**Tipo / Type:** Servicio de dominio — Domain service  
**Ubicación / Location:** `backend/patients/patientService.js`

### Problema que resuelve — Problem it solves

Sin este servicio, la lógica de negocio de pacientes estaría dispersa en múltiples controladores o directamente en las rutas del backend, generando duplicación y acoplamiento. PatientService centraliza toda la lógica relacionada con el ciclo de vida del paciente en un único módulo cohesivo.

Without this service, patient business logic would be scattered across multiple controllers or directly in backend routes, generating duplication and coupling. PatientService centralizes all logic related to the patient lifecycle in a single cohesive module.

### Métodos principales — Main methods

| Método / Method | Descripción / Description |
|---|---|
| `createPatient(patientData)` | Crea y persiste un nuevo registro de paciente — Creates and persists a new patient record |
| `updatePatient(id, patientData)` | Actualiza datos de un paciente existente — Updates data of an existing patient |
| `getPatientById(id)` | Recupera un paciente por su ID único — Retrieves a patient by unique ID |
| `searchPatients(query)` | Busca pacientes por nombre u otros criterios — Searches patients by name or other criteria |
| `validatePatientData(patientData)` | Valida la integridad de los datos antes de persistir — Validates data integrity before persisting |

### Reutilizabilidad en SPL — SPL Reusability

El módulo es reutilizable en odontología, pediatría, psicología y fisioterapia porque el concepto de "paciente registrado" es común a todas las especialidades médicas. Solo `validatePatientData` requeriría extensión para campos específicos de la especialidad (ej. número de seguro dental, nombre del tutor en pediatría).

The module is reusable in dentistry, pediatrics, psychology, and physiotherapy because the concept of "registered patient" is common to all medical specialties. Only `validatePatientData` would require extension for specialty-specific fields (e.g., dental insurance number, guardian name in pediatrics).

**Otros sistemas del sector salud donde podría usarse / Other healthcare systems where it could be used:**
- Sistema de gestión hospitalaria (HIS) — Hospital Information System (HIS)
- Portal de telemedicina — Telemedicine portal
- Sistema de farmacia con registro de clientes — Pharmacy system with customer records

---

## Componente 2 — AppointmentService (backend)

**Tipo / Type:** Servicio de dominio — Domain service  
**Ubicación / Location:** `backend/appointments/appointmentService.js`

### Problema que resuelve — Problem it solves

La gestión de citas requiere lógica compleja: verificación de conflictos de horario, transición de estados y vinculación con recordatorios. Sin un servicio dedicado, esta lógica se repite en cada punto de la aplicación que necesita crear o modificar una cita.

Appointment management requires complex logic: time conflict verification, state transitions, and linking with reminders. Without a dedicated service, this logic is repeated at every application point that needs to create or modify an appointment.

### Métodos principales — Main methods

| Método / Method | Descripción / Description |
|---|---|
| `createAppointment(data)` | Crea una nueva cita médica — Creates a new medical appointment |
| `cancelAppointment(id)` | Cancela una cita y actualiza su estado — Cancels an appointment and updates its status |
| `markAsAttended(id)` | Marca la cita como atendida — Marks the appointment as attended |
| `listByDate(date)` | Lista todas las citas de una fecha — Lists all appointments for a date |
| `checkTimeConflict(date, duration)` | Verifica colisión de horarios — Checks for time slot collision |

### Reutilizabilidad en SPL — SPL Reusability

El ciclo de vida de una cita (agendada → atendida/cancelada) es idéntico en todas las especialidades médicas. `checkTimeConflict` es especialmente valioso en fisioterapia (citas recurrentes semanales) y odontología (sesiones múltiples).

The appointment lifecycle (scheduled → attended/cancelled) is identical across all medical specialties. `checkTimeConflict` is especially valuable in physiotherapy (weekly recurring appointments) and dentistry (multiple sessions).

**Otros sistemas del sector salud / Other healthcare systems:**
- Agendamiento quirúrgico — Surgical scheduling
- Reserva de equipos médicos (resonancias, ecografías) — Medical equipment booking (MRI, ultrasound)

---

## Componente 3 — MedicalRecordService (backend)

**Tipo / Type:** Servicio de dominio — Domain service  
**Ubicación / Location:** `backend/records/recordService.js`

### Problema que resuelve — Problem it solves

El historial clínico requiere integridad temporal: las entradas nunca se eliminan, siempre se agregan, y deben presentarse en orden cronológico. Sin un servicio dedicado, la lógica de ordenamiento y creación de entradas estaría duplicada en múltiples módulos.

Medical records require temporal integrity: entries are never deleted, always appended, and must be presented in chronological order. Without a dedicated service, sorting and entry creation logic would be duplicated across multiple modules.

### Métodos principales — Main methods

| Método / Method | Descripción / Description |
|---|---|
| `createEntry(patientId, entryData)` | Agrega una entrada al historial del paciente — Appends an entry to the patient's history |
| `getPatientHistory(patientId)` | Recupera el historial completo del paciente — Retrieves the patient's complete history |
| `sortByDate(entries)` | Ordena entradas por fecha descendente — Sorts entries by descending date |

### Reutilizabilidad en SPL — SPL Reusability

Las notas clínicas son universales. En psicología, `createEntry` almacena notas de sesión. En fisioterapia, almacena evaluaciones de evolución motora. El formato de entrada puede variarse sin cambiar la interfaz del servicio.

Clinical notes are universal. In psychology, `createEntry` stores session notes. In physiotherapy, it stores motor evolution evaluations. The entry format can vary without changing the service interface.

**Otros sistemas del sector salud / Other healthcare systems:**
- Sistema de historia clínica electrónica (HCE) — Electronic Health Record (EHR) system
- Plataforma de seguimiento oncológico — Oncology follow-up platform

---

## Componente 4 — ReminderService (backend)

**Tipo / Type:** Servicio de dominio — Domain service  
**Ubicación / Location:** `backend/reminders/reminderService.js`

### Problema que resuelve — Problem it solves

Sin este servicio, la lógica de cuándo y cómo enviar recordatorios estaría acoplada al módulo de citas. ReminderService aísla esta responsabilidad y usa la constante `HOURS_BEFORE_REMINDER` en lugar de valores literales, evitando el antipatrón "número mágico".

Without this service, the logic of when and how to send reminders would be coupled to the appointment module. ReminderService isolates this responsibility and uses the `HOURS_BEFORE_REMINDER` constant instead of literal values, avoiding the "magic number" anti-pattern.

### Métodos principales — Main methods

| Método / Method | Descripción / Description |
|---|---|
| `createReminderForAppointment(appointmentId)` | Crea un recordatorio vinculado a una cita — Creates a reminder linked to an appointment |
| `calculateReminderDate(appointmentDate)` | Calcula la fecha de envío (cita − 24h) — Calculates send date (appointment − 24h) |
| `generateMessage(patientName, date)` | Genera el texto del recordatorio — Generates the reminder text |
| `markAsSent(reminderId)` | Marca el recordatorio como enviado — Marks the reminder as sent |
| `listPending()` | Lista recordatorios pendientes de envío — Lists pending reminders |

### Reutilizabilidad en SPL — SPL Reusability

`HOURS_BEFORE_REMINDER` puede configurarse a 48h para psicología (sesiones de mayor compromiso) o a 2h para urgencias odontológicas. El servicio no cambia; solo cambia la constante.

`HOURS_BEFORE_REMINDER` can be configured to 48h for psychology (higher-commitment sessions) or 2h for dental emergencies. The service does not change; only the constant changes.

**Otros sistemas del sector salud / Other healthcare systems:**
- Sistema de notificaciones de vacunación — Vaccination notification system
- Plataforma de seguimiento de medicación — Medication adherence tracking platform

---

## Componente 5 — StatusBadge (React component)

**Tipo / Type:** Componente React presentacional — Presentational React component  
**Ubicación / Location:** `frontend/src/components/StatusBadge.jsx`

### Problema que resuelve — Problem it solves

Sin este componente, cada página del CRM implementaría su propia lógica de colores y etiquetas para mostrar el estado de citas, recordatorios y pacientes. Esto genera inconsistencia visual y duplicación de código de presentación.

Without this component, each CRM page would implement its own color and label logic to display appointment, reminder, and patient statuses. This generates visual inconsistency and presentation code duplication.

### Props — Props

| Prop | Tipo / Type | Descripción / Description |
|---|---|---|
| `status` | `string` | Estado del registro (ej. `'scheduled'`) — Record status (e.g., `'scheduled'`) |
| `type` | `'appointment' \| 'reminder' \| 'patient'` | Tipo de entidad para elegir el mapa de estilos — Entity type to select the style map |

### Reutilizabilidad en SPL — SPL Reusability

Para extender a una nueva especialidad solo se agrega una entrada al objeto `STYLES` y `LABELS`. El componente mismo no se modifica. Esto es el principio Abierto/Cerrado (Open/Closed Principle) aplicado.

To extend to a new specialty, only an entry is added to the `STYLES` and `LABELS` objects. The component itself is not modified. This is the Open/Closed Principle applied.

**Otros sistemas del sector salud / Other healthcare systems:**
- Cualquier interfaz clínica que necesite representar estados de forma consistente — Any clinical interface needing consistent status representation

---

## Componente 6 — usePatients (custom hook)

**Tipo / Type:** Hook personalizado de React — React custom hook  
**Ubicación / Location:** `frontend/src/hooks/usePatients.js`

### Problema que resuelve — Problem it solves

Sin este hook, cada página que necesite listar o gestionar pacientes duplicaría la lógica de llamadas a la API, manejo de estados de carga y captura de errores. El hook extrae esta lógica en una unidad reutilizable (refactorización Extract Custom Hook).

Without this hook, every page needing to list or manage patients would duplicate API call logic, loading state management, and error handling. The hook extracts this logic into a reusable unit (Extract Custom Hook refactoring).

### Interfaz del hook — Hook interface

```js
const { patients, loading, error, createPatient, updatePatient, searchPatients } = usePatients();
```

| Valor / Value | Tipo / Type | Descripción / Description |
|---|---|---|
| `patients` | `Array` | Lista de pacientes cargados — Loaded patient list |
| `loading` | `boolean` | Verdadero mientras carga — True while loading |
| `error` | `Error \| null` | Error capturado o null — Captured error or null |
| `createPatient(data)` | `Function` | Crea paciente y actualiza estado — Creates patient and updates state |
| `updatePatient(id, data)` | `Function` | Actualiza paciente y refresca lista — Updates patient and refreshes list |
| `searchPatients(query)` | `Function` | Busca y filtra la lista — Searches and filters the list |

### Reutilizabilidad en SPL — SPL Reusability

El hook puede ser importado por cualquier página del CRM que necesite datos de pacientes. En variantes de la SPL, solo cambia el servicio subyacente; la interfaz del hook permanece idéntica.

The hook can be imported by any CRM page that needs patient data. In SPL variants, only the underlying service changes; the hook interface remains identical.

---

## Componente 7 — useAppointments (custom hook)

**Tipo / Type:** Hook personalizado de React — React custom hook  
**Ubicación / Location:** `frontend/src/hooks/useAppointments.js`

### Problema que resuelve — Problem it solves

La gestión de citas implica múltiples operaciones de estado (crear, cancelar, filtrar) que, sin un hook dedicado, contaminarían los componentes de vista con lógica que no les corresponde, violando el principio de separación de responsabilidades.

Appointment management involves multiple state operations (create, cancel, filter) that, without a dedicated hook, would contaminate view components with logic that doesn't belong there, violating the separation of concerns principle.

### Interfaz del hook — Hook interface

```js
const { appointments, loading, error, createAppointment, cancelAppointment, filterByDate } = useAppointments();
```

| Valor / Value | Tipo / Type | Descripción / Description |
|---|---|---|
| `appointments` | `Array` | Lista de citas cargadas — Loaded appointment list |
| `loading` | `boolean` | Verdadero mientras carga — True while loading |
| `error` | `Error \| null` | Error capturado o null — Captured error or null |
| `createAppointment(data)` | `Function` | Crea cita y actualiza estado — Creates appointment and updates state |
| `cancelAppointment(id)` | `Function` | Cancela cita y refresca lista — Cancels appointment and refreshes list |
| `filterByDate(date)` | `Function` | Filtra citas por fecha — Filters appointments by date |

### Reutilizabilidad en SPL — SPL Reusability

En fisioterapia (citas recurrentes) o psicología (sesiones con duración fija diferente), solo se modifica `appointmentService.js`. El hook `useAppointments` y todos los componentes que lo consumen no requieren cambios.

In physiotherapy (recurring appointments) or psychology (sessions with different fixed duration), only `appointmentService.js` is modified. The `useAppointments` hook and all components consuming it require no changes.

**Otros sistemas del sector salud / Other healthcare systems:**
- Sistema de gestión de turnos de guardia — On-call shift management system
- Agendamiento de salas quirúrgicas — Surgical room scheduling
