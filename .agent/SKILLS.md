# SKILLS.md — MedIL CRM/ERP
> Índice de referencia para agentes IA y desarrolladores.
> Leer ESTE archivo primero. Indica exactamente qué leer según la tarea.

---

## Lectura mínima por tipo de tarea

### Crear un átomo (Button, Input, Badge, etc.)
Leer: ARCHITECTURE.md → sección 2 (nivel ÁTOMO)
CONVENTIONS.md → sección 2, 3, 8
TESTING.md → sección 3 (Átomos) + sección 4 (estrés)
UX.md → sección 1 (H4, H5)

### Crear una molécula (FormField, SearchBar, etc.)
Leer: ARCHITECTURE.md → sección 2 (nivel MOLÉCULA)
CONVENTIONS.md → sección 2, 3
TESTING.md → sección 3 (Moléculas)
UX.md → sección 1 (H1, H3, H4, H5)

### Crear un organismo (DataTable, PatientForm, etc.)
Leer: ARCHITECTURE.md → sección 2 (nivel ORGANISMO)
CONVENTIONS.md → sección 2, 3
TESTING.md → sección 3 (Organismos)
UX.md → sección 1 (H1, H3, H4, H5, H9) + sección 2
DOMAIN.md → reglas del módulo correspondiente

### Crear una página
Leer: ARCHITECTURE.md → sección 2 (nivel PÁGINA) + sección 3
CONVENTIONS.md → sección 2, 3
TESTING.md → sección 3 (Páginas — smoke tests)
UX.md → completo
DOMAIN.md → reglas del módulo de la página
WORKFLOWS.md → flujo correspondiente a la página

### Crear un hook
Leer: ARCHITECTURE.md → sección 3 (src/hooks/)
CONVENTIONS.md → sección 4
TESTING.md → sección 3 (Hooks)
DOMAIN.md → reglas del módulo
DATABASE.md → patrón de acceso InsForge

### Crear un servicio
Leer: ARCHITECTURE.md → sección 3 (src/services/)
CONVENTIONS.md → sección 5
DATABASE.md → completo
DOMAIN.md → reglas del módulo + valores por defecto

### Crear un caso de uso (backend)
Leer: ARCHITECTURE.md → sección 4 (Clean Architecture backend)
DOMAIN.md → reglas del módulo + invariantes
DATABASE.md → schema de las colecciones involucradas
TESTING.md → sección 3 (Domain)
PATTERNS.md → sección Factory Pattern

### Aplicar un patrón de diseño
Leer: PATTERNS.md → sección del patrón específico
ARCHITECTURE.md → sección 3 (regla de dependencias)

### Implementar un flujo completo
Leer: WORKFLOWS.md → flujo correspondiente
DOMAIN.md → reglas de negocio del módulo
DATABASE.md → colecciones involucradas
UX.md → heurísticas aplicables al flujo

### Detectar y resolver un bad smell
Leer: ARCHITECTURE.md → sección 6 (bad smells)
REFACTORING.md → técnica correspondiente
TESTING.md → sección 2 (regla de oro)

### Escribir un mensaje de UI
Leer: UX.md → sección 2 (mensajes)
UX.md → sección 1 (H2, H9)
CONVENTIONS.md → sección 1 (idioma)

### Implementar validación de formulario
Leer: UX.md → sección 1 (H5 — prevención de errores)
DOMAIN.md → validaciones del módulo
ARCHITECTURE.md → sección 3 (src/domain/validators/)

---

## Checklist completo antes de hacer commit
CÓDIGO
□ npm run test → todos en verde
□ npm run lint → sin errores ni warnings
□ npm run test:coverage → cobertura dentro de los mínimos
ARQUITECTURA
□ El archivo está en la carpeta correcta según Atomic Design
□ No viola la regla de dependencias (ARCHITECTURE.md sección 3)
□ No hay bad smells nuevos (ARCHITECTURE.md sección 6)
CÓDIGO LIMPIO
□ No hay strings literales → usar MESSAGES
□ No hay números mágicos → usar constants.js
□ No hay console.log fuera de tests
□ No hay lógica de negocio en componentes
□ Los servicios usan Factories para construir entidades
□ Los hooks usan withLoading() para operaciones async
TESTS
□ Cada archivo nuevo tiene su .test correspondiente
□ Los átomos tienen pruebas de estrés
□ Las páginas tienen smoke test
□ Los hooks tienen prueba de estado inicial
UX (Nielsen)
□ H1: toda operación async tiene feedback visual (Spinner o Toast)
□ H2: los mensajes usan lenguaje del usuario, no técnico
□ H3: toda acción destructiva tiene ConfirmModal
□ H4: los componentes se comportan igual en todas las pantallas
□ H5: los formularios previenen errores con validación en tiempo real
□ H9: los mensajes de error explican qué pasó y qué hacer
MENSAJES
□ Los mensajes de error vienen de messages.js
□ Los mensajes usan lenguaje natural en español
□ Los EmptyState describen qué hay que hacer

---

## Cómo usar este archivo al inicio de una sesión

Al comenzar una sesión de desarrollo con un agente IA:
"Lee .agent/SKILLS.md y luego [descripción de la tarea]"

El agente leerá SKILLS.md, identificará qué archivos
adicionales necesita según la tarea, los leerá,
y trabajará bajo todas las reglas del proyecto
sin que tengas que explicarlas nuevamente.
