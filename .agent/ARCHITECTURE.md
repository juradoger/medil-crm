# ARCHITECTURE.md — MedIL CRM/ERP
> Leer completo antes de crear cualquier archivo del proyecto.
> Este archivo es la referencia de arquitectura para desarrolladores y agentes IA.

---

## 1. Visión General del Sistema

MedIL es una **Línea de Producto de Software (SPL)** para el sector salud.

### ¿Qué es una SPL?
Una SPL es un conjunto de sistemas que comparten una arquitectura
común pero se adaptan a distintos contextos sin reescribir el núcleo.
MedIL puede adaptarse a clínica general, odontología, psicología,
fisioterapia o laboratorio cambiando solo configuración y módulos opcionales.

### Dos pilares arquitectónicos
- **Frontend:** Atomic Design + principios de Clean Architecture
- **Backend:** Clean Architecture en capas con InsForge como infraestructura

---

## 2. Atomic Design — Frontend

### ¿Qué es?
Patrón de diseño de UI creado por Brad Frost.
Organiza componentes en 5 niveles de complejidad creciente.
Los niveles inferiores son reutilizables en los superiores.
Los niveles superiores nunca son importados por los inferiores.

### ¿Por qué lo usamos?
- Máxima reutilización: un átomo Button se usa en 50 lugares
- Cambios predecibles: modificar un átomo afecta todo el sistema de forma consistente
- Tests aislados: cada nivel se prueba independientemente
- Escalabilidad: agregar features no rompe lo existente
- Claridad: cualquier desarrollador sabe exactamente dónde va cada pieza

---

### NIVEL 1 — Átomos → src/atoms/

**Definición:** Componente mínimo e indivisible de la UI.
Es la unidad más pequeña. No puede dividirse más sin perder su función.

**Reglas estrictas:**
- Solo recibe props y renderiza HTML
- Sin lógica de negocio
- Sin llamadas a servicios, hooks de datos o context
- Sin estado propio (excepto estados de UI pura: hover, focus, open/close simple)
- Completamente reutilizable en cualquier contexto del sistema

**Archivos actuales:**
atoms/
Avatar.jsx    → círculo con iniciales del usuario
Badge.jsx     → indicador visual de color con texto
Button.jsx    → botón con variantes primary/danger/ghost/secondary
Input.jsx     → campo de texto con estados normal/error/focus/disabled
Label.jsx     → etiqueta de formulario con indicador de requerido
Spinner.jsx   → indicador de carga animado

**Ejemplo correcto de átomo:**
```jsx
// Button.jsx — átomo correcto
export function Button({ label, onClick, variant = 'primary', disabled, loading }) {
  // Solo lógica de presentación. Sin fetch, sin context, sin reglas de negocio.
  return (
    <button onClick={onClick} disabled={disabled || loading}>
      {loading ? <Spinner size="sm" /> : label}
    </button>
  );
}
```

---

### NIVEL 2 — Moléculas → src/molecules/

**Definición:** Combinación de átomos que cumple una función concreta y única.

**Reglas estrictas:**
- Combina átomos para crear una unidad funcional
- Puede tener estado local simple (open/close, valor controlado)
- Sin llamadas a servicios directamente
- Sin lógica de negocio del dominio
- Una molécula = una responsabilidad

**Archivos actuales:**
molecules/
ConfirmModal.jsx   → Modal de confirmación: título + mensaje + 2 botones
FormField.jsx      → Label + Input + mensaje de error
SearchBar.jsx      → Input de búsqueda + botón limpiar + debounce 300ms
StatusBadge.jsx    → Badge + texto de estado traducido al español
Toast.jsx          → Notificación flotante con auto-cierre en 3s

---

### NIVEL 3 — Organismos → src/organisms/

**Definición:** Componente complejo que combina moléculas y átomos.
Tiene lógica de presentación propia pero no lógica de negocio.

**Reglas estrictas:**
- Puede usar hooks de UI (useToast, estado de modal)
- Recibe datos como props desde la página
- Sin llamadas directas a servicios de datos
- Sin lógica de negocio del dominio (eso va en domain/)

**Archivos actuales:**
organisms/
AppointmentForm.jsx  → formulario completo de cita con validación visual
DataTable.jsx        → tabla con SearchBar + EmptyState + Spinner
EmptyState.jsx       → estado vacío con ícono + título + acción opcional
PatientForm.jsx      → formulario completo de paciente con validación visual
PaymentModal.jsx     → modal de pago QR con polling reactivo

