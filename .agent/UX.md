# UX.md — MedIL CRM/ERP
> Estándar de experiencia de usuario del proyecto.
> Leer antes de implementar cualquier vista o componente visual.
> Toda decisión de UI debe justificarse con una heurística de Nielsen.

---

## 1. Heurísticas de Usabilidad de Nielsen

Las 10 heurísticas de Jakob Nielsen son el estándar de usabilidad
de la industria. En MedIL cada decisión de UI se fundamenta en
al menos una de estas heurísticas.

---

### H1 — Visibilidad del estado del sistema
El sistema siempre informa al usuario qué está pasando.
El usuario nunca debe preguntarse "¿está cargando? ¿pasó algo?"

**Cómo se aplica en MedIL:**
✓ LoadingSpinner visible durante TODA operación async
✓ Toast de éxito/error después de TODA acción del usuario
✓ StatusBadge muestra el estado actual de cada entidad
✓ Botones deshabilitados con Spinner cuando loading=true
✓ Indicador de intentos en el polleo QR (intento X de 20)
✓ Badge de rol visible en el sidebar (admin / doctor / paciente)
✓ Sucursal activa siempre visible en el sidebar

**Componentes responsables:** Spinner, Toast, StatusBadge, Button (loading)

---

### H2 — Coincidencia entre el sistema y el mundo real
El sistema habla el lenguaje del usuario, no el del desarrollador.
Usa palabras, frases y conceptos familiares para el personal médico.

**Cómo se aplica en MedIL:**
✓ "Cita" no "appointment_record"
✓ "Paciente" no "user_entity"
✓ "Historial clínico" no "medical_record_log"
✓ "Agendada" no "status: scheduled"
✓ "Sucursal" no "branch_id"
✓ Fechas en formato DD/MM/YYYY (Bolivia), no ISO
✓ Horas en formato 12hs con AM/PM
✓ Montos en Bs (bolivianos), no en número crudo
✓ Mensajes de error en lenguaje natural (ver sección 4)

**Regla:** Nunca mostrar nombres de variables, IDs técnicos
ni códigos de error al usuario.

---

### H3 — Control y libertad del usuario
El usuario puede deshacer acciones y salir de estados no deseados
sin consecuencias graves.

**Cómo se aplica en MedIL:**
✓ ConfirmModal antes de TODA acción destructiva o irreversible
✓ Botón cancelar en todos los modales y formularios
✓ Click fuera del modal lo cierra (excepto en operaciones críticas)
✓ Botón limpiar en SearchBar para resetear la búsqueda
✓ Filtros con botón "limpiar filtros" visible
✓ Navegación libre entre secciones sin perder estado
✓ Toast de error con opción "Reintentar" cuando aplica

**Componentes responsables:** ConfirmModal, SearchBar, Button (cancelar)

---

### H4 — Consistencia y estándares
Los elementos del sistema se comportan de la misma forma
en todas las pantallas. El usuario aprende una vez y aplica siempre.

