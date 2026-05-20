[![Español](https://img.shields.io/badge/Idioma-Español-00A896?style=flat-square)](02-componentes.md)
[![README](https://img.shields.io/badge/←_Home-README-0E4A8A?style=flat-square)](../README.md)
![Doc](https://img.shields.io/badge/doc-02%20of%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# 🧩 Reusable Component Catalog

*7 components · High cohesion · Low coupling · SPL reusable*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![InsForge](https://img.shields.io/badge/Backend-InsForge-0E4A8A?style=flat-square)
![SPL](https://img.shields.io/badge/Pattern-SPL-00A896?style=flat-square)

</div>

---

This document describes the 7 reusable components of the MediL CRM system, their role in the architecture, their main methods, and why they are reusable within a software product line for the healthcare sector.

---

## Component 1 — PatientService

![Type](https://img.shields.io/badge/Type-Domain_Service-0E4A8A?style=flat-square)
![Location](https://img.shields.io/badge/backend/patients/patientService.js-grey?style=flat-square&logo=files)

### Problem it solves

Without this service, patient business logic would be scattered across multiple controllers or directly in backend routes, generating duplication and coupling. PatientService centralizes all logic related to the patient lifecycle in a single cohesive module.

### Main methods

| Method | Description |
|:---|:---|
| `createPatient(patientData)` | Creates and persists a new patient record |
| `updatePatient(id, patientData)` | Updates data of an existing patient |
| `getPatientById(id)` | Retrieves a patient by unique ID |
| `searchPatients(query)` | Searches patients by name or other criteria |
| `validatePatientData(patientData)` | Validates data integrity before persisting |

### SPL Reusability

The concept of "registered patient" is common to all medical specialties. Only `validatePatientData` would require extension for specialty-specific fields.

<details>
<summary>🏥 Other healthcare systems where it could be used</summary>

- Hospital Information System (HIS)
- Telemedicine portal
- Pharmacy system with customer records

</details>

---

## Component 2 — AppointmentService

![Type](https://img.shields.io/badge/Type-Domain_Service-0E4A8A?style=flat-square)
![Location](https://img.shields.io/badge/backend/appointments/appointmentService.js-grey?style=flat-square&logo=files)

### Problem it solves

Appointment management requires complex logic: time conflict verification, state transitions, and linking with reminders. Without a dedicated service, this logic is repeated at every application point.

### Main methods

| Method | Description |
|:---|:---|
| `createAppointment(data)` | Creates a new medical appointment |
| `cancelAppointment(id)` | Cancels an appointment and updates its status |
| `markAsAttended(id)` | Marks the appointment as attended |
| `listByDate(date)` | Lists all appointments for a date |
| `checkTimeConflict(date, duration)` | Checks for time slot collision |

### SPL Reusability

The lifecycle (scheduled → attended/cancelled) is identical across all specialties. `checkTimeConflict` is especially valuable in physiotherapy and dentistry.

<details>
<summary>🏥 Other healthcare systems</summary>

- Surgical scheduling
- Medical equipment booking (MRI, ultrasound)

</details>

---

## Component 3 — MedicalRecordService

![Type](https://img.shields.io/badge/Type-Domain_Service-0E4A8A?style=flat-square)
![Location](https://img.shields.io/badge/backend/records/recordService.js-grey?style=flat-square&logo=files)

### Problem it solves

Medical records require temporal integrity: entries are never deleted, always appended, and must be presented in chronological order. Without a dedicated service, this logic would be duplicated across multiple modules.

### Main methods

| Method | Description |
|:---|:---|
| `createEntry(patientId, entryData)` | Appends an entry to the patient's history |
| `getPatientHistory(patientId)` | Retrieves the patient's complete history |
| `sortByDate(entries)` | Sorts entries by descending date |

### SPL Reusability

Clinical notes are universal. In psychology it stores session notes; in physiotherapy, motor evolution evaluations.

<details>
<summary>🏥 Other healthcare systems</summary>

- Electronic Health Record (EHR) system
- Oncology follow-up platform

</details>

---

## Component 4 — ReminderService

![Type](https://img.shields.io/badge/Type-Domain_Service-0E4A8A?style=flat-square)
![Location](https://img.shields.io/badge/backend/reminders/reminderService.js-grey?style=flat-square&logo=files)

### Problem it solves

Without this service, the logic of when to send reminders would be coupled to the appointment module. ReminderService isolates this responsibility and uses `HOURS_BEFORE_REMINDER` instead of literal values, avoiding the "magic number" anti-pattern.

### Main methods

| Method | Description |
|:---|:---|
| `createReminderForAppointment(appointmentId)` | Creates a reminder linked to an appointment |
| `calculateReminderDate(appointmentDate)` | Calculates send date (appointment − 24h) |
| `generateMessage(patientName, date)` | Generates the reminder text |
| `markAsSent(reminderId)` | Marks the reminder as sent |
| `listPending()` | Lists pending reminders |

### SPL Reusability

`HOURS_BEFORE_REMINDER` can be configured to 48h for psychology or 2h for dental emergencies. The service does not change; only the constant.

<details>
<summary>🏥 Other healthcare systems</summary>

- Vaccination notification system
- Medication adherence tracking platform

</details>

---

## Component 5 — StatusBadge

![Type](https://img.shields.io/badge/Type-React_Component-61DAFB?style=flat-square&logo=react&logoColor=black)
![Location](https://img.shields.io/badge/frontend/src/components/StatusBadge.jsx-grey?style=flat-square&logo=files)

### Problem it solves

Without this component, each CRM page would implement its own color and label logic to display statuses, generating visual inconsistency and presentation code duplication.

### Props

| Prop | Type | Description |
|:---|:---|:---|
| `status` | `string` | Record status (e.g., `'scheduled'`) |
| `type` | `'appointment' \| 'reminder' \| 'patient'` | Entity type to select the style map |

### SPL Reusability

To extend to a new specialty, only an entry is added to the `STYLES` and `LABELS` objects. The component itself is not modified — **Open/Closed Principle (OCP)** applied.

---

## Component 6 — usePatients

![Type](https://img.shields.io/badge/Type-Custom_Hook-61DAFB?style=flat-square&logo=react&logoColor=black)
![Location](https://img.shields.io/badge/frontend/src/hooks/usePatients.js-grey?style=flat-square&logo=files)

### Problem it solves

Without this hook, every page needing to manage patients would duplicate API call logic, loading state management, and error handling.

### Hook interface

```js
const { patients, loading, error, createPatient, updatePatient, searchPatients } = usePatients();
```

| Value | Type | Description |
|:---|:---|:---|
| `patients` | `Array` | Loaded patient list |
| `loading` | `boolean` | True while loading |
| `error` | `Error \| null` | Captured error or null |
| `createPatient(data)` | `Function` | Creates patient and updates state |
| `updatePatient(id, data)` | `Function` | Updates patient and refreshes list |
| `searchPatients(query)` | `Function` | Searches and filters the list |

### SPL Reusability

Importable by any CRM page that needs patient data. In SPL variants, only the underlying service changes; the hook interface remains identical.

---

## Component 7 — useAppointments

![Type](https://img.shields.io/badge/Type-Custom_Hook-61DAFB?style=flat-square&logo=react&logoColor=black)
![Location](https://img.shields.io/badge/frontend/src/hooks/useAppointments.js-grey?style=flat-square&logo=files)

### Problem it solves

Appointment management involves multiple state operations that, without a dedicated hook, would contaminate view components with logic that doesn't belong there, violating the separation of concerns principle.

### Hook interface

```js
const { appointments, loading, error, createAppointment, cancelAppointment, filterByDate } = useAppointments();
```

| Value | Type | Description |
|:---|:---|:---|
| `appointments` | `Array` | Loaded appointment list |
| `loading` | `boolean` | True while loading |
| `error` | `Error \| null` | Captured error or null |
| `createAppointment(data)` | `Function` | Creates appointment and updates state |
| `cancelAppointment(id)` | `Function` | Cancels appointment and refreshes list |
| `filterByDate(date)` | `Function` | Filters appointments by date |

### SPL Reusability

In physiotherapy or psychology, only `appointmentService.js` is modified. The hook and all components consuming it require no changes.

<details>
<summary>🏥 Other healthcare systems</summary>

- On-call shift management system
- Surgical room scheduling

</details>

---

<div align="center">

[← 🏗️ Architecture](01-arquitectura.en.md) &nbsp;|&nbsp; [♻️ Refactorings →](03-refactorizacion.en.md) &nbsp;|&nbsp; [← Back to README](../README.md)

</div>
