[![English](https://img.shields.io/badge/Language-English-0E4A8A?style=flat-square)](01-arquitectura.en.md)
[![README](https://img.shields.io/badge/←_Inicio-README-00A896?style=flat-square)](../README.es.md)
![Doc](https://img.shields.io/badge/doc-01%20de%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# 🏗️ Arquitectura del Sistema

*Patrón Modular por Dominio — Domain-Driven Modular Architecture*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![InsForge](https://img.shields.io/badge/Backend-InsForge-0E4A8A?style=flat-square)
![Mermaid](https://img.shields.io/badge/Diagramas-Mermaid-00A896?style=flat-square)

</div>

---

## Patrón Arquitectónico: Arquitectura Modular por Dominio

El sistema MedIL CRM adopta el patrón de **Arquitectura Modular por Dominio** (Domain-Driven Modular Architecture). En este patrón, el código se organiza alrededor de los conceptos del negocio (dominios) en lugar de capas técnicas horizontales.

### Justificación

En un CRM médico, los dominios naturales del negocio son: Pacientes, Citas, Historial Clínico y Recordatorios. Cada dominio tiene:

- **Alta cohesión interna:** toda la lógica de un dominio vive junta (service + repository).
- **Bajo acoplamiento externo:** los dominios se comunican únicamente a través de interfaces definidas (los servicios), nunca accediendo directamente a la base de datos del otro.
- **Reutilización en SPL:** al ser módulos independientes, pueden trasplantarse a una variante del CRM (odontología, psicología) sin arrastrar dependencias no deseadas.

---

## Diagrama 1: Arquitectura Completa

<div align="center">

<img src="assets/diagrama-es.png" alt="Arquitectura MediL CRM" width="100%"/>

</div>

<details>
<summary>🔧 Ver diagrama técnico (Mermaid)</summary>

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

## Diagrama 2: Flujo Principal del MVP

<div align="center">

<img src="assets/secuencia-es.png" alt="Diagrama de Secuencia MVP" width="100%"/>

</div>

<details>
<summary>🔧 Ver diagrama técnico (Mermaid)</summary>

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

</details>

---

## Reutilización en la Línea de Producto de Software

La arquitectura modular por dominio habilita la reutilización en la SPL porque:

| Principio | Cómo se aplica |
|:---|:---|
| **Módulo cerrado** | Cada dominio tiene su propio servicio y repositorio; reemplazarlo no afecta a los demás |
| **Constantes configurables** | `HOURS_BEFORE_REMINDER` adapta el sistema a cualquier especialidad sin tocar lógica |
| **Componentes genéricos** | `StatusBadge` acepta cualquier estado y se extiende sin modificar el componente (OCP) |
| **Servicios intercambiables** | Cambiar el endpoint InsForge solo requiere modificar `*Service.js`, no los hooks ni páginas |

---

## Autenticación y Roles | Authentication and Roles

El sistema implementa **RBAC (Role-Based Access Control)** con tres roles: `admin`, `doctor`, `patient`. La autenticación usa `AuthContext` + `ProtectedRoute`.

The system implements **RBAC (Role-Based Access Control)** with three roles: `admin`, `doctor`, `patient`. Authentication uses `AuthContext` + `ProtectedRoute`.

<details>
<summary>🔧 Ver diagrama de autenticación (Mermaid)</summary>

```mermaid
sequenceDiagram
    actor U as Usuario — User
    participant LP as Login Page
    participant AC as AuthContext
    participant AS as authService
    participant PR as ProtectedRoute
    participant PG as Page

    U->>LP: Ingresa credenciales — Enter credentials
    LP->>AC: login(email, password)
    AC->>AS: login(email, password)
    AS->>AS: db.collection('users').where(email).find()
    AS-->>AC: { user, token }
    AC->>AC: setUser(user) — localStorage.setItem(token)
    AC-->>LP: user (con role)
    LP->>LP: navigate según role — navigate by role

    U->>PR: Accede a ruta protegida — Access protected route
    PR->>AC: useAuth()
    AC-->>PR: { isAuthenticated, hasRole }
    alt No autenticado — Not authenticated
        PR-->>U: <Navigate to="/login" />
    else Rol no permitido — Role not allowed
        PR-->>U: Página 403 inline
    else Autorizado — Authorized
        PR->>PG: Renderiza hijos — Render children
    end
```

</details>

### Rutas por Rol | Routes by Role

| Ruta — Route | Admin | Doctor | Patient |
|:---|:---:|:---:|:---:|
| `/` Dashboard | ✓ | ✓ | — |
| `/patients` | ✓ | ✓ | — |
| `/appointments` | ✓ | ✓ | — |
| `/reminders` | ✓ | ✓ | — |
| `/admin/branches` | ✓ | — | — |
| `/admin/billing` | ✓ | — | — |
| `/admin/supplies` | ✓ | — | — |
| `/doctor/console` | — | ✓ | — |
| `/patient/portal` | — | — | ✓ |

---

## Adapter Pattern para Pagos | Adapter Pattern for Payments

El patrón **Adapter** desacopla el código de negocio del proveedor de pagos QR concreto. Cambiar de PagoFácil a otro proveedor requiere solo un nuevo adaptador.

The **Adapter** pattern decouples business code from the concrete QR payment provider. Switching from PagoFácil to another provider requires only a new adapter.

<details>
<summary>🔧 Ver diagrama del Adapter Pattern (Mermaid)</summary>

```mermaid
classDiagram
    class IPaymentAdapter {
        <<interface>>
        +generateQR(data) Promise
        +checkPaymentStatus(transactionId) Promise
    }

    class SimulatedQRAdapter {
        +generateQR(data) Promise~qrCode, transactionId~
        +checkPaymentStatus(transactionId) Promise~status~
    }

    class PagoFacilAdapter {
        -apiUrl: string
        -apiKey: string
        +generateQR(data) Promise~qrCode, transactionId~
        +checkPaymentStatus(transactionId) Promise~status~
    }

    class BillingService {
        -adapter: IPaymentAdapter
        +calculateTotal(amount) object
        +generatePaymentQR(data) Promise
        +checkPaymentStatus(transactionId) Promise
    }

    IPaymentAdapter <|-- SimulatedQRAdapter : implements
    IPaymentAdapter <|-- PagoFacilAdapter : implements
    BillingService --> IPaymentAdapter : uses
    BillingService ..> SimulatedQRAdapter : dev
    BillingService ..> PagoFacilAdapter : prod
```

</details>

---

<div align="center">

[🧩 Siguiente: Componentes →](02-componentes.md) &nbsp;|&nbsp; [← Volver al README](../README.es.md)

</div>
