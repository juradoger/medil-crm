# CONVENTIONS.md — MedIL CRM/ERP
> Referencia de convenciones de código del proyecto.
> Leer antes de crear cualquier archivo nuevo.

---

## 1. Idioma
UI visible (labels, botones, títulos, mensajes): español
Comentarios en código:                           español
Nombres de variables y funciones:                inglés
Nombres de archivos y carpetas:                  inglés
Documentación (.md):                             español

Nunca mezclar idiomas dentro de la misma capa.

---

## 2. Nombrado por tipo de archivo
Tipo                    Convención       Ejemplo
────────────────────────────────────────────────────────────
Componente React        PascalCase       PatientForm.jsx
Hook                    camelCase        usePatients.js
Servicio                camelCase        patientService.js
Factory                 PascalCase       PatientFactory.js
Validator               camelCase        patientValidator.js
Rules                   camelCase        appointmentRules.js
Strategy                PascalCase       SortByDateStrategy
Constante               UPPER_SNAKE_CASE HOURS_BEFORE_REMINDER
Función                 camelCase        createPatient()
Variable                camelCase        currentBranchId
Clase                   PascalCase       BillingService
Interface/Contrato      PascalCase con I IPaymentAdapter.js
Test                    mismo nombre     PatientForm.test.jsx

---

## 3. Estructura de un componente React

Todo componente React sigue este orden sin excepción:

```jsx
// 1. Imports externos (React, librerías)
import { useState, useEffect } from 'react';

// 2. Imports de atoms/molecules/organisms
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';

// 3. Imports de hooks, servicios, domain, core
import { usePatients } from '../hooks/usePatients';
import { MESSAGES } from '../core/messages';

// 4. Definición del componente
export function NombreComponente({ prop1, prop2 }) {

  // 5. Estado local (useState)
  const [isOpen, setIsOpen] = useState(false);

  // 6. Hooks de datos
  const { patients, loading } = usePatients(branchId);

  // 7. Efectos (useEffect)
  useEffect(() => {
    // efecto
  }, [dependencia]);

  // 8. Handlers (handle + acción)
  function handleSubmit(data) { }
  function handleDelete(id) { }
  function handleSearch(query) { }

  // 9. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 4. Estructura de un hook

```js
// 1. Imports
import { useState, useEffect } from 'react';
import * as entityService from '../services/entityService';

// 2. Exportación nombrada (nunca default)
export function useNombreHook(branchId) {

  // 3. Estado inicial siempre con estos 3 valores
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 4. withLoading — obligatorio para TODA operación async
  async function withLoading(fn) {
    setLoading(true);
    setError(null);
    try { return await fn(); }
    catch (err) { setError(err.message); throw err; }
    finally { setLoading(false); }
  }

  // 5. Carga inicial
  useEffect(() => {
    withLoading(() => entityService.getAll(branchId));
  }, [branchId]);

  // 6. Operaciones CRUD usando withLoading
  async function createEntity(entityData) {
    return withLoading(async () => {
      const created = await entityService.create(entityData);
      setData(prev => [...prev, created]);
      return created;
    });
  }

  // 7. Retorno explícito — solo lo necesario
  return { data, loading, error, createEntity };
}
```

---

## 5. Estructura de un servicio

```js
// 1. Imports
import { db } from '../lib/insforge';
import { MESSAGES } from '../core/messages';
import { EntidadFactory } from '../domain/factories/EntidadFactory';

// 2. Funciones puras exportadas (sin clase, sin estado)

// Consulta — recibe branchId siempre
export async function getAll(branchId) {
  return db.collection('entidad')
    .where('branchId', '==', branchId)
    .find();
}

export async function getById(id) {
  const results = await db.collection('entidad')
    .where('id', '==', id)
    .find();
  return results[0] ?? null;
}

// Modificación — usa Factory para construir la entidad
export async function create(data) {
  const entity = EntidadFactory.create(data);
  return db.collection('entidad').insert(entity);
}

export async function update(id, data) {
  const updated = EntidadFactory.update(data);
  return db.collection('entidad')
    .where('id', '==', id)
    .update(updated);
}
```

---

## 6. Estructura de un Factory

```js
// 1. Imports solo de core/constants
import { ENTITY_STATUS } from '../../core/constants';

// 2. Objeto exportado con métodos estáticos
export const EntidadFactory = {

  // create: construye entidad nueva con valores por defecto
  create(data) {
    return {
      ...data,
      status: ENTITY_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // update: actualiza solo updatedAt
  update(data) {
    return {
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },
};
```

---

## 7. Reglas estrictas — nunca violar
✗ Nunca strings literales en componentes
MAL:  <Button label="Guardar paciente" />
BIEN: <Button label={MESSAGES.actions.savePatient} />
✗ Nunca colores hardcodeados — usar clases Tailwind de la paleta
MAL:  style={{ backgroundColor: '#00B4D8' }}
BIEN: className="bg-primary"
✗ Nunca console.log en código productivo
Solo en tests con vi.fn() o en desarrollo temporal
✗ Nunca llamar servicios directamente desde componentes
MAL:  const patients = await patientService.getAll(branchId)
BIEN: const { patients } = usePatients(branchId)
✗ Nunca lógica de negocio en componentes
MAL:  if (amount * 0.02 > 10) { ... }
BIEN: if (billingRules.calculateCommission(amount) > 10) { ... }
✗ Nunca números mágicos — usar constants.js
MAL:  dt.setHours(dt.getHours() - 24)
BIEN: dt.setHours(dt.getHours() - HOURS_BEFORE_REMINDER)
✗ Nunca default export en hooks y servicios
MAL:  export default function usePatients() { }
BIEN: export function usePatients() { }
✗ Nunca importar desde components/ui/ (ya no existe)
BIEN: importar desde atoms/, molecules/, organisms/
✗ Nunca hardcodear branchId
MAL:  usePatients('branch_1')
BIEN: usePatients(currentBranchId) — viene de AuthContext

---

## 8. Paleta de colores — clases Tailwind
Color           Hex        Clase Tailwind
──────────────────────────────────────────
Aqua primario   #00B4D8    bg-primary / text-primary
Aqua oscuro     #0096B4    bg-primary-dark / text-primary-dark
Aqua claro      #90E0EF    bg-primary-light
Aqua pálido     #CAF0F8    bg-primary-pale
Fondo base      #F8FAFC    bg-base
Texto oscuro    #1A1A2E    text-dark
Error           #EF4444    bg-error / text-error
Éxito           #10B981    bg-success / text-success
Advertencia     #F59E0B    bg-warning / text-warning
Gris neutro     #6B7280    text-gray / bg-gray

Nunca usar colores fuera de esta paleta sin actualizar este archivo.

---

## 9. Checklist antes de hacer commit
□ npm run test → todos en verde
□ npm run lint → sin errores ni warnings
□ No hay strings literales en componentes
□ No hay console.log fuera de tests
□ No hay lógica de negocio en componentes
□ No hay números mágicos (usar constants.js)
□ No hay importaciones desde components/ui/
□ Todos los archivos nuevos tienen su .test correspondiente
□ Los nombres siguen las convenciones de la sección 2
□ Los mensajes de error vienen de messages.js