**Cómo se aplica en MedIL:**
✓ StatusBadge siempre usa los mismos colores para los mismos estados
scheduled → aqua, cancelled → rojo, attended → verde
✓ Botón primario siempre aqua (#00B4D8)
✓ Botón destructivo siempre rojo (#EF4444)
✓ Botón cancelar siempre gris secundario
✓ Formularios siempre con el mismo layout: label → input → error
✓ DataTable siempre con el mismo patrón: búsqueda → tabla → paginación
✓ Modales siempre con el mismo layout: título → contenido → acciones
✓ Toast siempre en esquina superior derecha, 3 segundos
✓ Loading siempre con el mismo Spinner en aqua

**Regla:** Si cambiás el comportamiento de un componente en una página,
cambialo en todas. Nunca hay excepciones por pantalla.

---

### H5 — Prevención de errores
El sistema está diseñado para que el usuario no cometa errores.
Mejor prevenir que mostrar mensajes de error.

**Cómo se aplica en MedIL:**
✓ Campo date con mínimo = hoy (no permite fechas pasadas)
✓ Selector de hora con intervalos de 30 minutos
✓ Validación en tiempo real mientras el usuario escribe
✓ Botón guardar deshabilitado hasta que el formulario sea válido
✓ Verificación de conflicto de horario antes de confirmar la cita
✓ CI con validación de formato mientras se escribe
✓ Email con validación de formato mientras se escribe
✓ Confirmación antes de acciones irreversibles (ConfirmModal)
✓ Selector de profesional muestra solo profesionales activos
✓ Selector de paciente muestra solo pacientes activos

**Componentes responsables:** Input (validación), AppointmentForm,
PatientForm, ConfirmModal

---

### H6 — Reconocimiento antes que recuerdo
El sistema minimiza la carga cognitiva del usuario.
Las opciones y acciones son visibles, no hay que recordarlas.

**Cómo se aplica en MedIL:**
✓ Sidebar siempre visible con todas las secciones del rol
✓ StatusBadge en todas las tablas: estado visible sin abrir el registro
✓ Nombre del paciente visible en la cita (no solo el ID)
✓ Nombre del profesional visible en la cita
✓ Nombre de la sucursal visible en el header
✓ Acciones disponibles visibles como botones en la tabla
✓ Breadcrumbs en páginas de detalle
✓ Placeholder descriptivo en todos los inputs
✓ Labels en todos los campos de formulario
✓ Tooltip en íconos que no tienen texto

---

### H7 — Flexibilidad y eficiencia de uso
El sistema es usable por usuarios novatos y expertos.
Los expertos tienen atajos, los novatos tienen guía.

**Cómo se aplica en MedIL:**
✓ Búsqueda rápida en todas las listas (SearchBar con debounce)
✓ Filtros por estado y fecha en citas y recordatorios
✓ Click en fila de tabla para abrir detalle (más rápido que buscar botón)
✓ Dashboard con accesos directos a las acciones más frecuentes
✓ Formularios con valores por defecto inteligentes
(fecha = hoy, estado = activo, sucursal = la activa)
✓ Shortcut: al crear cita desde el detalle del paciente,
el paciente se preselecciona automáticamente

---

### H8 — Diseño estético y minimalista
La interfaz no contiene información irrelevante.
Cada elemento visual compite con los demás por la atención del usuario.

**Cómo se aplica en MedIL:**
✓ Solo mostrar las columnas más importantes en las tablas
✓ Acciones secundarias en menú contextual, no todas visibles
✓ Formularios con solo los campos necesarios (sin campos opcionales ocultos)
✓ Dashboard con máximo 4-6 métricas clave
✓ Paleta reducida: aqua + blanco + grises + estados (rojo, verde, naranja)
✓ Sin animaciones innecesarias que distraigan
✓ Tipografía consistente sin múltiples tamaños y pesos
✓ Espaciado generoso para reducir densidad visual

---

### H9 — Ayuda al usuario a reconocer, diagnosticar y recuperarse de errores
Los mensajes de error son constructivos: explican qué pasó
y qué puede hacer el usuario para resolverlo.

**Cómo se aplica en MedIL:**
✓ Nunca mostrar códigos HTTP ni nombres técnicos
✓ Siempre explicar qué pasó en lenguaje natural
✓ Siempre indicar qué puede hacer el usuario
Ejemplos correctos:
"El profesional ya tiene una cita a esa hora.
Seleccioná otro horario o profesional."
"No pudimos conectarnos al servidor.
Verificá tu conexión e intentá de nuevo."
"Este paciente está inactivo.
Activalo desde su ficha antes de agendar una cita."
"El CI ya pertenece a otro paciente registrado.
Verificá el número ingresado."

---

### H10 — Ayuda y documentación
El sistema puede usarse sin documentación,
pero cuando el usuario necesita ayuda, está disponible.

**Cómo se aplica en MedIL:**
✓ Placeholder descriptivo en todos los inputs
ej: "Buscar por nombre o CI..."
✓ Tooltip en campos con formato específico
ej: ícono (?) junto al campo CI con formato esperado
✓ EmptyState con descripción de qué hacer cuando no hay datos
ej: "Aún no hay pacientes registrados.
Hacé click en 'Nuevo paciente' para comenzar."
✓ ConfirmModal con descripción clara de las consecuencias
ej: "¿Cancelar esta cita? El recordatorio también se cancelará.
Esta acción no se puede deshacer."

---

## 2. Estándar de mensajes

### EmptyState — criterio de texto
Sin datos (lista vacía, sin búsqueda activa):
→ Describir qué no hay + cómo crear el primero
Sin resultados (búsqueda activa sin coincidencias):
→ Describir qué no se encontró + sugerir limpiar la búsqueda

Mensajes por módulo:
patients:
noData:    'Aún no hay pacientes registrados'
noResults: 'No encontramos pacientes con ese nombre o CI'
appointments:
noData:    'No hay citas programadas para este día'
noResults: 'No encontramos citas con ese criterio'
history:
noData:    'Este paciente no tiene consultas registradas'
reminders:
noData:    'No hay recordatorios pendientes'
noResults: 'No encontramos recordatorios con ese criterio'
supplies:
noData:    'No hay insumos registrados para esta sucursal'
noResults: 'No encontramos insumos con ese nombre'
branches:
noData:    'No hay sucursales registradas'
professionals:
noData:    'No hay profesionales registrados para esta sucursal'
agenda:
noData:    'No tenés citas programadas para hoy'
reports:
noData:    'No hay información disponible para ese período'

### Mensajes de error — por categoría
Validación de formularios:
campo obligatorio:    '{campo} es obligatorio'
email inválido:       'Ingresá un correo electrónico válido'
CI duplicado:         'Ya existe un paciente con ese número de CI'
fecha pasada:         'La fecha de la cita debe ser a partir de hoy'
conflicto de horario: 'El profesional ya tiene una cita a esa hora.
Seleccioná otro horario o profesional.'
paciente inactivo:    'Este paciente está inactivo.
Activalo desde su ficha antes de agendar.'
Conexión:
sin conexión:         'No pudimos conectarnos.
Verificá tu conexión e intentá de nuevo.'
error servidor:       'Algo salió mal de nuestro lado.
Intentá de nuevo en unos segundos.'
no encontrado:        'No encontramos lo que buscabas.'
Autenticación:
credenciales:         'El correo o la contraseña son incorrectos.'
sesión expirada:      'Tu sesión expiró. Volvé a iniciar sesión.'
sin permisos:         'No tenés permisos para acceder a esta sección.'
Pagos:
QR expirado:          'El tiempo para escanear el QR venció.
Generá uno nuevo.'
pago rechazado:       'El pago fue rechazado por el banco.
Verificá tu cuenta e intentá de nuevo.'
timeout polleo:       'No recibimos confirmación del pago.
Si ya pagaste, contactá al administrador.'

### Mensajes de éxito (Toast — 3 segundos)
patientCreated:        'Paciente registrado correctamente'
patientUpdated:        'Datos del paciente actualizados'
patientDeactivated:    'Paciente desactivado'
appointmentCreated:    'Cita agendada correctamente'
appointmentCancelled:  'Cita cancelada'
appointmentAttended:   'Consulta registrada correctamente'
reminderSent:          'Recordatorio marcado como enviado'
paymentApproved:       '¡Pago confirmado!'
stockUpdated:          'Stock actualizado correctamente'
recordCreated:         'Consulta registrada en el historial'
branchCreated:         'Sucursal creada correctamente'
professionalCreated:   'Profesional registrado correctamente'

### Confirmaciones (ConfirmModal)
cancelAppointment:   '¿Cancelar esta cita?
El recordatorio también se cancelará.
Esta acción no se puede deshacer.'
deactivatePatient:   '¿Desactivar este paciente?
Sus citas futuras se cancelarán.'
markReminderSent:    '¿Marcar este recordatorio como enviado?'
markAttended:        '¿Marcar esta cita como atendida?'
deactivateBranch:    '¿Desactivar esta sucursal?
Los usuarios de esta sucursal perderán acceso.'

---

## 3. Estados de carga y feedback visual
REGLA: Toda operación async debe tener feedback visual.
El usuario nunca espera sin saber qué está pasando. (H1)
Duración estimada    Feedback apropiado
──────────────────────────────────────────────────────
< 1 segundo          Deshabilitar botón mientras procesa
1 - 3 segundos       Spinner en el botón + deshabilitar

3 segundos         Spinner de página completa + mensaje
Indeterminado        Spinner + mensaje + opción de cancelar


---

## 4. Acciones destructivas — protocolo obligatorio
Toda acción que no puede deshacerse DEBE seguir este protocolo:

El botón de acción es rojo o tiene ícono de advertencia
Al hacer click abre ConfirmModal (no ejecuta directo)
El ConfirmModal describe las consecuencias exactas
El botón de confirmación es rojo
El botón de cancelar es gris y es el foco por defecto
Solo al confirmar se ejecuta la acción
Toast de confirmación al completar


---

## 5. Paleta visual y significado
Color           Uso                         Heurística
──────────────────────────────────────────────────────
Aqua #00B4D8    Acciones primarias, links   H4 (consistencia)
Verde #10B981   Éxito, activo, atendido     H4 (consistencia)
Rojo #EF4444    Error, peligro, cancelado   H4 (consistencia)
Naranja #F59E0B Advertencia, pendiente      H4 (consistencia)
Gris #6B7280    Inactivo, secundario        H4 (consistencia)
Blanco #FFFFFF  Fondos de tarjetas          H8 (minimalismo)
#F8FAFC         Fondo base de la app        H8 (minimalismo)
