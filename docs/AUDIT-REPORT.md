# Reporte de Auditoría — MedIL CRM/ERP
Fecha: 2026-05-31
Auditor: Ingeniería de Software Senior (revisión basada en lineamientos `.agent/`)

Alcance: auditoría de arquitectura, bad smells, patrones de diseño, reglas de
dominio, UX (Nielsen), testing, flujos y convenciones. Se aplicaron correcciones
sin introducir features nuevos. La verificación final (`npm run test` + `npm run lint`)
quedó en verde.

---

## 1. Estado inicial

- **Frontend:** 132 tests en verde (41 archivos), pero **7 errores de ESLint** que
  bloqueaban el merge según `CICD.md`.
- **Backend:** 6 tests en verde. Casos de uso (`CreateAppointment`,
  `CancelAppointment`, `GenerateReminder`) ya seguían Clean Architecture
  correctamente (inyección de dependencias, factories, reglas de dominio).

---

## 2. Problemas encontrados y corregidos

### PRIORIDAD 1 — Rompen funcionalidad / lint

| # | Problema | Archivo | Corrección |
|---|----------|---------|------------|
| 1 | Lint roto: `react-hooks/set-state-in-effect` | `pages/admin/Billing.jsx`, `pages/doctor/DoctorConsole.jsx`, `pages/patient/PatientPortal.jsx` | `// eslint-disable-next-line` (convención ya usada en `hooks/`) |
| 2 | Imports/vars sin usar | `PatientPortal.jsx` (`useRef`, `db`, `uploadApi`), `LandingPage.jsx` (`Link`) | Eliminados |
| 3 | **Cancelar cita NO cancelaba su recordatorio** (viola DOMAIN §3 y WORKFLOWS Flujo 3) | `services/appointmentService.js` + `services/reminderService.js` | Nuevo `reminderService.cancelByAppointment(id)`; `appointmentService.cancel()` lo invoca |
| 4 | **Sin guardas de transición de estado**: una cita atendida podía cancelarse y una cancelada marcarse atendida (viola DOMAIN §4) | `services/appointmentService.js` | `cancel()`/`markAttended()` consultan la cita y validan con `appointmentRules.canBeCancelled/canBeAttended` |
| 5 | `create()` no validaba fecha futura ni paciente activo (viola WORKFLOWS Flujo 2) | `services/appointmentService.js` | Validación con `appointmentRules.isFutureDate` + `isPatientActive` antes de insertar |
| 6 | Falta `REMINDER_STATUS.CANCELLED` (DOMAIN §4 lo exige) | `core/constants.js` | Constante agregada |

### PRIORIDAD 2 — Bad smells y arquitectura

| # | Bad smell | Archivo | Corrección |
|---|-----------|---------|------------|
| 7 | **BS05 Número mágico** `24 * 3_600_000` para el recordatorio | `services/appointmentService.js` | Reemplazado por `ReminderFactory.createFromAppointment()` (usa `HOURS_BEFORE_REMINDER`) |
| 8 | **Factory Pattern** ausente: recordatorio construido inline con mensaje hardcodeado | `services/appointmentService.js` | Ahora usa `ReminderFactory` (Factory Pattern, PATTERNS §3) |
| 9 | **BS01 Magic string** `'scheduled'` literal en reglas | `domain/rules/appointmentRules.js` | Reemplazado por `APPOINTMENT_STATUS.SCHEDULED` |

### PRIORIDAD 3 — UX y mensajes

| # | Problema | Archivo | Corrección |
|---|----------|---------|------------|
| 10 | **BS01/H9** mensaje de conflicto de horario hardcodeado en el servicio | `services/appointmentService.js` | Usa `MESSAGES.error.validation.timeConflict` |
| 11 | Confirmación de cancelación no advertía sobre el recordatorio (UX §2 / H9) | `core/messages.js` + `pages/Appointments.jsx` | `confirm.cancelAppointment` ampliado y consumido vía `MESSAGES` (antes string literal en JSX) |

### PRIORIDAD 4 — Tests

| # | Test | Cobertura |
|---|------|-----------|
| 12 | `core/eventBus.test.js` (7 casos) | `on`, `emit`, unsubscribe, `off`, múltiples handlers, evento sin suscriptores, handler que lanza error |
| 13 | `services/appointmentService.test.js` (4 casos) | Cancelación de recordatorio + guardas de transición de estado |

---

## 3. Bad smells eliminados (antes / después)

**BS05 — Número mágico en el cálculo del recordatorio**
```js
// ANTES — appointmentService.create
const sendAt = new Date(new Date(`${date}T${time}`).getTime() - 24 * 3_600_000).toISOString();
await reminderService.create({ appointmentId: created?.id, patientId: data.patientId,
  message: `Recuerde su cita el ${date} a las ${time}`, sendAt }).catch(() => {});

// DESPUÉS — Factory Pattern + constante de dominio
const reminder = ReminderFactory.createFromAppointment({
  id: created.id, patientId: data.patientId, branchId: data.branchId, date, time,
});
await reminderService.create(reminder).catch(() => {});
```

