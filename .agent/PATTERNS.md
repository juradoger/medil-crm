# PATTERNS.md — MedIL CRM/ERP
> Referencia de patrones de diseño aplicados en el proyecto.
> Leer antes de crear servicios, adaptadores o lógica intercambiable.

---

## ¿Qué es un patrón de diseño?

Un patrón de diseño es una solución reutilizable a un problema
recurrente en el diseño de software. No es código copiable,
es una guía de cómo estructurar el código para resolver
un tipo específico de problema de forma elegante y escalable.

En MedIL aplicamos 4 patrones. Cada uno resuelve un problema concreto.

---

## Patrón 1 — Adapter Pattern

### Categoría
Estructural

### Problema general que resuelve
Permite que dos interfaces incompatibles trabajen juntas.
Actúa como un traductor entre el código interno y servicios externos.

### Problema específico en MedIL
El sistema necesita procesar pagos QR, pero:
- En desarrollo no hay API bancaria real disponible
- En producción Bolivia usa PagoFácil o Libélula
- En el futuro podría cambiar a otro proveedor

Sin Adapter Pattern, cambiar de proveedor requeriría
modificar billingService.js y todos sus consumidores.
Con Adapter Pattern, solo se intercambia el adaptador.

El mismo problema aplica a las notificaciones:
- Ahora: el admin marca manualmente como enviado
- Etapa 8: envío automático vía Twilio WhatsApp
- Sin cambiar ReminderService

### Implementación en MedIL
billing/
adapters/
IPaymentAdapter.js       ← contrato/interfaz
SimulatedQRAdapter.js    ← desarrollo (sin API real)
PagoFacilAdapter.js      ← producción Bolivia
billingService.js          ← usa el adaptador, no conoce la implementación

#### El contrato (interfaz)
```js
// IPaymentAdapter.js
export class IPaymentAdapter {
  async generateQR(data) {
    throw new Error('No implementado');
  }
  async checkPaymentStatus(transactionId) {
    throw new Error('No implementado');
  }
}
```

#### El adaptador de desarrollo
```js
// SimulatedQRAdapter.js
export class SimulatedQRAdapter extends IPaymentAdapter {
  async generateQR(data) {
    await sleep(500); // simula latencia de red
    return {
      qrCode: 'data:image/png;base64,FAKE_QR_' + Date.now(),
      transactionId: 'TXN_' + Date.now(),
    };
  }
  async checkPaymentStatus(transactionId) {
    await sleep(1500); // simula respuesta del banco
    return { status: PAYMENT_STATUS.APPROVED };
  }
}
```

#### El servicio que usa el adaptador
```js
// billingService.js
export class BillingService {
  constructor(adapter) {
    // Recibe el adaptador por constructor — nunca lo instancia
    this.adapter = adapter;
  }
  async generatePaymentQR(data) {
    // No sabe si es simulado o real. Solo llama la interfaz.
    return this.adapter.generateQR(data);
  }
}

// Instancia por defecto según entorno
const adapter = import.meta.env.PROD
  ? new PagoFacilAdapter()
  : new SimulatedQRAdapter();
export const billingService = new BillingService(adapter);
```

### Cuándo usar Adapter Pattern en MedIL
✓ Cuando el sistema se conecta a un servicio externo que puede cambiar
✓ Cuando necesitás un modo desarrollo sin llamadas reales
✓ Cuando el canal de comunicación es intercambiable (pago, notificación, IA)

### Cuándo NO usar Adapter Pattern
✗ Para lógica interna que no depende de servicios externos
✗ Para componentes React (ahí usa props y composition)
✗ Cuando solo hay una implementación posible y no va a cambiar

### Extensión futura en MedIL
reminders/adapters/
INotificationAdapter.js    ← contrato
InternalAdapter.js         ← admin marca manualmente (ahora)
TwilioAdapter.js           ← WhatsApp automático (Etapa 8)
EmailAdapter.js            ← correo automático (futuro)
ai/adapters/
IAIAdapter.js              ← contrato
ClaudeAdapter.js           ← Claude API (Etapa 8)
MockAIAdapter.js           ← desarrollo sin API real

---

## Patrón 2 — Observer Pattern

### Categoría
Comportamiento

### Problema general que resuelve
Permite que un objeto notifique automáticamente a otros
cuando su estado cambia, sin conocer quiénes son esos otros.
Desacopla al emisor del receptor.

### Problema específico en MedIL
Cuando se aprueba un pago, múltiples partes del sistema
necesitan reaccionar:
- El Toast debe mostrarse con "¡Pago confirmado!"
- La cita debe cambiar a estado CONFIRMED
- El Dashboard debe actualizar sus métricas

Sin Observer Pattern, el billingService necesitaría
conocer el Toast, el hook de citas y el Dashboard.
Eso crea acoplamiento fuerte entre módulos que no deberían
conocerse entre sí.

### Implementación en MedIL
core/
eventBus.js   ← el bus de eventos central
hooks/
useToast.js   ← escucha eventos para mostrar notificaciones

