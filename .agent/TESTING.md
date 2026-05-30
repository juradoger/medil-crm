# TESTING.md — MedIL CRM/ERP
> Referencia de estrategia de testing para el proyecto.
> Leer antes de escribir cualquier test o cualquier código nuevo.

---

## 1. ¿Qué es TDD?

TDD (Test-Driven Development) es una metodología de desarrollo
donde el test se escribe ANTES que el código.
No es una forma de verificar que el código funciona.
Es una forma de diseñar el código desde el comportamiento esperado.

### ¿Por qué lo usamos?
- Fuerza a pensar en el comportamiento antes de la implementación
- El código resultante es más simple (solo lo necesario para pasar el test)
- Los tests documentan exactamente qué hace cada función
- Refactorizar es seguro porque los tests detectan regresiones

---

## 2. El ciclo Red → Green → Refactor

### RED — Escribir el test que falla
El test describe el comportamiento esperado.
El código NO existe todavía, por eso el test FALLA (rojo).

```js
// RED: el test existe, la función no
it('calcula total con 2% de comisión', () => {
  const result = billingRules.calculateTotal(100);
  expect(result).toEqual({ subtotal: 100, commission: 2, total: 102 });
});
// ❌ FALLA — billingRules.calculateTotal no existe
```

### GREEN — Escribir el código mínimo para pasar
Escribir SOLO lo necesario para que el test pase.
Nada más. Sin optimizaciones prematuras.

```js
// GREEN: código mínimo que hace pasar el test
export const billingRules = {
  calculateTotal(amount) {
    const commission = amount * 0.02;
    return { subtotal: amount, commission, total: amount + commission };
  }
};
// ✅ PASA
```

### REFACTOR — Mejorar sin romper
Mejorar el código manteniendo los tests en verde.
Aplicar las técnicas de REFACTORING.md.

```js
// REFACTOR: reemplazar magic number por constante
import { QR_COMMISSION_PERCENTAGE } from '../../core/constants';

export const billingRules = {
  calculateTotal(amount) {
    if (amount <= 0) throw new Error('El monto debe ser mayor a cero');
    const commission = amount * QR_COMMISSION_PERCENTAGE;
    return { subtotal: amount, commission, total: amount + commission };
  }
};
// ✅ SIGUE PASANDO + código más limpio
```

### Regla de oro
Nunca escribir código sin tener un test en rojo primero.
Nunca hacer commit con tests en rojo.

---

## 3. Niveles de prueba por Atomic Design

Cada nivel de Atomic Design tiene su tipo de prueba.
El nivel determina qué se prueba y cómo.

---

### ÁTOMOS — Pruebas unitarias puras

**Qué son:** verifican que el componente mínimo
renderiza correctamente y responde a sus props.

**Qué probar:**
- Renderiza con el texto o contenido correcto
- Aplica clases CSS correctas según variante/estado
- Dispara callbacks al interactuar (onClick, onChange)
- No explota con props extremas (prueba de estrés)