---

### NIVEL 4 — Plantillas → src/templates/

**Definición:** Layout que define la estructura visual sin datos reales.
Es el esqueleto de una página.

**Reglas estrictas:**
- Solo define posicionamiento y estructura
- Sin datos reales ni lógica
- Reutilizable por múltiples páginas

**Archivos actuales:**
templates/
AuthLayout.jsx         → layout centrado para Login
DashboardLayout.jsx    → TopBar + Sidebar + área de contenido
SplitScreenLayout.jsx  → panel izquierdo + panel derecho (consola médica)

---

### NIVEL 5 — Páginas → src/pages/

**Definición:** Instancia concreta de una plantilla con datos reales.
Punto de conexión entre datos y UI.

**Reglas estrictas:**
- Usa hooks de dominio (usePatients, useAppointments)
- Nunca llama servicios directamente
- Nunca tiene lógica de negocio inline
- Pasa datos como props a organismos y moléculas
- Una página = una ruta de React Router

**Estructura actual:**
pages/
admin/
Billing.jsx     → facturación (solo admin)
Branches.jsx    → sucursales (solo admin)
Supplies.jsx    → inventario (solo admin)
doctor/
DoctorConsole.jsx → consola de atención (solo doctor)
patient/
PatientPortal.jsx → portal del paciente (solo patient)
Appointments.jsx
Dashboard.jsx
Login.jsx
PatientDetail.jsx
Patients.jsx
Reminders.jsx

---

## 3. Clean Architecture — Frontend

### Capas y responsabilidades
┌─────────────────────────────────────────────┐
│  PÁGINAS (pages/)                           │ ← usa hooks
├─────────────────────────────────────────────┤
│  ORGANISMOS / UI (organisms/, molecules/)   │ ← recibe props
├─────────────────────────────────────────────┤
│  HOOKS (hooks/)                             │ ← única capa que llama services
├─────────────────────────────────────────────┤
│  SERVICIOS (services/)                      │ ← llama InsForge SDK
├─────────────────────────────────────────────┤
│  DOMINIO (domain/)                          │ ← reglas de negocio puras
├─────────────────────────────────────────────┤
│  CORE (core/)                               │ ← constants, messages, strategies
└─────────────────────────────────────────────┘

### Regla de dependencias — NUNCA violar
pages     → importan: hooks, templates, organisms, molecules, atoms
hooks     → importan: services, domain, core
services  → importan: domain, core, lib/insforge
domain    → importa: solo core/constants
core      → no importa nada del proyecto
atoms     → no importan nada del proyecto
molecules → importan: atoms, core
organisms → importan: molecules, atoms, core, hooks de UI
templates → importan: organisms, molecules, atoms

### src/domain/ — Reglas de negocio puras

Código 100% independiente de React, InsForge y cualquier framework.
Testeable sin mocks de servicios externos.
domain/
factories/
AppointmentFactory.js  → crea citas con status SCHEDULED + timestamps
PatientFactory.js      → crea pacientes con status ACTIVE + timestamps
PaymentFactory.js      → calcula commission y totalAmount automáticamente
ReminderFactory.js     → calcula scheduledDate (cita - 24hs) automáticamente
rules/
appointmentRules.js    → isFutureDate, canBeAttended, canBeCancelled
billingRules.js        → calculateCommission, calculateTotal
validators/
appointmentValidator.js → valida campos obligatorios y fecha futura
patientValidator.js     → valida campos obligatorios y formato email

### src/hooks/ — Estructura obligatoria

Todo hook del proyecto sigue esta estructura sin excepción:

```js
export function useNombreHook(branchId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // withLoading: envuelve TODAS las operaciones async
  async function withLoading(fn) {
    setLoading(true);
    setError(null);
    try { return await fn(); }
    catch (err) { setError(err.message); throw err; }
    finally { setLoading(false); }
  }

  useEffect(() => {
    withLoading(() => loadInitialData());
  }, [branchId]);

  return { data, loading, error /*, funciones */ };
}
```

### src/services/ — Estructura obligatoria

```js
import { db } from '../lib/insforge';
import { MESSAGES } from '../core/messages';
import { EntidadFactory } from '../domain/factories/EntidadFactory';

export async function getAll(branchId) {
  // Solo llama a InsForge. Sin lógica de negocio.
  return db.collection('entidad')
    .where('branchId', '==', branchId)
    .find();
}

export async function create(data) {
  // Construye la entidad con el factory antes de insertar
  const entity = EntidadFactory.create(data);
  return db.collection('entidad').insert(entity);
}
```