#### El bus de eventos
```js
// core/eventBus.js
const listeners = {};

export const eventBus = {
  on(event, handler) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(handler);
    // Retorna función para cancelar la suscripción
    return () => {
      listeners[event] = listeners[event].filter(h => h !== handler);
    };
  },
  emit(event, data) {
    (listeners[event] || []).forEach(handler => handler(data));
  },
};
```

#### Eventos del sistema MedIL
appointment:created    → dispara generación de recordatorio
appointment:cancelled  → dispara cancelación de recordatorio
appointment:attended   → dispara actualización del dashboard
payment:approved       → dispara toast de éxito + actualiza estado cita
payment:rejected       → dispara toast de error
reminder:due           → dispara alerta visual al admin
stock:low              → dispara alerta de inventario bajo

#### Cómo se usa
```js
// Emisor — billingService emite sin conocer a nadie
async function confirmPayment(transactionId) {
  const result = await adapter.checkPaymentStatus(transactionId);
  if (result.status === PAYMENT_STATUS.APPROVED) {
    eventBus.emit('payment:approved', { transactionId });
  }
}

// Receptor — useToast escucha sin conocer a billingService
export function useToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = eventBus.on('payment:approved', () => {
      setToast({ message: MESSAGES.success.paymentApproved, type: 'success' });
    });
    return unsubscribe; // limpieza al desmontar
  }, []);

  return { toast };
}
```

### Cuándo usar Observer en MedIL
✓ Cuando un evento necesita notificar a múltiples receptores
✓ Cuando los módulos no deben conocerse entre sí
✓ Para notificaciones globales (Toast, alertas de dashboard)

### Cuándo NO usar Observer
✗ Para comunicación entre componente padre e hijo (usa props)
✗ Para estado local de un solo componente (usa useState)
✗ Cuando solo hay un receptor (usa callback directo)

---

## Patrón 3 — Factory Pattern

### Categoría
Creacional

### Problema general que resuelve
Centraliza la creación de objetos complejos.
Garantiza que todos los objetos de un tipo se creen
de la misma forma, con los mismos valores por defecto.

### Problema específico en MedIL
Al crear una cita, siempre necesitás:
- status: 'scheduled' (nunca otro valor inicial)
- createdAt: fecha actual
- updatedAt: fecha actual

Sin Factory Pattern, esto se repite en cada lugar
donde se crea una cita. Si cambia la lógica de inicialización,
hay que buscarlo en múltiples archivos.

Con Factory Pattern, la lógica de creación vive
en un solo lugar y todos los consumers la usan igual.

### Implementación en MedIL
domain/factories/           ← frontend
AppointmentFactory.js
PatientFactory.js
PaymentFactory.js
ReminderFactory.js
backend/domain/factories/   ← backend (misma lógica)
AppointmentFactory.js
PatientFactory.js
PaymentFactory.js
ReminderFactory.js

#### Los 4 factories del proyecto

```js
// PatientFactory.js
export const PatientFactory = {
  create(data) {
    return {
      ...data,
      status: PATIENT_STATUS.ACTIVE,        // siempre activo al crear
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  update(data) {
    return { ...data, updatedAt: new Date().toISOString() };
  },
};

// AppointmentFactory.js
export const AppointmentFactory = {
  create(data) {
    return {
      ...data,
      status: APPOINTMENT_STATUS.SCHEDULED, // siempre programada al crear
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};

// ReminderFactory.js — el más importante
export const ReminderFactory = {
  createFromAppointment(appointment) {
    // Calcula automáticamente la fecha del recordatorio
    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.time}`
    );
    const scheduledDate = new Date(
      appointmentDateTime.getTime() - HOURS_BEFORE_REMINDER * 3600000
    );
    return {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      branchId: appointment.branchId,
      message: ReminderFactory.generateMessage(appointment),
      scheduledDate: scheduledDate.toISOString(),
      status: REMINDER_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };
  },
  generateMessage(appointment) {
    return `Recordatorio: tiene una cita el ${appointment.date} a las ${appointment.time}`;
  },
};

// PaymentFactory.js — calcula montos automáticamente
export const PaymentFactory = {
  create(data) {
    const commission = data.amount * QR_COMMISSION_PERCENTAGE;
    return {
      ...data,
      commission,
      totalAmount: data.amount + commission,
      status: PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };
  },
};
```

### Regla de uso
Nunca construir entidades con objeto literal inline en servicios.
Siempre usar el Factory correspondiente.

```js
// MAL — objeto literal inline
await db.collection('appointments').insert({
  ...data,
  status: 'scheduled',          // magic string
  createdAt: new Date(),        // lógica duplicada
});

