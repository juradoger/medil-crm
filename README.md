<div align="center">

<img src="docs/assets/logo.png" alt="MedIL CRM" width="260"/>

# MedIL — Sistema de Gestión Clínica CRM/ERP

**Gestión integral de clínicas médicas multisurcursal**  
*Modular · Escalable · Adaptable a múltiples especialidades de salud*

![Versión](https://img.shields.io/badge/versión-1.0.0-00B4D8?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-00B4D8?style=flat-square&logo=tailwindcss&logoColor=white)
![Estado](https://img.shields.io/badge/estado-en%20desarrollo-FFD100?style=flat-square&logoColor=black)

</div>

---

## Descripción

**MedIL CRM/ERP** es una aplicación web construida como **Línea de Producto de Software (SPL)** para el sector salud. Permite a clínicas médicas gestionar su operación completa desde una única plataforma — y puede adaptarse a distintas especialidades médicas sin reescribir la lógica central.

> **Contexto académico:** Ingeniería de Software II · SPL #2 — Sistemas de Gestión Empresarial  
> **Autora:** Ordoñez Choque Nayeli Zharit

---

## Stack tecnológico

| Capa | Tecnología | Rol en el sistema |
|:---|:---|:---|
| **Frontend** | React 19 + Vite 8 | UI basada en componentes con HMR para iteración rápida |
| **Estilos** | TailwindCSS v4 | Sistema de diseño con tokens centralizados vía `@theme` |
| **Ruteo** | React Router v7 | Navegación declarativa del lado del cliente por módulo |
| **Backend / BD** | InsForge SDK | Persistencia integrada detrás de una interfaz de servicios uniforme |
| **Testing** | Vitest + Testing Library | Tests unitarios e integración con cobertura por capa |
| **Deploy** | Vercel | Deploy automático en cada push a `main`, preview por PR |

---

## Arquitectura

El sistema implementa tres capas de arquitectura combinadas:

**Atomic Design (frontend)**
```
atoms/ → molecules/ → organisms/ → templates/ → pages/
```
Cada nivel solo importa del nivel inferior, garantizando cohesión y bajo acoplamiento.

**Clean Architecture (backend)**
```
domain/ (puro) ← usecases/ ← adapters/ ← infrastructure/ (InsForge)
```
InsForge vive únicamente en `adapters/` e `infrastructure/`. El dominio no conoce la BD.

**SPL (Línea de Producto de Software)**  
Constantes configurables por especialidad (`HOURS_BEFORE_REMINDER`, estados de citas, roles) permiten adaptar el sistema a odontología, fisioterapia, pediatría, etc., sin cambiar el núcleo.

---

## Módulos del sistema

| Módulo | Funcionalidad | Roles |
|:---|:---|:---|
| Pacientes | Registro, búsqueda y perfil completo | Admin, Doctor |
| Citas | Agendamiento con validación de conflictos | Admin, Doctor |
| Historial clínico | Entradas inmutables con política append-only | Doctor |
| Recordatorios | Notificaciones automáticas configurables (24 hs por defecto) | Admin, Doctor |
| Facturación | Pago QR con polleo automático y comisión 2% | Admin |
| Insumos | Control de stock con estados OK / bajo / crítico | Admin |
| Sucursales | Gestión multiclínica con aislamiento de datos por `branchId` | Admin |
| Portal paciente | Vista de citas e historial propio | Paciente |
| Consola médica | Agenda del día y registro de consultas | Doctor |

---

## Cómo correr el proyecto localmente

**Requisitos previos:** Node.js ≥ 18 · npm ≥ 9

```bash
# 1. Clonar el repositorio
git clone https://github.com/juradoger/medil-crm.git
cd medil-crm

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Completar VITE_INSFORGE_API_URL y VITE_INSFORGE_API_KEY

# 4. Levantar el servidor de desarrollo
npm run dev
# → http://localhost:5173

# 5. Correr los tests
npm run test
```

**Sembrar datos de prueba:**
```bash
# Desde la raíz del proyecto
node scripts/seed-insforge.js
# Crea: 1 sucursal, 1 admin, 1 doctor, 2 pacientes, 2 citas, 2 recordatorios
```

**Credenciales de prueba (tras ejecutar el seed):**
- Admin: `admin@medil.com` / `admin123`
- Doctor: `doctor@medil.com` / `doctor123`

---

## Estructura de carpetas

```
medil-crm/
├── .agent/              # Documentación técnica para agentes IA
├── backend/
│   ├── adapters/        # InsForgePatientRepository, InsForgeAppointmentRepository, ...
│   ├── domain/
│   │   ├── entities/    # Patient, Appointment, Reminder, Payment
│   │   ├── factories/   # AppointmentFactory, PatientFactory, ...
│   │   ├── repositories/# Interfaces: IPatientRepository, IAppointmentRepository, ...
│   │   └── rules/       # appointmentRules (lógica de negocio pura)
│   ├── infrastructure/  # insforge.js — único punto de contacto con la BD
│   └── usecases/        # CreateAppointment, CancelAppointment, GenerateReminder
├── docs/
│   ├── evidence/        # Archivos BEFORE de refactorizaciones
│   └── 01-arquitectura.md ... 05-database-schema.md
├── frontend/src/
│   ├── atoms/           # Button, Input, Label, Badge, Spinner, Avatar
│   ├── molecules/       # FormField, SearchBar, StatusBadge, Toast, ConfirmModal
│   ├── organisms/       # DataTable, PatientForm, AppointmentForm, EmptyState, PaymentModal
│   ├── templates/       # DashboardLayout, AuthLayout, SplitScreenLayout
│   ├── pages/           # Dashboard, Patients, Appointments, Reminders, admin/*, doctor/*, patient/*
│   ├── billing/         # BillingService + adaptadores de pago (Adapter Pattern)
│   ├── components/      # ProtectedRoute, Sidebar, TopBar (layout y auth)
│   ├── context/         # AuthContext
│   ├── core/            # constants.js, messages.js, strategies/
│   ├── domain/          # factories/, validators/, rules/ (lógica de negocio frontend)
│   ├── hooks/           # usePatients, useAppointments, useBilling, ...
│   └── services/        # patientService, appointmentService, ...
└── scripts/
    ├── seed-insforge.js  # Datos de prueba
    └── create-tables.js  # Creación de tablas en InsForge
```

---

## Etapas del proyecto

| Etapa | Descripción | Estado |
|:---:|:---|:---:|
| 0 | Setup inicial: Vite + React + TailwindCSS v4 + InsForge | ✅ |
| 1 | Módulos base: Pacientes, Citas, Historial, Recordatorios | ✅ |
| 2 | Refactorizaciones R1–R5: servicios, hooks, patrones | ✅ |
| 3 | Adapter Pattern: BillingService + PagoFácil + PaymentModal | ✅ |
| 4 | Portal Admin completo: Sucursales, Facturación, Insumos | ✅ |
| 5 | Reestructuración: Atomic Design + Clean Architecture backend | ✅ |
| 6 | Domain layer: Factories, Validators, Rules, Strategies | ✅ |
| 7 | Documentación técnica `.agent/` completa | ✅ |
| 8 | Consola médica (Doctor) + Portal paciente | 🔄 |
| 9 | Reportes, notificaciones reales y deploy producción | 🔄 |

---

## Documentación técnica

| Archivo | Contenido |
|:---|:---|
| `docs/01-arquitectura.md` | Diagramas de arquitectura y flujo MVP |
| `docs/02-componentes.md` | Catálogo de componentes reutilizables |
| `docs/03-refactorizacion.md` | Técnicas R1–R5 con ejemplos reales |
| `docs/04-stack.md` | Justificación técnica del stack |
| `docs/05-database-schema.md` | Schema completo de la base de datos |
| `.agent/SKILLS.md` | Índice inteligente: qué leer según la tarea |
| `.agent/ARCHITECTURE.md` | Atomic Design + Clean Architecture explicados |
| `.agent/PATTERNS.md` | Adapter, Factory, Strategy, Observer en el proyecto |
| `.agent/TESTING.md` | TDD, cobertura mínima por capa, reglas de mocks |

---

## Autora

**Ordoñez Choque Nayeli Zharit**  
Materia: Ingeniería de Software II  
Proyecto académico — © 2025. Todos los derechos reservados.
