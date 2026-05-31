# WORKFLOWS.md — MedIL CRM/ERP
> Flujos principales del sistema paso a paso.
> Leer antes de implementar cualquier flujo completo.

---

## Flujo 1 — Autenticación y acceso por rol

Usuario entra a /login
Ingresa email y contraseña
Sistema valida credenciales contra colección users
Si son incorrectas → Toast de error (H9), no dice cuál está mal
Si son correctas → guarda token en localStorage
Sistema lee el rol del usuario
Redirige según rol:
admin   → /dashboard
doctor  → /doctor/console
patient → /patient/portal
El sidebar muestra solo los links del rol activo (H6)
El branchId del usuario queda disponible en AuthContext


---

## Flujo 2 — Crear cita (admin o doctor)

Usuario hace click en "Nueva cita"
Abre AppointmentForm en modal
Busca y selecciona paciente (solo activos)
Selecciona profesional de la sucursal activa (solo activos)
Selecciona fecha (mínimo hoy — H5)
Selecciona hora
Sistema valida conflicto de horario en tiempo real (H5)
→ Si hay conflicto: error visible inline, botón guardar deshabilitado
Ingresa motivo de la cita
Hace click en "Guardar"
Botón muestra Spinner (H1)
Sistema ejecuta CreateAppointment use case:
a. Valida fecha futura
b. Valida paciente activo
c. Valida que no hay conflicto de horario
d. Crea cita con status SCHEDULED via AppointmentFactory
e. Genera recordatorio automático via ReminderFactory
(scheduledDate = fechaHoraCita - 24hs)
Toast de éxito "Cita agendada correctamente" (H1)
Modal se cierra
La tabla de citas se actualiza automáticamente


---

## Flujo 3 — Atender una cita (doctor)

Doctor entra a /doctor/console
Panel izquierdo muestra su agenda del día
Doctor hace click en una cita para seleccionarla
Panel derecho carga la ficha del paciente
Doctor ve los 3 tabs: Paciente / Historial / Nueva consulta
Doctor revisa el historial previo del paciente
Doctor cambia al tab "Nueva consulta"
Completa el formulario:

Motivo de consulta (obligatorio)
Diagnóstico (obligatorio)
Tratamiento / indicaciones (obligatorio)
Observaciones (opcional)


Hace click en "Guardar y marcar atendida"
Sistema:
a. Crea entrada en medical_records
b. Actualiza cita a status ATTENDED
c. Emite evento appointment:attended via eventBus
Toast de éxito "Consulta registrada correctamente"
La cita desaparece de "pendientes" en la agenda
La nueva entrada aparece en el historial del paciente


---

## Flujo 4 — Gestionar recordatorios (admin)

Admin entra a /reminders
Ve lista de recordatorios pendientes ordenados por scheduledDate
Identifica los recordatorios de hoy o próximos
Contacta al paciente por teléfono o WhatsApp manualmente
Hace click en "Marcar como enviado"
ConfirmModal: "¿Marcar este recordatorio como enviado?" (H3)
Admin confirma
Sistema actualiza reminder:
status: SENT, sentBy: userId, sentAt: now()
Toast "Recordatorio marcado como enviado"
El recordatorio desaparece de la lista de pendientes


---

## Flujo 4b — Recordatorios con WhatsApp (Twilio)

Automático (job cada 5 min en producción):
  1. Job verifica recordatorios con sendAt <= ahora
  2. Obtiene datos del paciente y cita
  3. Formatea el número boliviano (+591)
  4. Envía mensaje por Twilio WhatsApp
  5. Marca reminder como SENT en InsForge
  6. El admin ve el estado actualizado en Reminders

Manual (admin desde la vista):
  1. Admin ve lista de recordatorios pendientes
  2. Cada uno muestra "Envío automático en X horas"
     o "⚡ Listo para enviar" si ya llegó la hora
  3. Admin puede hacer click en "Enviar por WhatsApp"
  4. Sistema llama POST /api/notify/reminder
  5. Twilio envía el mensaje
  6. Estado cambia a SENT con timestamp

Sin Twilio configurado (desarrollo):
  El endpoint retorna { simulated: true }
  La UI muestra Toast naranja informativo
  El estado se marca igual como enviado


---

## Flujo 5 — Procesar pago por QR

Admin selecciona la cita a cobrar
Hace click en "Cobrar"
Abre PaymentModal
Sistema muestra desglose:

Subtotal:      Bs X
Comisión (2%): Bs Y
Total:         Bs Z


Admin hace click en "Generar QR"
Botón muestra Spinner (H1)
BillingService delega a SimulatedQRAdapter (desarrollo)
o PagoFacilAdapter (producción)
QR aparece en el modal
Sistema inicia polleo automático cada 3 segundos
Modal muestra "Esperando pago... (intento X de 20)" (H1)
Si el banco aprueba:
a. eventBus emite payment:approved
b. Toast "¡Pago confirmado!" aparece
c. Modal se cierra automáticamente
d. Cita se actualiza según corresponda
Si se agotan los 20 intentos:
Toast de error con mensaje descriptivo (H9)
Si admin cancela:
ConfirmModal "¿Cancelar el proceso de pago?" (H3)


---

## Flujo 6 — Generar reporte de profesional (admin)

Admin entra a /admin/reports (Etapa 7)
Selecciona el profesional del selector
Selecciona rango de fechas (desde - hasta)
Hace click en "Generar reporte"
Sistema calcula:

Citas atendidas en el período
Citas canceladas
Pacientes únicos atendidos
Ingresos generados
Comisión calculada según porcentaje del profesional


Muestra tabla con el detalle de cada cita
Admin puede:
a. Descargar PDF → reporte con logo MedIL
b. Descargar Excel → compatible con Google Sheets


---

## Flujo 7 — Portal del paciente

Paciente entra a /login con sus credenciales
Sistema redirige a /patient/portal
Paciente ve sus citas próximas y pasadas
Para agendar nueva cita:
a. Hace click en "Nueva cita"
b. Selecciona sucursal
c. Selecciona especialidad o profesional
d. Selecciona fecha y hora disponible
e. Ingresa motivo
f. Confirma la cita
g. Sistema genera recordatorio automático
Para ver su historial:
a. Hace click en "Mi historial"
b. Ve lista cronológica de sus consultas
c. Puede ver diagnóstico y tratamiento de cada una
Para pagar su cita:
a. Selecciona la cita pendiente de pago
b. Sigue el Flujo 5 desde el portal del paciente


---

## Flujo 8 — Registro de paciente desde portal público

1. Paciente entra a /portal (o /)
2. Ve la lista de clínicas afiliadas (GET /api/public/branches)
3. Hace click en una clínica → /clinica/:id
4. Ve detalle: foto, descripción, equipo médico
   (GET /api/public/branches/:id)
5. Hace click en "Registrarse para agendar" → /registro
6. Completa el formulario:
   a. Foto de perfil (opcional) → POST /api/uploads/public/register-photo
   b. Nombre, teléfono, correo, contraseña, sucursal
7. Hace click en "Crear cuenta"
   → POST /api/public/register
   → Sistema crea user (role: patient) + patient en InsForge
8. Toast "¡Cuenta creada!" + redirige a /login en 2.5s
9. Paciente inicia sesión → redirige a /patient/portal
