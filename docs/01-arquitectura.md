# Arquitectura del Sistema — System Architecture

## Patrón Arquitectónico: Arquitectura Modular por Dominio

El sistema MedIL CRM adopta el patrón de **Arquitectura Modular por Dominio** (también conocido como Domain-Driven Modular Architecture). En este patrón, el código se organiza alrededor de los conceptos del negocio (dominios) en lugar de capas técnicas horizontales.

### Justificación

En un CRM médico, los dominios naturales del negocio son: Pacientes, Citas, Historial Clínico y Recordatorios. Cada dominio tiene:

- **Alta cohesión interna:** toda la lógica de un dominio vive junta (service + repository).
- **Bajo acoplamiento externo:** los dominios se comunican únicamente a través de interfaces definidas (los servicios), nunca accediendo directamente a la base de datos del otro.
- **Reutilización en SPL:** al ser módulos independientes, pueden trasplantarse a una variante del CRM (odontología, psicología) sin arrastrar dependencias no deseadas.

---

## Architectural Pattern: Domain-Driven Modular Architecture

The MedIL CRM system adopts the **Domain-Driven Modular Architecture** pattern. In this pattern, code is organized around business concepts (domains) rather than horizontal technical layers.

### Justification

In a medical CRM, the natural business domains are: Patients, Appointments, Medical Records, and Reminders. Each domain has:

- **High internal cohesion:** all logic for a domain lives together (service + repository).
- **Low external coupling:** domains communicate only through defined interfaces (the services), never accessing another domain's database directly.
- **SPL reusability:** being independent modules, they can be transplanted to a CRM variant (dentistry, psychology) without dragging unwanted dependencies.

---

## Diagrama 1: Arquitectura Completa — Diagram 1: Complete Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend — React 18 + Vite"]
        PAGES["Páginas / Pages<br/>Dashboard · Patients · Appointments<br/>Reminders · PatientDetail"]
        HOOKS["Custom Hooks<br/>usePatients · useAppointments"]
        COMP["Componentes / Components<br/>StatusBadge"]
        SVCF["Servicios Frontend / Frontend Services<br/>patientService · appointmentService<br/>recordService · reminderService"]
        CONST["Utilidades Compartidas / Shared Utilities<br/>constants · validators · dateUtils"]
    end

    subgraph Backend["Backend — InsForge"]
        subgraph DOM_PAT["Dominio Pacientes / Patient Domain"]
            SVC_PAT["PatientService"]
            REPO_PAT[("InsForge DB\nPatients")]
        end
        subgraph DOM_APT["Dominio Citas / Appointment Domain"]
            SVC_APT["AppointmentService"]
            REPO_APT[("InsForge DB\nAppointments")]
        end
        subgraph DOM_REC["Dominio Historial / Record Domain"]
            SVC_REC["MedicalRecordService"]
            REPO_REC[("InsForge DB\nRecords")]
        end
        subgraph DOM_REM["Dominio Recordatorios / Reminder Domain"]
            SVC_REM["ReminderService"]
            REPO_REM[("InsForge DB\nReminders")]
        end
    end

    PAGES --> HOOKS
    PAGES --> COMP
    HOOKS --> SVCF
    SVCF --> SVC_PAT
    SVCF --> SVC_APT
    SVCF --> SVC_REC
    SVCF --> SVC_REM
    SVC_PAT --> REPO_PAT
    SVC_APT --> REPO_APT
    SVC_REC --> REPO_REC
    SVC_REM --> REPO_REM
    CONST -.->|usa / uses| SVC_REM
```

---

## Diagrama 2: Flujo Principal del MVP — Diagram 2: Main MVP Flow

```mermaid
sequenceDiagram
    actor Operator as Operador / Operator
    participant UI as React UI
    participant PatSvc as PatientService
    participant AptSvc as AppointmentService
    participant RemSvc as ReminderService
    participant RecSvc as MedicalRecordService
    participant DB as InsForge DB

    Operator->>UI: 1. Ingresa datos del paciente / Enter patient data
    UI->>PatSvc: createPatient(data)
    PatSvc->>DB: INSERT patient
    DB-->>PatSvc: patient record
    PatSvc-->>UI: patient created

    Operator->>UI: 2. Busca paciente / Search patient
    UI->>PatSvc: searchPatients(query)
    PatSvc->>DB: QUERY patients
    DB-->>UI: results

    Operator->>UI: 3. Crea cita / Create appointment
    UI->>AptSvc: createAppointment(data)
    AptSvc->>AptSvc: 4. checkTimeConflict()
    AptSvc->>DB: INSERT appointment
    DB-->>AptSvc: appointment record

    AptSvc->>RemSvc: 5. createReminderForAppointment(id)
    RemSvc->>RemSvc: calculateReminderDate(date)
    RemSvc->>DB: INSERT reminder (24h before)
    DB-->>UI: appointment + reminder created

    Operator->>UI: 6. Registra historial / Record medical history
    UI->>RecSvc: createEntry(patientId, entry)
    RecSvc->>DB: INSERT medical_record
    DB-->>UI: entry saved

    Operator->>UI: 7. Actualiza estado de cita / Update appointment status
    UI->>AptSvc: markAsAttended(id)
    AptSvc->>DB: UPDATE appointment status
    DB-->>UI: status = attended
```

---

## Reutilización en la Línea de Producto de Software

La arquitectura modular por dominio habilita la reutilización en la SPL porque:

1. **Cada dominio es un módulo cerrado:** tiene su propio servicio y repositorio. Reemplazar o extender un dominio no afecta a los demás.
2. **Las constantes son configurables:** cambiar `HOURS_BEFORE_REMINDER` en `constants.js` adapta el comportamiento del sistema para una especialidad distinta sin tocar lógica.
3. **Los componentes React son genéricos por diseño:** `StatusBadge` acepta cualquier tipo de estado (`appointment`, `reminder`, `patient`) y puede extenderse con nuevos tipos para nuevas especialidades.
4. **La capa de servicios frontend es intercambiable:** si una variante del CRM necesita un endpoint diferente de InsForge, solo se modifica `*Service.js`, no los hooks ni las páginas.

---

## Reuse in the Software Product Line

The domain-driven modular architecture enables reuse in the SPL because:

1. **Each domain is a closed module:** it has its own service and repository. Replacing or extending a domain does not affect the others.
2. **Constants are configurable:** changing `HOURS_BEFORE_REMINDER` in `constants.js` adapts system behavior for a different specialty without touching logic.
3. **React components are generic by design:** `StatusBadge` accepts any status type (`appointment`, `reminder`, `patient`) and can be extended with new types for new specialties.
4. **The frontend service layer is interchangeable:** if a CRM variant needs a different InsForge endpoint, only `*Service.js` is modified, not the hooks or pages.