---

## 4. Clean Architecture — Backend

### Estructura de capas
backend/
domain/
entities/      ← Patient, Appointment, Reminder, Payment
factories/     ← AppointmentFactory, PatientFactory, etc.
repositories/  ← IPatientRepository, IAppointmentRepository (interfaces)
rules/         ← appointmentRules (lógica pura sin InsForge)
usecases/        ← CreateAppointment, CancelAppointment, GenerateReminder
adapters/        ← InsForgePatientRepository, InsForgeAppointmentRepository
infrastructure/  ← insforge.js (configuración del cliente InsForge)

### Principio clave
domain/ NO sabe que InsForge existe.
domain/ solo conoce IPatientRepository (interfaz).
InsForgePatientRepository implementa esa interfaz.
Si mañana cambiás de InsForge a otra BD:
→ Solo cambiás los archivos en adapters/
→ domain/ y usecases/ no se tocan

### Estructura de un caso de uso

```js
// usecases/CreateAppointment.js
export class CreateAppointment {
  constructor(appointmentRepo, patientRepo, reminderRepo) {
    // Inyección de dependencias — nunca instanciar repositorios aquí
    this.appointmentRepo = appointmentRepo;
    this.patientRepo = patientRepo;
    this.reminderRepo = reminderRepo;
  }

  async execute(data) {
    // 1. Validar con reglas del dominio (sin InsForge)
    if (!appointmentRules.isFutureDate(data.date, data.time))
      throw new Error(MESSAGES.error.validation.futureDate);
    // 2. Verificar disponibilidad (con repositorio)
    const free = await appointmentRules.hasNoConflict(
      data.professionalId, data.date, data.time, this.appointmentRepo
    );
    if (!free) throw new Error(MESSAGES.error.validation.timeConflict);
    // 3. Construir entidad con factory
    const appointment = AppointmentFactory.create(data);
    // 4. Persistir via repositorio
    const saved = await this.appointmentRepo.save(appointment);
    // 5. Efecto secundario: generar recordatorio
    const reminder = ReminderFactory.createFromAppointment(saved);
    await this.reminderRepo.save(reminder);
    return saved;
  }
}
```

---

## 5. SPL — Adaptabilidad por especialidad

MedIL se adapta a distintas clínicas cambiando configuración:
Especialidad      Qué cambia
─────────────────────────────────────────────────────
Odontología       campos extra en historial (pieza dental, tratamiento)
Psicología        "sesiones" en lugar de "citas", notas de sesión
Fisioterapia      ejercicios asignados, progreso de rehabilitación
Laboratorio       resultados de análisis adjuntos al historial
Medicina general  configuración base sin cambios

Puntos de variabilidad controlados por:
- `constants.js`: HOURS_BEFORE_REMINDER, duraciones, comisiones
- Adapter Pattern: canal de notificación, pasarela de pago
- Módulos opcionales: inventario, comisiones, reportes

---

## 6. Bad Smells — Detección y Solución

### BS01 — Magic Strings / Magic Numbers
**Señal:** `'scheduled'`, `'admin'`, `24` literales en el código
**Solución:** usar `APPOINTMENT_STATUS.SCHEDULED`, `USER_ROLES.ADMIN`, `HOURS_BEFORE_REMINDER`

### BS02 — Long Method
**Señal:** función de más de 20 líneas
**Solución:** Extract Method — dividir en funciones con nombre semántico

### BS03 — God Component
**Señal:** componente de más de 100 líneas con múltiples responsabilidades
**Solución:** dividir siguiendo los niveles de Atomic Design

### BS04 — Duplicate Logic
**Señal:** mismo código en 2 o más lugares
**Solución:** extraer a función en domain/validators/ o core/

### BS05 — Primitive Obsession
**Señal:** IDs y estados como strings sueltos sin constantes
**Solución:** usar constantes de constants.js y factories

### BS06 — Missing Error Boundary
**Señal:** sin manejo global de errores en React
**Solución:** ErrorBoundary envolviendo RouterConfig en App.jsx

### BS07 — Dead Code
**Señal:** archivos .BEFORE en carpetas de código productivo
**Solución:** mover a docs/evidence/