**Ejemplo real — Button.test.jsx:**
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button — átomo', () => {
  // Prueba básica de renderizado
  it('renderiza con el label correcto', () => {
    render(<Button label="Guardar" onClick={() => {}} />);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  // Prueba de variante
  it('aplica clase primary por defecto', () => {
    render(<Button label="Test" onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  // Prueba de interacción
  it('llama onClick al hacer click', async () => {
    const onClick = vi.fn();
    render(<Button label="Test" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  // Prueba de estado disabled
  it('no llama onClick cuando está disabled', async () => {
    const onClick = vi.fn();
    render(<Button label="Test" onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  // Prueba de estrés
  it('aguanta label de 500 caracteres', () => {
    render(<Button label={'a'.repeat(500)} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Prueba de estrés
  it('aguanta label null sin explotar', () => {
    render(<Button label={null} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

---

### MOLÉCULAS — Pruebas de integración entre átomos

**Qué son:** verifican que la combinación de átomos
funciona correctamente como unidad.

**Qué probar:**
- Los átomos internos reciben props correctas
- El estado local funciona (open/close, valor)
- Los eventos se propagan correctamente
- Prueba de estrés con datos extremos

**Ejemplo real — StatusBadge.test.jsx:**
```jsx
describe('StatusBadge — molécula', () => {
  it('muestra texto Agendada para status scheduled', () => {
    render(<StatusBadge status="scheduled" type="appointment" />);
    expect(screen.getByText('Agendada')).toBeInTheDocument();
  });

  it('muestra texto Cancelada para status cancelled', () => {
    render(<StatusBadge status="cancelled" type="appointment" />);
    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });

  it('aplica color rojo para status cancelled', () => {
    render(<StatusBadge status="cancelled" type="appointment" />);
    expect(screen.getByText('Cancelada').closest('span'))
      .toHaveClass('bg-red-500');
  });

  // Prueba de estrés
  it('no explota con status desconocido', () => {
    render(<StatusBadge status="unknown_status" type="appointment" />);
    expect(document.body).toBeTruthy();
  });
});
```

---

### ORGANISMOS — Pruebas de componente completo

**Qué son:** verifican que el organismo funciona
correctamente en sus distintos estados.

**Qué probar:**
- Smoke test: renderiza sin errores
- Estado loading: muestra Spinner
- Estado vacío: muestra EmptyState correcto
- Estado con datos: renderiza filas/contenido
- Interacciones: click, submit, búsqueda

**Ejemplo real — DataTable.test.jsx:**
```jsx
const columns = [
  { key: 'fullName', label: 'Nombre' },
  { key: 'status', label: 'Estado' },
];
const mockData = [
  { id: '1', fullName: 'Juan Pérez', status: 'active' },
  { id: '2', fullName: 'Ana García', status: 'inactive' },
];

describe('DataTable — organismo', () => {
  // Smoke test
  it('smoke — renderiza sin errores', () => {
    render(<DataTable columns={columns} data={[]} loading={false} />);
    expect(document.body).toBeTruthy();
  });

  // Estado loading
  it('muestra Spinner cuando loading es true', () => {
    render(<DataTable columns={columns} data={[]} loading={true} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  // Estado vacío
  it('muestra EmptyState cuando data está vacío', () => {
    render(<DataTable columns={columns} data={[]} loading={false}
                      emptyMessage="Sin datos" />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  // Con datos
  it('renderiza filas cuando data tiene elementos', () => {
    render(<DataTable columns={columns} data={mockData} loading={false} />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana García')).toBeInTheDocument();
  });

  // Interacción
  it('llama onRowClick al hacer click en una fila', async () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={mockData}
                      loading={false} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText('Juan Pérez'));
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });
});
```

---

### PÁGINAS — Pruebas de humo

**Qué son:** verifican que la página completa
arranca sin errores y muestra sus elementos principales.
No prueban lógica de negocio.

**Por qué solo smoke tests en páginas:**
Las páginas conectan datos reales con UI.
Probar la lógica completa requeriría mockear
todos los hooks y servicios, lo que hace el test
frágil y difícil de mantener.
La lógica se prueba en hooks y domain.

**Ejemplo real — Dashboard.test.jsx:**
```jsx
// Mockear los hooks para aislar la página
vi.mock('../hooks/usePatients', () => ({
  usePatients: () => ({ patients: [], loading: false, error: null })
}));
vi.mock('../hooks/useAppointments', () => ({
  useAppointments: () => ({ appointments: [], loading: false, error: null })
}));

describe('Dashboard — página', () => {
  it('smoke — renderiza sin errores', () => {
    render(<Dashboard />);
    expect(document.body).toBeTruthy();
  });

  it('muestra el título del dashboard', () => {
    render(<Dashboard />);
    expect(screen.getByText(/panel de control/i)).toBeInTheDocument();
  });

  it('muestra las 4 tarjetas de métricas', () => {
    render(<Dashboard />);
    expect(screen.getAllByTestId('metric-card')).toHaveLength(4);
  });
});
```

---

### HOOKS — Pruebas de lógica de estado

**Qué son:** verifican que el hook maneja
correctamente el estado, loading y error.

**Qué probar:**
- Estado inicial correcto
- loading=true durante operaciones async
- error se actualiza cuando el servicio falla
- data se actualiza con la respuesta del servicio
- Las funciones expuestas son del tipo correcto

**Ejemplo real — usePatients.test.js:**
```js
import { renderHook, waitFor } from '@testing-library/react';
import { usePatients } from './usePatients';
import * as patientService from '../services/patientService';

vi.mock('../services/patientService');

describe('usePatients — hook', () => {
  it('inicia con estado correcto', () => {
    patientService.getAll.mockResolvedValue([]);
    const { result } = renderHook(() => usePatients('branch_1'));
    expect(result.current.patients).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('carga pacientes al montar', async () => {
    const mockPatients = [{ id: '1', fullName: 'Juan' }];
    patientService.getAll.mockResolvedValue(mockPatients);
    const { result } = renderHook(() => usePatients('branch_1'));
    await waitFor(() => {
      expect(result.current.patients).toEqual(mockPatients);
    });
  });

  it('actualiza error cuando el servicio falla', async () => {
    patientService.getAll.mockRejectedValue(new Error('Error de red'));
    const { result } = renderHook(() => usePatients('branch_1'));
    await waitFor(() => {
      expect(result.current.error).toBe('Error de red');
    });
  });
});
```

---

### DOMAIN — Pruebas de reglas de negocio

**Qué son:** las más importantes del sistema.
Prueban la lógica pura sin mocks de servicios externos.

**Qué probar:**
- Factories crean entidades con valores correctos
- Validators retornan errores correctos
- Rules respetan las reglas del negocio

**Ejemplo real — billingRules.test.js:**
```js
describe('billingRules — domain', () => {
  it('calculateTotal(100) → subtotal 100, comisión 2, total 102', () => {
    expect(billingRules.calculateTotal(100)).toEqual({
      subtotal: 100, commission: 2, total: 102,
    });
  });

  it('lanza error cuando amount es 0', () => {
    expect(() => billingRules.calculateTotal(0))
      .toThrow('El monto debe ser mayor a cero');
  });

  it('lanza error cuando amount es negativo', () => {
    expect(() => billingRules.calculateTotal(-50)).toThrow();
  });
});
```

---

## 4. Pruebas de estrés por átomo

Todo átomo debe tener prueba de estrés.
Verifican que el componente no explota con valores extremos.

**Los 5 casos de estrés obligatorios:**

string vacío:          prop=""
string de 500 chars:   prop={'a'.repeat(500)}
null:                  prop={null}
undefined:             prop={undefined}
caracteres especiales: prop='<script>alert("xss")</script>'


**Ejemplo:**
```jsx
describe('Input — pruebas de estrés', () => {
  it('aguanta value vacío', () => {
    render(<Input value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  it('aguanta value de 500 caracteres', () => {
    render(<Input value={'a'.repeat(500)} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  it('aguanta value null', () => {
    render(<Input value={null} onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  it('aguanta caracteres especiales', () => {
    render(<Input value='<script>alert("xss")</script>' onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

---

## 5. Pruebas de humo

Una prueba de humo verifica que algo arranca sin explotar.
No verifica comportamiento, verifica estabilidad.

**Cuándo usar:**
- En páginas completas (demasiado complejas para probar exhaustivamente)
- Después de refactorizaciones grandes
- Como primera prueba de cualquier componente nuevo

**Ejemplo:**
```jsx
it('smoke — DoctorConsole renderiza sin errores', () => {
  render(<DoctorConsole />);
  expect(document.body).toBeTruthy();
});
```

---

## 6. Cobertura mínima requerida
atoms/:          90%  → componentes base, alta reutilización
molecules/:      85%  → combinaciones, muchos casos posibles
organisms/:      80%  → complejos pero con smoke tests
hooks/:          85%  → lógica de estado crítica
domain/:         95%  → reglas de negocio, cero margen de error
services/:       70%  → dependen de InsForge, difíciles de mockear
pages/:          60%  → solo smoke tests + elementos principales

---

## 7. Reglas de mocks
✓ Nunca usar InsForge real en tests
→ vi.mock('../lib/insforge')
✓ Siempre mockear servicios en tests de hooks
→ vi.mock('../services/patientService')
✓ Siempre mockear hooks en tests de páginas
→ vi.mock('../hooks/usePatients', () => ({ usePatients: () => mockData }))
✓ Siempre mockear AuthContext en tests de páginas protegidas
→ vi.mock('../context/AuthContext', () => ({ useAuth: () => mockUser }))
✗ Nunca mockear domain/ (es código puro, no necesita mocks)
✗ Nunca hacer fetch real en tests
✗ Nunca depender del orden de ejecución de tests

---

## 8. Estructura de archivos de test

Mismo nombre que el archivo fuente, misma carpeta:
atoms/Button.jsx              → atoms/Button.test.jsx
molecules/StatusBadge.jsx     → molecules/StatusBadge.test.jsx
organisms/DataTable.jsx       → organisms/DataTable.test.jsx
hooks/usePatients.js          → hooks/usePatients.test.js
domain/rules/billingRules.js  → domain/rules/billingRules.test.js

---

## 9. Checklist antes de hacer commit
□ Cada archivo nuevo tiene su .test correspondiente
□ npm run test → todos en verde
□ npm run test:coverage → cobertura dentro de los mínimos
□ No hay tests comentados
□ No hay it.skip() sin justificación documentada
□ Los mocks están limpiados con afterEach o beforeEach
□ Los tests tienen nombres descriptivos en español
