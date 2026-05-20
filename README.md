[![English](https://img.shields.io/badge/Language-English-0E4A8A?style=flat-square&logo=googletranslate&logoColor=white)](README.md)
[![Español](https://img.shields.io/badge/Idioma-Español-00A896?style=flat-square&logo=googletranslate&logoColor=white)](README.es.md)

<div align="center">

<img src="docs/assets/logo.png" alt="MediL CRM" width="280"/>

<h1>MediL CRM</h1>

**Patient Relationship Management System for Medical Clinics**  
*Modular · Scalable · Adaptable to multiple healthcare specialties*

<br/>

![Version](https://img.shields.io/badge/version-1.0.0--stage1-0E4A8A?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-00A896?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20development-FFD100?style=flat-square&logoColor=black)

</div>

---

## 📖 Description

**MediL CRM** is a web application built as a **Software Product Line (SPL)** for the healthcare sector. It enables medical clinics to manage their complete operation from a single platform — and can be adapted to different medical specialties without rewriting the core logic.

> 📚 **Academic context:** Software Engineering II &nbsp;·&nbsp; SPL #2 — Business Management Systems

---

## ✨ Key Features

| Module | Functionality | Status |
|:---|:---|:---:|
| 👤 **Patients** | Full registration, search, and profile management | ✅ MVP |
| 📅 **Appointments** | Scheduling with automatic time-conflict detection | ✅ MVP |
| 🗂️ **Medical Records** | Immutable chronological entries with append-only policy | ✅ MVP |
| 🔔 **Reminders** | Configurable automatic notifications (default: 24h before) | ✅ MVP |
| 📊 **Dashboard** | Executive summary with key metrics and quick access | 🔄 In progress |

---

## 🛠️ Tech Stack

<div align="center">

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-00A896?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com)

</div>

<br/>

| Layer | Technology | Role in the system |
|:---|:---|:---|
| **Frontend** | React 18 + Vite 5 | Component-based UI with HMR for fast iteration |
| **Styles** | TailwindCSS v4 | Design system with centralized tokens via `@theme` |
| **Routing** | React Router v6 | Declarative client-side navigation per domain module |
| **Backend / DB** | InsForge | Integrated persistence behind a uniform service interface |
| **Documentation** | Mermaid | Architecture diagrams as code within the repository |

---

## 🏗️ System Architecture

<div align="center">

<img src="docs/assets/diagrama-en.png" alt="MediL CRM Architecture Diagram" width="100%"/>

</div>

The system adopts **Domain-Driven Modular Architecture**: each domain is a closed module with its own service and InsForge repository, ensuring high cohesion, low coupling, and SPL reusability.

→ [View full technical architecture documentation](docs/01-arquitectura.md)

---

## 📊 MVP Sequence Flow

<div align="center">

<img src="docs/assets/secuencia-en.png" alt="MediL CRM MVP Sequence Diagram" width="100%"/>

</div>

<details>
<summary>📋 Description of the 4 main flows</summary>

| # | Flow | Description |
|:---:|:---|:---|
| **1** | 🧑‍⚕️ Patient Management | Registration, search, and real-time listing via InsForge |
| **2** | 📅 Appointment Scheduling | Scheduling with conflict validation before confirmation |
| **3** | 🔔 Automatic Reminders | Reminder generated 24h before each appointment |
| **4** | ✅ Cycle Closure | Mark appointment as attended and create clinical history |

</details>

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Quick start

```bash
# 1. Clone the repository
git clone https://github.com/juradoger/medil-crm.git
cd medil-crm

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Start the development server
npm run dev
```

> The application will be available at **`http://localhost:5173`**

<details>
<summary>⚙️ Color palette & design tokens</summary>

#### Brand palette (`frontend/src/index.css`)

```css
@import "tailwindcss";

@theme {
  --color-primary:    #0E4A8A;   /* Corporate Blue  — titles and primary buttons */
  --color-accent:     #00A896;   /* Aqua Green      — active elements and icons */
  --color-alert:      #FFD100;   /* Yellow          — alerts and reminder highlights */
  --color-background: #FFFFFF;   /* Pure White      — card backgrounds and panels */
}
```

#### Configurable constants per specialty (`frontend/src/core/constants.js`)

```js
// Adjust per CRM variant:
// 48h → psychology  |  24h → general medicine  |  2h → dental emergencies
export const HOURS_BEFORE_REMINDER = 24;

export const APPOINTMENT_STATUS = {
  SCHEDULED:  'scheduled',
  ATTENDED:   'attended',
  CANCELLED:  'cancelled',
};
```

</details>

---

## 📁 Project Structure

```
medil-crm/
│
├── frontend/
│   └── src/
│       ├── pages/              # Dashboard · Patients · Appointments
│       │                       # Reminders · PatientDetail
│       ├── components/
│       │   └── StatusBadge.jsx # Reusable status component (OCP)
│       ├── hooks/
│       │   ├── usePatients.js
│       │   └── useAppointments.js
│       ├── services/           # patientService · appointmentService
│       │                       # recordService · reminderService
│       └── core/
│           └── constants.js
│
├── backend/
│   ├── patients/               # PatientService + InsForge repository
│   ├── appointments/           # AppointmentService + InsForge repository
│   ├── records/                # MedicalRecordService + InsForge repository
│   └── reminders/              # ReminderService + InsForge repository
│
└── docs/
    ├── assets/                 # Images and visual resources
    ├── 01-arquitectura.md
    ├── 02-componentes.md
    ├── 03-refactorizacion.md
    └── 04-stack.md
```

---

## 📚 Technical Documentation

| # | Document | Content |
|:---:|:---|:---|
| 01 | [🏗️ Architecture](docs/01-arquitectura.md) | Domain modular pattern · architecture and MVP flow diagrams |
| 02 | [🧩 Components](docs/02-componentes.md) | Catalog of 7 reusable components with methods and SPL analysis |
| 03 | [♻️ Refactorings](docs/03-refactorizacion.md) | R1–R2 applied and R3–R5 planned with technical justification |
| 04 | [🛠️ Stack](docs/04-stack.md) | Technical justification for each technology with SE principles |

---

## 👥 Contributing

This is a closed academic project. For suggestions or corrections, please open an **Issue** in this repository using the format:

```
[TYPE] Descriptive title
Types: [BUG] · [ENHANCEMENT] · [DOCS] · [QUESTION]
```

---

## 📄 License

Academic project — Software Engineering II.  
© 2025 Ordoñez Choque Nayeli Zharit. All rights reserved.