### BS08 — Inconsistent Naming
**Señal:** mezcla de convenciones en nombres
**Solución:** seguir CONVENTIONS.md sin excepciones

### BS09 — Hardcoded Configuration
**Señal:** URLs, claves, porcentajes en el código
**Solución:** variables de entorno (.env) y constants.js

### BS10 — Missing Loading State
**Señal:** operaciones async sin indicador visual de carga
**Solución:** withLoading() obligatorio en todos los hooks

---

## 7. Estructura de carpetas completa de referencia
frontend/src/
atoms/           ← Avatar, Badge, Button, Input, Label, Spinner
molecules/       ← ConfirmModal, FormField, SearchBar, StatusBadge, Toast
organisms/       ← AppointmentForm, DataTable, EmptyState, PatientForm, PaymentModal
templates/       ← AuthLayout, DashboardLayout, SplitScreenLayout
pages/
admin/         ← Billing, Branches, Supplies
doctor/        ← DoctorConsole
patient/       ← PatientPortal
Dashboard, Patients, Appointments, Reminders, PatientDetail, Login
billing/
adapters/      ← IPaymentAdapter, SimulatedQRAdapter, PagoFacilAdapter
billingService.js
components/
auth/          ← ProtectedRoute
layout/        ← Sidebar, TopBar
context/         ← AuthContext
core/
strategies/    ← filterStrategies, sortStrategies
constants.js
messages.js
domain/
factories/     ← AppointmentFactory, PatientFactory, PaymentFactory, ReminderFactory
rules/         ← appointmentRules, billingRules
validators/    ← appointmentValidator, patientValidator
hooks/           ← useAppointments, useBilling, useBranches, useMedicalRecords,
usePatients, useProfessionals, useReminders
lib/             ← insforge.js
services/        ← appointmentService, authService, branchService,
patientService, professionalService, recordService, reminderService
test/            ← setup.js
backend/
adapters/        ← InsForgeAppointmentRepository, InsForgePatientRepository, InsForgeReminderRepository
domain/
entities/      ← Appointment, Patient, Payment, Reminder
factories/     ← AppointmentFactory, PatientFactory, PaymentFactory, ReminderFactory
repositories/  ← IAppointmentRepository, IPatientRepository, IReminderRepository
rules/         ← appointmentRules
infrastructure/  ← insforge.js
usecases/        ← CreateAppointment, CancelAppointment, GenerateReminder

---

## 8. Módulo Branches — Raíz del Sistema Multiclínica

### ¿Por qué branches es especial?
Branches no es un módulo más. Es la raíz del sistema.
Todos los datos del sistema tienen branchId como campo obligatorio.
Sin branchId el sistema multiclínica no funciona.

### Estructura completa del módulo branches

Frontend (ya implementado):
  pages/admin/Branches.jsx        ← vista (solo admin)
  hooks/useBranches.js            ← hook de estado
  services/branchService.js       ← acceso a InsForge

Backend (completar en Etapa siguiente):
  backend/domain/entities/Branch.js
  backend/domain/repositories/IBranchRepository.js
  backend/adapters/InsForgeBranchRepository.js
  backend/usecases/CreateBranch.js
  backend/usecases/UpdateBranch.js
  backend/usecases/DeactivateBranch.js

### Comportamiento por rol

admin:
  - currentBranchId viene de AuthContext
  - puede ver datos de TODAS las sucursales
  - puede filtrar por sucursal específica
  - es el único rol que puede crear/editar/desactivar sucursales

doctor:
  - currentBranchId fijo: el branchId de su perfil en professionals
  - todos sus datos filtrados automáticamente por ese branchId
  - no puede ver datos de otras sucursales

patient:
  - currentBranchId fijo: el branchId de su registro en patients
  - solo ve sus propios datos
  - no puede ver datos de otros pacientes ni de otras sucursales

### Cómo se usa branchId en servicios

Todo servicio que consulta datos DEBE recibir branchId:

  getAll(branchId)          ← siempre filtrar por sucursal
  create(data)              ← data siempre incluye branchId
  getByDate(date, branchId) ← filtrar fecha Y sucursal

Excepción: branchService no filtra por branchId
porque maneja las sucursales en sí mismas.

### AuthContext — fuente del branchId

  const { currentBranchId } = useAuth();
  const { patients } = usePatients(currentBranchId);
  const { appointments } = useAppointments(currentBranchId);

Nunca hardcodear un branchId en un componente o hook.
Siempre viene de AuthContext.