// BIEN — factory
const appointment = AppointmentFactory.create(data);
await db.collection('appointments').insert(appointment);
```

### Cuándo usar Factory en MedIL
✓ Siempre que crees una entidad de dominio (Patient, Appointment, etc.)
✓ Cuando la creación requiere calcular campos derivados
✓ Cuando hay valores por defecto que deben ser consistentes

### Cuándo NO usar Factory
✗ Para objetos de configuración simples sin lógica
✗ Para props de componentes React

---

## Patrón 4 — Strategy Pattern

### Categoría
Comportamiento

### Problema general que resuelve
Permite definir una familia de algoritmos intercambiables.
El componente que los usa no sabe cuál algoritmo se ejecuta,
solo sabe que puede llamar a .sort() o .filter().

### Problema específico en MedIL
DataTable necesita ordenar y filtrar datos.
Distintas páginas necesitan distintos criterios:
- Patients ordena por nombre
- Appointments ordena por fecha
- Supplies ordena por stock

Sin Strategy Pattern, DataTable tendría condicionales
para cada tipo de ordenamiento, acoplando la tabla
a la lógica de cada módulo.

### Implementación en MedIL
core/strategies/
sortStrategies.js    ← SortByDateStrategy, SortByNameStrategy
filterStrategies.js  ← FilterByStatusStrategy, FilterByDateRangeStrategy,
FilterByBranchStrategy

#### Las estrategias

```js
// sortStrategies.js
export class SortByDateStrategy {
  constructor(order = 'asc') { this.order = order; }
  sort(data) {
    return [...data].sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return this.order === 'asc' ? diff : -diff;
    });
  }
}

export class SortByNameStrategy {
  constructor(order = 'asc') { this.order = order; }
  sort(data) {
    return [...data].sort((a, b) => {
      const diff = a.fullName?.localeCompare(b.fullName) ?? 0;
      return this.order === 'asc' ? diff : -diff;
    });
  }
}

// filterStrategies.js
export class FilterByStatusStrategy {
  constructor(status) { this.status = status; }
  filter(data) {
    if (!this.status) return data;
    return data.filter(item => item.status === this.status);
  }
}

export class FilterByDateRangeStrategy {
  constructor(from, to) { this.from = from; this.to = to; }
  filter(data) {
    return data.filter(item => {
      const date = new Date(item.date);
      return date >= new Date(this.from) && date <= new Date(this.to);
    });
  }
}

export class FilterByBranchStrategy {
  constructor(branchId) { this.branchId = branchId; }
  filter(data) {
    if (!this.branchId) return data;
    return data.filter(item => item.branchId === this.branchId);
  }
}
```

#### Cómo se usa en DataTable
```jsx
// Página de Patients pasa su estrategia
<DataTable
  data={patients}
  sortStrategy={new SortByNameStrategy('asc')}
  filterStrategy={new FilterByStatusStrategy(selectedStatus)}
/>

// Página de Appointments pasa su estrategia
<DataTable
  data={appointments}
  sortStrategy={new SortByDateStrategy('asc')}
  filterStrategy={new FilterByDateRangeStrategy(from, to)}
/>
```

#### DataTable aplica la estrategia sin conocerla
```jsx
// DataTable.jsx — no sabe qué estrategia recibe
function DataTable({ data, sortStrategy, filterStrategy }) {
  const processedData = useMemo(() => {
    let result = [...data];
    if (filterStrategy) result = filterStrategy.filter(result);
    if (sortStrategy) result = sortStrategy.sort(result);
    return result;
  }, [data, sortStrategy, filterStrategy]);

  return <table>...</table>;
}
```

### Cuándo usar Strategy en MedIL
✓ Cuando diferentes páginas necesitan distintos criterios de ordenamiento
✓ Cuando el algoritmo de filtrado varía por contexto
✓ Cuando querés agregar nuevos criterios sin modificar DataTable

### Cuándo NO usar Strategy
✗ Cuando solo hay un algoritmo posible
✗ Para lógica que no varía entre contextos

---

## Resumen de los 4 patrones
Patrón     Categoría       Problema que resuelve en MedIL
─────────────────────────────────────────────────────────────────
Adapter    Estructural     Intercambiar proveedor de pagos/notificaciones/IA
sin modificar la lógica de negocio
Observer   Comportamiento  Notificar múltiples partes del sistema
cuando ocurre un evento sin acoplarlas
Factory    Creacional      Crear entidades de dominio (Patient, Appointment)
con valores por defecto y lógica de inicialización
Strategy   Comportamiento  Intercambiar algoritmos de ordenamiento y filtrado
en DataTable según el contexto de cada página

---

## Extensión de patrones — Etapas futuras
Etapa 8 — IA integrada:
ClaudeAdapter implements IAIAdapter   ← Adapter Pattern
MockAIAdapter implements IAIAdapter   ← Adapter Pattern (desarrollo)
Etapa 8 — WhatsApp:
TwilioAdapter implements INotificationAdapter  ← Adapter Pattern
Etapa 7 — Reportes:
PDFExportStrategy implements IExportStrategy   ← Strategy Pattern
ExcelExportStrategy implements IExportStrategy ← Strategy Pattern
Cualquier etapa:
Nuevas estrategias de filtrado para módulos nuevos ← Strategy Pattern
Nuevos factories para entidades nuevas            ← Factory Pattern
