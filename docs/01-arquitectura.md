# Arquitectura del Sistema / System Architecture

<details open>
<summary>🇪🇸 Español — clic para colapsar</summary>

## Patrón Arquitectónico: Arquitectura Modular por Dominio

El sistema MedIL CRM adopta el patrón de **Arquitectura Modular por Dominio** (también conocido como Domain-Driven Modular Architecture). En este patrón, el código se organiza alrededor de los conceptos del negocio (dominios) en lugar de capas técnicas horizontales.

### Justificación

En un CRM médico, los dominios naturales del negocio son: Pacientes, Citas, Historial Clínico y Recordatorios. Cada dominio tiene:

- **Alta cohesión interna:** toda la lógica de un dominio vive junta (service + repository).
- **Bajo acoplamiento externo:** los dominios se comunican únicamente a través de interfaces definidas (los servicios), nunca accediendo directamente a la base de datos del otro.
- **Reutilización en SPL:** al ser módulos independientes, pueden trasplantarse a una variante del CRM (odontología, psicología) sin arrastrar dependencias no deseadas.

---

### Diagrama 1: Arquitectura Completa

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

---

### Diagrama 2: Flujo Principal del MVP

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'actorBkg': '#0E4A8A', 'actorBorder': '#092f5c', 'actorTextColor': '#ffffff', 'actorLineColor': '#00A896', 'signalColor': '#00A896', 'signalTextColor': '#0E4A8A', 'labelBoxBkgColor': '#d6e8f7', 'labelBoxBorderColor': '#0E4A8A', 'labelTextColor': '#0E4A8A', 'noteBkgColor': '#fff9d6', 'noteBorderColor': '#FFD100'}}}%%
sequenceDiagram
    actor Op as Operador
    participant UI as React UI
    participant PatSvc as PatientService
    participant AptSvc as AppointmentService
    participant RemSvc as ReminderService
    participant RecSvc as RecordService
    participant DB as InsForge DB

    Op->>UI: 1. Ingresa datos del paciente
    UI->>PatSvc: createPatient(data)
    PatSvc->>DB: INSERT patient
    DB-->>PatSvc: registro del paciente
    PatSvc-->>UI: paciente creado

    Op->>UI: 2. Busca paciente
    UI->>PatSvc: searchPatients(query)
    PatSvc->>DB: QUERY patients
    DB-->>UI: resultados

    Op->>UI: 3. Crea cita médica
    UI->>AptSvc: createAppointment(data)
    AptSvc->>AptSvc: 4. checkTimeConflict()
    AptSvc->>DB: INSERT appointment
    DB-->>AptSvc: registro de cita

    AptSvc->>RemSvc: 5. createReminderForAppointment(id)
    RemSvc->>RemSvc: calculateReminderDate(date)
    RemSvc->>DB: INSERT reminder (24h antes)
    DB-->>UI: cita + recordatorio creados

    Op->>UI: 6. Registra historial clínico
    UI->>RecSvc: createEntry(patientId, entry)
    RecSvc->>DB: INSERT medical_record
    DB-->>UI: entrada guardada

    Op->>UI: 7. Actualiza estado de cita
    UI->>AptSvc: markAsAttended(id)
    AptSvc->>DB: UPDATE appointment status
    DB-->>UI: status = attended
```

---

### Reutilización en la Línea de Producto de Software

La arquitectura modular por dominio habilita la reutilización en la SPL porque:

1. **Cada dominio es un módulo cerrado:** tiene su propio servicio y repositorio. Reemplazar o extender un dominio no afecta a los demás.
2. **Las constantes son configurables:** cambiar `HOURS_BEFORE_REMINDER` en `constants.js` adapta el comportamiento del sistema para una especialidad distinta sin tocar lógica.
3. **Los componentes React son genéricos por diseño:** `StatusBadge` acepta cualquier tipo de estado (`appointment`, `reminder`, `patient`) y puede extenderse con nuevos tipos para nuevas especialidades.
4. **La capa de servicios frontend es intercambiable:** si una variante del CRM necesita un endpoint diferente de InsForge, solo se modifica `*Service.js`, no los hooks ni las páginas.

</details>

---

<details>
<summary>🇬🇧 English — click to expand</summary>

## Architectural Pattern: Domain-Driven Modular Architecture

The MedIL CRM system adopts the **Domain-Driven Modular Architecture** pattern. In this pattern, code is organized around business concepts (domains) rather than horizontal technical layers.

### Justification

In a medical CRM, the natural business domains are: Patients, Appointments, Medical Records, and Reminders. Each domain has:

- **High internal cohesion:** all logic for a domain lives together (service + repository).
- **Low external coupling:** domains communicate only through defined interfaces (the services), never accessing another domain's database directly.
- **SPL reusability:** being independent modules, they can be transplanted to a CRM variant (dentistry, psychology) without dragging unwanted dependencies.

---

### Diagram 1: Complete Architecture

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

---

### Diagram 2: Main MVP Flow

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

---

### Reuse in the Software Product Line

The domain-driven modular architecture enables reuse in the SPL because:

1. **Each domain is a closed module:** it has its own service and repository. Replacing or extending a domain does not affect the others.
2. **Constants are configurable:** changing `HOURS_BEFORE_REMINDER` in `constants.js` adapts system behavior for a different specialty without touching logic.
3. **React components are generic by design:** `StatusBadge` accepts any status type (`appointment`, `reminder`, `patient`) and can be extended with new types for new specialties.
4. **The frontend service layer is interchangeable:** if a CRM variant needs a different InsForge endpoint, only `*Service.js` is modified, not the hooks or pages.

</details>
