<div align="center">

<img src="docs/assets/logo.png" alt="MedIL CRM" width="260"/>

# MedIL — Sistema de Gestión Clínica CRM/ERP

**Gestión integral de clínicas médicas multisucursal**
*Modular · Escalable · Adaptable a múltiples especialidades de salud*

[![CI Quality](https://github.com/juradoger/medil-crm/actions/workflows/ci-quality.yml/badge.svg)](https://github.com/juradoger/medil-crm/actions/workflows/ci-quality.yml)
![Versión](https://img.shields.io/badge/versión-1.0.0-00B4D8?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-00B4D8?style=flat-square&logo=tailwindcss&logoColor=white)
![Estado](https://img.shields.io/badge/estado-en%20desarrollo-FFD100?style=flat-square&logoColor=black)

</div>

---

## Descripción

Sistema modular CRM/ERP para clínicas y consultorios médicos en Bolivia. Gestión
multiclínica con IA integrada. Construido como **Línea de Producto de Software (SPL)**:
un núcleo común que se adapta a distintas especialidades (odontología, fisioterapia,
pediatría…) sin reescribir la base.

## Características principales

- Gestión multiclínica (múltiples sucursales)
- 3 roles: Administrador, Médico, Paciente
- IA integrada (Claude API) para diagnósticos y orientación de especialidad
- Pagos QR (PagoFácil Bolivia)
- Recordatorios automáticos por WhatsApp (Twilio)
- Portal público para pacientes
- Reportes descargables (PDF y Excel)

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite 8, TailwindCSS v4, React Router v7 |
| Backend | Node.js, Express, InsForge SDK |
| IA | Claude API (Anthropic) |
| Notificaciones | Twilio WhatsApp |
| Almacenamiento | Cloudinary |
| Testing | Vitest, @testing-library/react |
| CI/CD | GitHub Actions |

## Arquitectura

- Atomic Design (5 niveles: atoms → molecules → organisms → templates → pages)
- Clean Architecture en backend (domain / usecases / adapters / infrastructure)
- Adapter Pattern (pagos, notificaciones, IA)
- Factory Pattern (entidades de dominio)
- Observer Pattern (eventBus)
- Strategy Pattern (ordenamiento y filtrado)
- TDD (Red → Green → Refactor)

## Cómo correr el proyecto

### Frontend
```bash
cd frontend
cp .env.example .env   # configurar variables
npm install
npm run dev            # http://localhost:5173
```

### Backend
```bash
cd backend
cp .env.example .env   # configurar API keys
npm install
npm run dev            # http://localhost:3001
```

### Seed de datos
```bash
node scripts/seed-insforge.js
```

### Tests
```bash
cd frontend && npm run test
cd frontend && npm run test:coverage
```

## Credenciales de prueba

Generadas por `scripts/seed-insforge.js`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin.lapaz@medil.com` | `admin123` |
| Médico | `mamani.marco@medil.com` | `doctor123` |
| Paciente | *(registrarse desde `/registro`)* | — |

## Etapas del proyecto

0. Documentación y arquitectura ✅
1. Componentes reutilizables ✅
2. Refactorizaciones ✅
3. Schema BD, TDD, CI/CD ✅
4. Portal Admin ✅
5. Portal Médico ✅
6. Portal Paciente ✅
7. Módulos ERP ✅
8. IA integrada ✅
9. Deploy → Vercel (próximo)

## Autora

Ordoñez Choque Nayeli Zharit
Ingeniería de Software II — UPDS
