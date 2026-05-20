# MedIL CRM

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow) ![Etapa](https://img.shields.io/badge/etapa-1%20de%203-blue) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)

## Descripción del Proyecto

**MedIL CRM** es un sistema de gestión de relaciones con clientes (CRM) modular diseñado para clínicas y consultorios médicos. Permite gestionar pacientes, citas, historial clínico y recordatorios desde una interfaz unificada. Está construido como una línea de producto de software (SPL), lo que significa que su arquitectura por dominios permite adaptarlo a distintas especialidades médicas con mínima modificación.

---

## Project Description

**MedIL CRM** is a modular Customer Relationship Management (CRM) system designed for clinics and medical offices. It enables management of patients, appointments, medical records, and reminders from a unified interface. It is built as a Software Product Line (SPL), meaning its domain-driven architecture allows adaptation to different medical specialties with minimal modification.

---

## Contexto Académico

| Campo | Valor |
|---|---|
| Alumna | Ordoñez Choque Nayeli Zharit |
| Materia | Ingeniería de Software II |
| Línea de Producto | SPL #2 — Sistemas de gestión empresarial (ERP/CRM) |
| Institución | Universidad (Proyecto Académico) |

---

## Academic Context

| Field | Value |
|---|---|
| Student | Ordoñez Choque Nayeli Zharit |
| Course | Software Engineering II |
| Product Line | SPL #2 — Business Management Systems (ERP/CRM) |
| Institution | University (Academic Project) |

---

## Stack Tecnológico

| Tecnología | Versión | Justificación |
|---|---|---|
| **React 18** | 18.x | Componentes reutilizables y gestión de estado local; ideal para interfaces modulares de CRM |
| **Vite** | 5.x | Build tool ultrarrápido con HMR; reduce fricción en desarrollo iterativo académico |
| **TailwindCSS** | 4.x | Utilidades CSS atómicas que aceleran el prototipado manteniendo consistencia visual |
| **React Router v6** | 6.x | Enrutamiento declarativo del lado del cliente; cada módulo del CRM tiene su propia ruta |
| **InsForge** | — | Backend y base de datos integrada; permite persistencia sin configuración de servidor separado |
| **Mermaid** | — | Diagramas como código; los diagramas viven en el repositorio y se actualizan con el código |

---

## Technology Stack

| Technology | Version | Justification |
|---|---|---|
| **React 18** | 18.x | Reusable components and local state management; ideal for modular CRM interfaces |
| **Vite** | 5.x | Ultra-fast build tool with HMR; reduces friction in iterative academic development |
| **TailwindCSS** | 4.x | Atomic CSS utilities that accelerate prototyping while maintaining visual consistency |
| **React Router v6** | 6.x | Declarative client-side routing; each CRM module has its own route |
| **InsForge** | — | Integrated backend and database; enables persistence without separate server setup |
| **Mermaid** | — | Diagrams as code; diagrams live in the repository and are updated alongside the code |

---

## Estructura del Repositorio

```
medil-crm/
├── frontend/                  # Aplicación React + Vite — React + Vite application
│   └── src/
│       ├── pages/             # Vistas por ruta — Route views
│       ├── components/        # Componentes reutilizables — Reusable components
│       ├── hooks/             # Custom hooks de React — React custom hooks
│       ├── services/          # Capa de comunicación con el backend — Backend communication layer
│       └── core/              # Constantes y utilidades globales — Global constants and utilities
├── backend/                   # Servicios de dominio — Domain services
│   ├── patients/
│   ├── appointments/
│   ├── records/
│   └── reminders/
├── docs/                      # Documentación técnica — Technical documentation
│   ├── 01-arquitectura.md
│   ├── 02-componentes.md
│   ├── 03-refactorizacion.md
│   └── 04-stack.md
└── README.md
```

---

## Flujo Principal del MVP

El flujo de uso principal del sistema en 7 pasos:

1. **Registrar paciente** — El operador ingresa los datos del paciente nuevo al sistema.
2. **Buscar paciente** — Se localiza al paciente existente por nombre o identificador.
3. **Crear cita** — Se agenda una cita médica para el paciente con fecha, hora y duración.
4. **Verificar conflictos** — El sistema comprueba que no exista otra cita en el mismo horario.
5. **Generar recordatorio** — Se crea automáticamente un recordatorio 24 horas antes de la cita.
6. **Registrar historial** — Tras la consulta, el médico agrega una entrada al historial clínico.
7. **Actualizar estado** — La cita se marca como atendida o cancelada según corresponda.

---

## Main MVP Flow

The 7-step primary usage flow of the system:

1. **Register patient** — The operator enters new patient data into the system.
2. **Search patient** — An existing patient is located by name or identifier.
3. **Create appointment** — A medical appointment is scheduled with date, time, and duration.
4. **Check conflicts** — The system verifies no other appointment exists at the same time slot.
5. **Generate reminder** — A reminder is automatically created 24 hours before the appointment.
6. **Record medical history** — After the visit, the doctor adds an entry to the medical record.
7. **Update status** — The appointment is marked as attended or cancelled as appropriate.

---

## Línea de Producto de Software (SPL)

MedIL CRM está diseñado como base reutilizable para múltiples especialidades médicas. Gracias a su arquitectura modular por dominio, los módulos de Pacientes, Citas, Historial y Recordatorios pueden reutilizarse directamente en:

| Especialidad | Variante | Módulos reutilizados |
|---|---|---|
| **Odontología** | MedIL Dental | Pacientes, Citas, Historial, Recordatorios |
| **Pediatría** | MedIL Pediatric | Pacientes (con tutor), Citas, Historial, Recordatorios |
| **Psicología** | MedIL Psych | Pacientes, Citas, Historial (notas sesión), Recordatorios |
| **Fisioterapia** | MedIL Physio | Pacientes, Citas (recurrentes), Historial (evolución), Recordatorios |

---

## Software Product Line (SPL)

MedIL CRM is designed as a reusable base for multiple medical specialties. Thanks to its domain-driven modular architecture, the Patient, Appointment, Medical Record, and Reminder modules can be reused directly in:

| Specialty | Variant | Reused Modules |
|---|---|---|
| **Dentistry** | MedIL Dental | Patients, Appointments, Records, Reminders |
| **Pediatrics** | MedIL Pediatric | Patients (with guardian), Appointments, Records, Reminders |
| **Psychology** | MedIL Psych | Patients, Appointments, Records (session notes), Reminders |
| **Physiotherapy** | MedIL Physio | Patients, Appointments (recurring), Records (progress), Reminders |

---

## Autora y Materia

**Alumna:** Ordoñez Choque Nayeli Zharit  
**Materia:** Ingeniería de Software II  
**Proyecto:** MedIL CRM — SPL #2 Sistemas de gestión empresarial

---

## Author and Course

**Student:** Ordoñez Choque Nayeli Zharit  
**Course:** Software Engineering II  
**Project:** MedIL CRM — SPL #2 Business Management Systems
