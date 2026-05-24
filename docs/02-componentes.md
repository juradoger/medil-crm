[![English](https://img.shields.io/badge/Language-English-0E4A8A?style=flat-square)](02-componentes.en.md)
[![README](https://img.shields.io/badge/←_Inicio-README-00A896?style=flat-square)](../README.es.md)
![Doc](https://img.shields.io/badge/doc-02%20de%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# 🧩 Catálogo de Componentes Reutilizables

*7 componentes · Alta cohesión · Bajo acoplamiento · Reutilizables en SPL*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![InsForge](https://img.shields.io/badge/Backend-InsForge-0E4A8A?style=flat-square)
![SPL](https://img.shields.io/badge/Patrón-SPL-00A896?style=flat-square)

</div>

---

Este documento describe los 7 componentes reutilizables del sistema MediL CRM, su rol en la arquitectura, sus métodos principales y por qué son reutilizables dentro de una línea de producto de software para el sector salud.

---

## Componente 1 — PatientService

![Tipo](https://img.shields.io/badge/Tipo-Servicio_de_dominio-0E4A8A?style=flat-square)
![Ubicación](https://img.shields.io/badge/backend/patients/patientService.js-grey?style=flat-square&logo=files)

### Problema que resuelve

Sin este servicio, la lógica de negocio de pacientes estaría dispersa en múltiples controladores o directamente en las rutas del backend, generando duplicación y acoplamiento. PatientService centraliza toda la lógica relacionada con el ciclo de vida del paciente en un único módulo cohesivo.

### Métodos principales

| Método | Descripción |
|:---|:---|
| `createPatient(patientData)` | Crea y persiste un nuevo registro de paciente |
| `updatePatient(id, patientData)` | Actualiza datos de un paciente existente |
| `getPatientById(id)` | Recupera un paciente por su ID único |
| `searchPatients(query)` | Busca pacientes por nombre u otros criterios |
| `validatePatientData(patientData)` | Valida la integridad de los datos antes de persistir |

### Reutilizabilidad en SPL

El concepto de "paciente registrado" es común a todas las especialidades médicas. Solo `validatePatientData` requeriría extensión para campos específicos.

<details>
<summary>🏥 Otros sistemas del sector salud donde puede usarse</summary>

- Sistema de gestión hospitalaria (HIS)
- Portal de telemedicina
- Sistema de farmacia con registro de clientes

</details>

---

## Componente 2 — AppointmentService

![Tipo](https://img.shields.io/badge/Tipo-Servicio_de_dominio-0E4A8A?style=flat-square)
![Ubicación](https://img.shields.io/badge/backend/appointments/appointmentService.js-grey?style=flat-square&logo=files)

### Problema que resuelve

La gestión de citas requiere lógica compleja: verificación de conflictos de horario, transición de estados y vinculación con recordatorios. Sin un servicio dedicado, esta lógica se repite en cada punto de la aplicación.

### Métodos principales

| Método | Descripción |
|:---|:---|
| `createAppointment(data)` | Crea una nueva cita médica |
| `cancelAppointment(id)` | Cancela una cita y actualiza su estado |
| `markAsAttended(id)` | Marca la cita como atendida |
| `listByDate(date)` | Lista todas las citas de una fecha |
| `checkTimeConflict(date, duration)` | Verifica colisión de horarios |

### Reutilizabilidad en SPL

El ciclo de vida (agendada → atendida/cancelada) es idéntico en todas las especialidades. `checkTimeConflict` es especialmente valioso en fisioterapia y odontología.

<details>
<summary>🏥 Otros sistemas del sector salud</summary>

- Agendamiento quirúrgico
- Reserva de equipos médicos (resonancias, ecografías)

</details>

---

## Componente 3 — MedicalRecordService

![Tipo](https://img.shields.io/badge/Tipo-Servicio_de_dominio-0E4A8A?style=flat-square)
![Ubicación](https://img.shields.io/badge/backend/records/recordService.js-grey?style=flat-square&logo=files)

### Problema que resuelve

El historial clínico requiere integridad temporal: las entradas nunca se eliminan, siempre se agregan, y deben presentarse en orden cronológico. Sin un servicio dedicado, esta lógica estaría duplicada en múltiples módulos.

### Métodos principales

| Método | Descripción |
|:---|:---|
| `createEntry(patientId, entryData)` | Agrega una entrada al historial del paciente |
| `getPatientHistory(patientId)` | Recupera el historial completo del paciente |
| `sortByDate(entries)` | Ordena entradas por fecha descendente |

### Reutilizabilidad en SPL

Las notas clínicas son universales. En psicología almacena notas de sesión; en fisioterapia, evaluaciones de evolución motora.

<details>
<summary>🏥 Otros sistemas del sector salud</summary>

- Sistema de historia clínica electrónica (HCE)
- Plataforma de seguimiento oncológico

</details>

---

## Componente 4 — ReminderService

![Tipo](https://img.shields.io/badge/Tipo-Servicio_de_dominio-0E4A8A?style=flat-square)
![Ubicación](https://img.shields.io/badge/backend/reminders/reminderService.js-grey?style=flat-square&logo=files)

### Problema que resuelve

Sin este servicio, la lógica de cuándo enviar recordatorios estaría acoplada al módulo de citas. ReminderService aísla esta responsabilidad y usa `HOURS_BEFORE_REMINDER` en lugar de valores literales, evitando el antipatrón "número mágico".

### Métodos principales

| Método | Descripción |
|:---|:---|
| `createReminderForAppointment(appointmentId)` | Crea un recordatorio vinculado a una cita |
| `calculateReminderDate(appointmentDate)` | Calcula la fecha de envío (cita − 24h) |
| `generateMessage(patientName, date)` | Genera el texto del recordatorio |
| `markAsSent(reminderId)` | Marca el recordatorio como enviado |
| `listPending()` | Lista recordatorios pendientes de envío |

### Reutilizabilidad en SPL

`HOURS_BEFORE_REMINDER` puede configurarse a 48h para psicología o a 2h para urgencias odontológicas. El servicio no cambia; solo la constante.

<details>
<summary>🏥 Otros sistemas del sector salud</summary>

- Sistema de notificaciones de vacunación
- Plataforma de seguimiento de medicación

</details>

---

## Componente 5 — StatusBadge

![Tipo](https://img.shields.io/badge/Tipo-Componente_React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Ubicación](https://img.shields.io/badge/frontend/src/components/StatusBadge.jsx-grey?style=flat-square&logo=files)

### Problema que resuelve

Sin este componente, cada página del CRM implementaría su propia lógica de colores y etiquetas para mostrar estados. Esto genera inconsistencia visual y duplicación de código de presentación.

### Props

| Prop | Tipo | Descripción |
|:---|:---|:---|
| `status` | `string` | Estado del registro (ej. `'scheduled'`) |
| `type` | `'appointment' \| 'reminder' \| 'patient'` | Tipo de entidad para elegir el mapa de estilos |

### Reutilizabilidad en SPL

Para extender a una nueva especialidad solo se agrega una entrada al objeto `STYLES` y `LABELS`. El componente mismo no se modifica — **Principio Abierto/Cerrado (OCP)** aplicado.

---

## Componente 6 — usePatients

![Tipo](https://img.shields.io/badge/Tipo-Custom_Hook-61DAFB?style=flat-square&logo=react&logoColor=black)
![Ubicación](https://img.shields.io/badge/frontend/src/hooks/usePatients.js-grey?style=flat-square&logo=files)

### Problema que resuelve

Sin este hook, cada página que necesite gestionar pacientes duplicaría la lógica de llamadas a la API, manejo de estados de carga y captura de errores.

### Interfaz del hook

```js
const { patients, loading, error, createPatient, updatePatient, searchPatients } = usePatients();
```

| Valor | Tipo | Descripción |
|:---|:---|:---|
| `patients` | `Array` | Lista de pacientes cargados |
| `loading` | `boolean` | Verdadero mientras carga |
| `error` | `Error \| null` | Error capturado o null |
| `createPatient(data)` | `Function` | Crea paciente y actualiza estado |
| `updatePatient(id, data)` | `Function` | Actualiza paciente y refresca lista |
| `searchPatients(query)` | `Function` | Busca y filtra la lista |

### Reutilizabilidad en SPL

Importable por cualquier página del CRM. En variantes de la SPL, solo cambia el servicio subyacente; la interfaz del hook permanece idéntica.

---

## Componente 7 — useAppointments

![Tipo](https://img.shields.io/badge/Tipo-Custom_Hook-61DAFB?style=flat-square&logo=react&logoColor=black)
![Ubicación](https://img.shields.io/badge/frontend/src/hooks/useAppointments.js-grey?style=flat-square&logo=files)

### Problema que resuelve

La gestión de citas implica múltiples operaciones de estado que, sin un hook dedicado, contaminarían los componentes de vista con lógica que no les corresponde, violando la separación de responsabilidades.

### Interfaz del hook

```js
const { appointments, loading, error, createAppointment, cancelAppointment, filterByDate } = useAppointments();
```

| Valor | Tipo | Descripción |
|:---|:---|:---|
| `appointments` | `Array` | Lista de citas cargadas |
| `loading` | `boolean` | Verdadero mientras carga |
| `error` | `Error \| null` | Error capturado o null |
| `createAppointment(data)` | `Function` | Crea cita y actualiza estado |
| `cancelAppointment(id)` | `Function` | Cancela cita y refresca lista |
| `filterByDate(date)` | `Function` | Filtra citas por fecha |

### Reutilizabilidad en SPL

En fisioterapia o psicología, solo se modifica `appointmentService.js`. El hook y los componentes que lo consumen no requieren cambios.

<details>
<summary>🏥 Otros sistemas del sector salud</summary>

- Sistema de gestión de turnos de guardia
- Agendamiento de salas quirúrgicas

</details>

---

## Componente 8 — BillingService + Adapter Pattern

![Tipo](https://img.shields.io/badge/Tipo-Servicio_con_Adapter_Pattern-0E4A8A?style=flat-square)
![Ubicación](https://img.shields.io/badge/frontend/src/billing/billingService.js-grey?style=flat-square&logo=files)

### Problema que resuelve — Problem it solves

Sin este patrón, el código de negocio estaría acoplado directamente al proveedor PagoFácil. Si Bolivia adopta un nuevo sistema QR, habría que refactorizar toda la lógica de pagos. El Adapter Pattern aísla ese cambio.

Without this pattern, business code would be directly coupled to the PagoFácil provider. If Bolivia adopts a new QR system, the entire payment logic would need refactoring. The Adapter Pattern isolates that change.

### Interfaz pública — Public interface

```js
// Cálculo — Calculation
const { subtotal, commission, total } = billingService.calculateTotal(amount);

// Generación QR — QR generation
const { qrCode, transactionId } = await billingService.generatePaymentQR({ appointmentId, amount, branchId });

// Verificación — Verification
const { status } = await billingService.checkPaymentStatus(transactionId);
```

### Adaptadores disponibles — Available adapters

| Adaptador — Adapter | Entorno — Environment | Descripción |
|:---|:---|:---|
| `SimulatedQRAdapter` | `development` | QR simulado con delays — Simulated QR with delays |
| `PagoFacilAdapter` | `production` | API real PagoFácil Bolivia |

### Reutilizabilidad en SPL

Agregar un proveedor (ej. Tigo Money) solo requiere crear `TigoMoneyAdapter extends IPaymentAdapter`. El resto del sistema no cambia.

Adding a provider (e.g., Tigo Money) only requires creating `TigoMoneyAdapter extends IPaymentAdapter`. The rest of the system stays unchanged.

---

## Componente 9 — PaymentModal + useBilling

![Tipo](https://img.shields.io/badge/Tipo-Componente_React_+_Hook-61DAFB?style=flat-square&logo=react&logoColor=black)
![Ubicación](https://img.shields.io/badge/frontend/src/components/payments/-grey?style=flat-square&logo=files)

### Problema que resuelve — Problem it solves

El flujo de pago QR requiere generación de imagen, polleo periódico y manejo de estados complejos (idle→loading→polling→success/error). Sin estos componentes, esta lógica se duplicaría en cada módulo que acepte pagos.

The QR payment flow requires image generation, periodic polling and complex state handling (idle→loading→polling→success/error). Without these components, this logic would duplicate across every module that accepts payments.

### Props de PaymentModal — PaymentModal props

| Prop | Tipo — Type | Descripción — Description |
|:---|:---|:---|
| `isOpen` | `boolean` | Controla visibilidad — Controls visibility |
| `onClose` | `Function` | Callback al cerrar — Close callback |
| `appointmentId` | `string` | ID de la cita — Appointment ID |
| `amount` | `number` | Monto base en Bs — Base amount in Bs |
| `branchId` | `string` | Sucursal — Branch |
| `onPaymentSuccess` | `Function` | Callback al aprobar — Approval callback |

### Interfaz de useBilling — useBilling interface

```js
const { generateQR, paymentState, qrData, error, loading, resetPayment } = useBilling();
```

| Valor — Value | Tipo — Type | Descripción — Description |
|:---|:---|:---|
| `paymentState` | `string` | `idle` / `loading` / `polling` / `success` / `error` |
| `qrData` | `object\|null` | `{ qrCode, transactionId }` |
| `generateQR(data)` | `Function` | Inicia el ciclo — Starts the cycle |
| `resetPayment()` | `Function` | Limpia el estado — Clears state |

---

## Componente 10 — AuthContext + ProtectedRoute

![Tipo](https://img.shields.io/badge/Tipo-Context_+_Componente_React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Ubicación](https://img.shields.io/badge/frontend/src/context/-grey?style=flat-square&logo=files)

### Problema que resuelve — Problem it solves

Sin AuthContext, cada componente que necesite verificar el rol del usuario accedería directamente a localStorage, duplicando lógica y rompiendo el principio DRY. AuthContext centraliza el estado de sesión.

Without AuthContext, every component needing to check the user's role would directly access localStorage, duplicating logic and breaking DRY. AuthContext centralizes session state.

### API del hook useAuth — useAuth hook API

```js
const { user, login, logout, isAuthenticated, hasRole, currentBranchId, loading } = useAuth();
```

| Valor — Value | Tipo — Type | Descripción — Description |
|:---|:---|:---|
| `user` | `object\|null` | Usuario autenticado — Authenticated user |
| `isAuthenticated` | `boolean` | Hay sesión activa — Active session |
| `hasRole(roles)` | `Function` | Verifica rol — Verifies role |
| `currentBranchId` | `string\|null` | Sucursal activa — Active branch |
| `loading` | `boolean` | Cargando sesión — Loading session |

### ProtectedRoute

```jsx
<ProtectedRoute allowedRoles={['admin', 'doctor']}>
  <Dashboard />
</ProtectedRoute>
```

Redirige a `/login` si no autenticado. Muestra 403 inline si rol no permitido.

Redirects to `/login` if not authenticated. Shows inline 403 if role not allowed.

---

<div align="center">

[← 🏗️ Arquitectura](01-arquitectura.md) &nbsp;|&nbsp; [♻️ Refactorizaciones →](03-refactorizacion.md) &nbsp;|&nbsp; [← Volver al README](../README.es.md)

</div>