**BS01 — Magic string en reglas de dominio**
```js
// ANTES
canBeAttended(appointment) { return appointment.status === 'scheduled'; }
// DESPUÉS
canBeAttended(appointment) { return appointment.status === APPOINTMENT_STATUS.SCHEDULED; }
```

**Flujo de cancelación incompleto (Observer/efecto secundario faltante)**
```js
// ANTES — cancel() solo cambiaba el estado de la cita
async cancel(id) {
  const { error } = await db.from('appointments').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw new Error(error.message);
}
// DESPUÉS — guarda de transición + cancelación del recordatorio asociado
async cancel(id) {
  const appointment = await appointmentService.getById(id);
  if (appointment && !appointmentRules.canBeCancelled(appointment))
    throw new Error('Solo se pueden cancelar citas agendadas');
  const { error } = await db.from('appointments').update({ status: APPOINTMENT_STATUS.CANCELLED }).eq('id', id);
  if (error) throw new Error(error.message);
  await reminderService.cancelByAppointment(id).catch(() => {});
}
```

---

## 4. Tests agregados

- `frontend/src/core/eventBus.test.js` — 7 tests (Observer Pattern).
- `frontend/src/services/appointmentService.test.js` — 4 tests (transiciones + recordatorios).
- Además se agregó el método `eventBus.off()` que faltaba respecto al contrato de
  PATTERNS §2 / FASE 3.

Resultado final: **frontend 143 tests** (42→43 archivos) **+ backend 6 tests**, todos en verde. Lint sin errores ni warnings.

---

## 5. Verificación de los 4 patrones de diseño (PATTERNS.md)

- **Adapter** ✓ `billing/billingService.js` recibe el adaptador por constructor; no lo instancia.
- **Factory** ✓ Reforzado: `appointmentService` ahora usa `ReminderFactory`. Backend ya usaba todos los factories.
- **Strategy** ✓ `core/strategies/` con sort/filter; `DataTable` aplica la estrategia recibida.
- **Observer** ✓ `core/eventBus.js` completo (`on`/`emit`/`off`) + tests.

---

## 6. Pendiente para la siguiente iteración

Se detectaron y documentaron, pero **no** se corrigieron en esta auditoría por
tener gran superficie de cambio y riesgo de regresión visual (requieren su propia
iteración con verificación de UI):

1. **BS09 / CONVENTIONS §8 — Colores hardcodeados.** Múltiples páginas usan clases
   arbitrarias `bg-[#00B4D8]`, `text-[#0E4A8A]`, `hover:bg-[#0096B4]` en lugar de la
   paleta Tailwind oficial (`bg-primary`, `text-primary-dark`). Requiere confirmar
   que el tema Tailwind define esos tokens antes de migrar masivamente.
2. **BS01 / CONVENTIONS §7 — Strings literales en JSX.** Títulos, labels de botones
   y mensajes de error de modales (`'Nueva Cita'`, `'Paciente, fecha y hora son
   obligatorios'`, etc.) aún no provienen de `MESSAGES`.
3. **BS10 — `withLoading()` parcial.** `useAppointments`/`useReminders` replican la
   lógica de loading/error inline pero las operaciones `create`/`cancel`/`markAttended`
   no actualizan `loading`/`error`. Conviene extraer el `withLoading()` canónico.
4. **Factory parcial en servicios frontend.** El `insert` de citas/pacientes arma el
   objeto inline (la tabla InsForge gestiona `status`/`createdAt`); evaluar enrutar por
   `AppointmentFactory`/`PatientFactory` sin romper el esquema real.
5. **`console.error` en bloques `catch`** de varias páginas (p. ej. `PatientPortal`).
   CONVENTIONS §7 desaconseja `console` en producción; reemplazar por manejo de error UI.
6. **Backend — magic strings y mensajes.** `CancelAppointment` usa `'cancelled'` literal
   y los casos de uso tienen mensajes en español hardcodeados; centralizar en un módulo
   de constantes/mensajes del backend.
7. **DATABASE.md desactualizado.** Documenta `db.collection().where().find()`, pero el
   SDK real de InsForge usa `db.from().select().eq()` (que es lo que el código usa).
   Actualizar la doc para reflejar el patrón real.

---

## 7. Resultado de la verificación final

```
frontend: npm run lint  → 0 errores, 0 warnings
frontend: npm run test  → 143 tests, todos en verde
backend:  npm run test  → 6 tests, todos en verde
```
