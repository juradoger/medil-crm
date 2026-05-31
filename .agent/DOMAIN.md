# DOMAIN.md — MedIL CRM/ERP
> Reglas de negocio del sistema. Nunca violarlas en el código.
> Leer antes de implementar cualquier lógica de negocio.

---

## 1. Entidades del dominio
Branch          Sucursal física de la clínica
User            Usuario del sistema con rol
Patient         Paciente registrado en el sistema
Professional    Médico o profesional de salud
Appointment     Cita médica agendada
MedicalRecord   Entrada de historial clínico
Reminder        Recordatorio de cita
Payment         Pago de una cita
Supply          Insumo médico del inventario

---

## 2. Roles y permisos
ADMIN
✓ Ver datos de todas las sucursales
✓ Crear, editar y desactivar sucursales
✓ Crear, editar y desactivar usuarios
✓ Gestionar pacientes, citas, historial, recordatorios
✓ Gestionar pagos, inventario, comisiones
✓ Generar y descargar reportes por profesional
✗ No puede eliminar registros históricos
DOCTOR
✓ Ver datos de su sucursal únicamente
✓ Ver y gestionar pacientes de su sucursal
✓ Ver su agenda del día
✓ Registrar entradas de historial clínico
✓ Marcar citas como atendidas
✓ Editar su perfil (teléfono, email)
✗ No puede crear ni eliminar usuarios
✗ No puede ver datos de otras sucursales
✗ No puede gestionar pagos ni inventario
PATIENT
✓ Ver sus propias citas
✓ Agendar nueva cita desde el portal
✓ Ver su propio historial clínico
✓ Pagar su cita por QR desde el portal
✗ No puede ver datos de otros pacientes
✗ No puede editar su historial clínico
✗ No puede acceder a módulos de admin o doctor

---

## 3. Reglas por módulo

### SUCURSALES (Branch)

Todos los datos del sistema tienen branchId obligatorio
Un usuario pertenece a exactamente una sucursal
Admin puede ver y gestionar todas las sucursales
Doctor y Patient solo ven su propia sucursal
Desactivar sucursal no elimina sus datos históricos
No se puede eliminar una sucursal con datos asociados


### PACIENTES (Patient)

name es el identificador principal del paciente en el sistema
Un paciente inactivo no puede tener nuevas citas
El historial clínico nunca se elimina ni modifica
Un paciente puede tener userId para acceder al portal
Al desactivar un paciente sus citas futuras se cancelan
Estado inicial al crear: ACTIVE


### CITAS (Appointment)

Una cita no puede crearse en el pasado
Un profesional no puede tener dos citas al mismo horario
en la misma sucursal
Un paciente inactivo no puede tener nuevas citas
Al crear una cita se genera un recordatorio automáticamente
Una cita cancelada no puede marcarse como atendida
Una cita atendida no puede cancelarse
Estados válidos: scheduled → attended
scheduled → cancelled
Estado inicial al crear: SCHEDULED


### HISTORIAL CLÍNICO (MedicalRecord)

Solo doctors y admins pueden crear entradas
Una entrada clínica nunca se modifica ni elimina
Cada entrada se asocia a un paciente obligatoriamente
La asociación a una cita es opcional
Las entradas se ordenan cronológicamente descendente
Campos obligatorios: patientId, attendanceDate,
consultationReason, diagnosis, treatment


### RECORDATORIOS (Reminder)

Se generan automáticamente al crear una cita
sendAt = fechaHoraCita - HOURS_BEFORE_REMINDER (24hs)
Solo el admin puede marcarlos como enviados
Al cancelar una cita su recordatorio se cancela también
Al marcar enviado se registra sentBy y sentAt
Estados válidos: pending → sent
pending → cancelled (cuando se cancela la cita)
Estado inicial: PENDING


### PAGOS (Payment)

La comisión QR es siempre QR_COMMISSION_PERCENTAGE (2%)
totalAmount = amount + (amount * QR_COMMISSION_PERCENTAGE)
Un pago aprobado no puede modificarse
El adaptador de pago es intercambiable sin cambiar la lógica
En desarrollo: SimulatedQRAdapter
En producción: PagoFacilAdapter
El polleo tiene máximo QR_MAX_POLLING_ATTEMPTS (20) intentos
Estados válidos: pending → approved
pending → rejected
Estado inicial: PENDING


### INVENTARIO (Supply)

Cada insumo pertenece a una sucursal
stockCurrent <= stockMinimum → status: LOW
stockCurrent = 0 → status: CRITICAL
stockCurrent > stockMinimum → status: OK
El status se recalcula automáticamente al actualizar stock
Los movimientos de stock se registran con fecha y motivo


### COMISIONES (Commission)

Se calculan mensualmente por profesional
El porcentaje es configurable por profesional
Base de cálculo: citas con status ATTENDED en el período
Solo el admin puede ver y generar reportes de comisiones


---

## 4. Transiciones de estado válidas
APPOINTMENT:
SCHEDULED ──→ ATTENDED
SCHEDULED ──→ CANCELLED
ATTENDED  ✗→ (estado final, sin transición)
CANCELLED ✗→ (estado final, sin transición)
REMINDER:
PENDING ──→ SENT
PENDING ──→ CANCELLED (cuando la cita se cancela)
SENT    ✗→ (estado final)
PAYMENT:
PENDING ──→ APPROVED
PENDING ──→ REJECTED
APPROVED ✗→ (estado final)
REJECTED ✗→ (estado final)
PATIENT:
ACTIVE   ──→ INACTIVE
INACTIVE ──→ ACTIVE (reactivar)
SUPPLY:
OK       ──→ LOW (automático)
LOW      ──→ CRITICAL (automático)
CRITICAL ──→ LOW (al reponer stock)
LOW      ──→ OK (al reponer stock)

---

## 5. Valores por defecto al crear entidades
Patient:      status: ACTIVE,     createdAt: now(), updatedAt: now()
Professional: isActive: true,     createdAt: now()
Appointment:  status: SCHEDULED,  createdAt: now(), updatedAt: now()
MedicalRecord:                    createdAt: now()
Reminder:     status: PENDING,    createdAt: now()
Payment:      status: PENDING,    createdAt: now()
Branch:       status: ACTIVE,     createdAt: now()
User:         isActive: true,     createdAt: now()

---

## 6. Invariantes del sistema

Condiciones que NUNCA pueden violarse:

Todo registro tiene branchId (excepto branches y users)
El historial clínico es inmutable (append-only)
Un paciente inactivo no puede tener citas futuras
No hay dos citas para el mismo profesional en el mismo horario
Los pagos aprobados no se modifican
Las constantes de negocio viven en constants.js,
nunca hardcodeadas en servicios o componentes
Nunca se elimina ningún registro, solo se desactiva
