[![Español](https://img.shields.io/badge/Idioma-Español-00A896?style=flat-square)](01-arquitectura.md)
[![README](https://img.shields.io/badge/←_Home-README-0E4A8A?style=flat-square)](../README.md)
![Doc](https://img.shields.io/badge/doc-01%20of%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# 🏗️ System Architecture

*Domain-Driven Modular Architecture*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![InsForge](https://img.shields.io/badge/Backend-InsForge-0E4A8A?style=flat-square)
![Mermaid](https://img.shields.io/badge/Diagrams-Mermaid-00A896?style=flat-square)

</div>

---

## Architectural Pattern: Domain-Driven Modular Architecture

The MediL CRM system adopts the **Domain-Driven Modular Architecture** pattern. In this pattern, code is organized around business concepts (domains) rather than horizontal technical layers.

### Justification

In a medical CRM, the natural business domains are: Patients, Appointments, Medical Records, and Reminders. Each domain has:

- **High internal cohesion:** all logic for a domain lives together (service + repository).
- **Low external coupling:** domains communicate only through defined interfaces (the services), never accessing another domain's database directly.
- **SPL reusability:** being independent modules, they can be transplanted to a CRM variant (dentistry, psychology) without dragging unwanted dependencies.

---

## Diagram 1: Complete Architecture

<div align="center">

<img src="assets/diagrama-en.png" alt="MediL CRM Architecture" width="100%"/>

</div>

<details>
<summary>🔧 View technical diagram (Mermaid)</summary>

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#d6e8f7', 'primaryBorderColor': '#0E4A8A', 'lineColor': '#00A896', 'fontSize': '14px'}}}%%
graph LR
    classDef page  fill:#d6e8f7,stroke:#0E4A8A,stroke-width:2px,color:#0E4A8A
    classDef hook  fill:#b3e0db,stroke:#00A896,stroke-width:2px,color:#0E4A8A
    classDef svc   fill:#00A896,stroke:#007a6e,stroke-width:2px,color:#fff
    classDef db    fill:#0E4A8A,stroke:#092f5c,stroke-width:2px,color:#fff
    classDef util  fill:#fff9d6,stroke:#FFD100,stroke-width:2px,stroke-dasharray:5,color:#0E4A8A

    subgraph FE["⚛️  Frontend — React 18 + Vite"]
        PAGES[Pages]
        HOOKS[Custom Hooks]
        COMP[StatusBadge]
        SVCF[Frontend Services]
        CONST[Shared Utils]
    end

    subgraph BE["🗄️  Backend — InsForge"]
        SVC_PAT[PatientService]
        DB_PAT[(Patients)]
        SVC_APT[AppointmentService]
        DB_APT[(Appointments)]
        SVC_REC[MedicalRecordService]
        DB_REC[(Records)]
        SVC_REM[ReminderService]
        DB_REM[(Reminders)]
    end

    PAGES --> HOOKS
    PAGES --> COMP
    HOOKS --> SVCF
    SVCF --> SVC_PAT --> DB_PAT
    SVCF --> SVC_APT --> DB_APT
    SVCF --> SVC_REC --> DB_REC
    SVCF --> SVC_REM --> DB_REM
    CONST -.-> SVC_REM

    class PAGES,COMP page
    class HOOKS hook
    class SVCF,SVC_PAT,SVC_APT,SVC_REC,SVC_REM svc
    class DB_PAT,DB_APT,DB_REC,DB_REM db
    class CONST util

    style FE fill:#edf4fb,stroke:#0E4A8A,stroke-width:2px
    style BE fill:#e6f5f3,stroke:#00A896,stroke-width:2px
```

> **Pages:** Dashboard · Patients · Appointments · Reminders · PatientDetail  
> **Custom Hooks:** usePatients · useAppointments  
> **Frontend Services:** patientSvc · appointmentSvc · recordSvc · reminderSvc  
> **Shared Utils:** constants · validators · dateUtils

</details>

---

## Diagram 2: Main MVP Flow

<div align="center">

<img src="assets/secuencia-en.png" alt="MVP Sequence Diagram" width="100%"/>

</div>

<details>
<summary>🔧 View technical diagram (Mermaid)</summary>

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'actorBkg': '#0E4A8A', 'actorBorder': '#092f5c', 'actorTextColor': '#ffffff', 'actorLineColor': '#00A896', 'signalColor': '#00A896', 'signalTextColor': '#0E4A8A', 'labelBoxBkgColor': '#d6e8f7', 'labelBoxBorderColor': '#0E4A8A', 'labelTextColor': '#0E4A8A', 'noteBkgColor': '#fff9d6', 'noteBorderColor': '#FFD100'}}}%%
sequenceDiagram
    actor Op as Operator
    participant UI as React UI
    participant PatSvc as PatientService
    participant AptSvc as AppointmentService
    participant RemSvc as ReminderService
    participant RecSvc as RecordService
    participant DB as InsForge DB

    Op->>UI: 1. Enter patient data
    UI->>PatSvc: createPatient(data)
    PatSvc->>DB: INSERT patient
    DB-->>PatSvc: patient record
    PatSvc-->>UI: patient created

    Op->>UI: 2. Search patient
    UI->>PatSvc: searchPatients(query)
    PatSvc->>DB: QUERY patients
    DB-->>UI: results

    Op->>UI: 3. Create appointment
    UI->>AptSvc: createAppointment(data)
    AptSvc->>AptSvc: 4. checkTimeConflict()
    AptSvc->>DB: INSERT appointment
    DB-->>AptSvc: appointment record

    AptSvc->>RemSvc: 5. createReminderForAppointment(id)
    RemSvc->>RemSvc: calculateReminderDate(date)
    RemSvc->>DB: INSERT reminder (24h before)
    DB-->>UI: appointment + reminder created

    Op->>UI: 6. Record medical history
    UI->>RecSvc: createEntry(patientId, entry)
    RecSvc->>DB: INSERT medical_record
    DB-->>UI: entry saved

    Op->>UI: 7. Update appointment status
    UI->>AptSvc: markAsAttended(id)
    AptSvc->>DB: UPDATE appointment status
    DB-->>UI: status = attended
```

</details>

---

## Reuse in the Software Product Line

The domain-driven modular architecture enables reuse in the SPL because:

| Principle | How it is applied |
|:---|:---|
| **Closed module** | Each domain has its own service and repository; replacing one does not affect the others |
| **Configurable constants** | `HOURS_BEFORE_REMINDER` adapts the system to any specialty without touching logic |
| **Generic components** | `StatusBadge` accepts any status type and extends without modifying the component (OCP) |
| **Interchangeable services** | Changing the InsForge endpoint only requires modifying `*Service.js`, not hooks or pages |

---

<div align="center">

[🧩 Next: Components →](02-componentes.en.md) &nbsp;|&nbsp; [← Back to README](../README.md)

</div>
