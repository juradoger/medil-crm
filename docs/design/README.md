# MedIL — Design System

**MedIL** es un **Sistema de Gestión Clínica CRM/ERP** para clínicas médicas multisucursal. Es una aplicación web modular construida como **Línea de Producto de Software (SPL)** para el sector salud: permite a una clínica gestionar pacientes, citas, historial clínico, recordatorios, facturación, insumos y sucursales desde una sola plataforma, y adaptarse a distintas especialidades (odontología, fisioterapia, pediatría…) sin reescribir el núcleo.

Toda la interfaz está en **español**. La estética es **minimalista, limpia y profesional-médica**: blanco dominante, aqua como color de marca, azul corporativo para jerarquía, y feedback de estado por color (agendada / atendida / cancelada / pendiente). El producto sigue heurísticas de Nielsen de forma explícita: spinner en toda operación asíncrona (H1), modal de confirmación en toda acción destructiva (H3), y un diseño sobrio y reconocible (H8).

> Este design system es la fuente de verdad para crear interfaces, mocks y prototipos de marca MedIL. Lee este README y explora los archivos listados en el **Índice** al final.

---

## Fuentes (entradas usadas para construir este sistema)

No asumas que el lector tiene acceso a estas fuentes; quedan registradas por si lo tiene:

- **Codebase frontend** (montado, solo lectura): `frontend/` — React 19 + Vite 8 + TailwindCSS v4 + React Router v7. Atomic Design (`atoms/ → molecules/ → organisms/ → templates/ → pages/`). **Esta fue la fuente de verdad principal.**
- **Repositorio GitHub:** https://github.com/juradoger/medil-crm — contiene el README del producto, documentación de arquitectura (`docs/`, `.agent/`) y la app completa. *Explóralo para entender el dominio a fondo y construir diseños más fieles.*
- **Logo:** `uploads/logo.png` (original 2816×1536) → optimizado en `assets/logo-web.png`.

**Stack real:** React 19, Vite 8, TailwindCSS v4 (tokens vía `@theme`), React Router v7, InsForge SDK (backend), Vitest (testing), Vercel (deploy).

> **Nota de fidelidad — colores:** El brief de marca mencionó variantes adicionales (`#0096B4`, `#90E0EF`, `#CAF0F8`, fondo `#F8FAFC`, texto `#1A1A2E`). Los tokens oficiales en `frontend/src/index.css` son: aqua `#00B4D8`, navy `#0E4A8A`, accent verde `#00A896`, alert `#FFD100`, fondo blanco. He tomado **el código como fuente de verdad** e incorporado las variantes del brief como tints de apoyo. Ver `colors_and_type.css`.

---

## CONTENT FUNDAMENTALS — cómo se escribe el copy

**Idioma:** 100% español (es-ES/es-LA neutro). Nunca mezclar inglés en la UI visible. Los comentarios de código son bilingües, pero **eso no llega al usuario**.

**Voz y persona:** Institucional, claro, directo. El sistema le habla al profesional de salud (admin/doctor) de forma neutra y funcional — **no** usa "tú" ni "usted" explícitos; prefiere **construcciones impersonales y sustantivadas**:
- Títulos = sustantivo o sintagma: `Pacientes`, `Citas`, `Panel de Control`, `Recordatorios`, `Consola Médica`, `Mi Portal`.
- Acciones = verbo en infinitivo o imperativo corto: `Guardar`, `Cancelar`, `Agendar`, `Ingresar`, `Cerrar sesión`, `+ Nuevo`, `+ Nueva cita`.
- Confirmaciones destructivas = **pregunta** + consecuencia: `¿Desactivar paciente?` → "{nombre} pasará a estado inactivo"; `¿Cancelar cita?` → "Esta acción no se puede deshacer".

**Casing:** Los títulos de página/modal usan **Mayúscula Inicial por Palabra** en sustantivos clave (`Nuevo Paciente`, `Panel de Control`, `Consola Médica`) — aunque títulos simples de una palabra van capitalizados (`Pacientes`, `Citas`). Las **etiquetas de tabla/overline** van en `MAYÚSCULAS` con tracking ancho (`NOMBRE`, `TELÉFONO`, `ESTADO`). Los labels de formulario en Mayúscula inicial de oración: `Nombre completo`, `Correo electrónico`, `Fecha de nacimiento`.

**Estados (StatusBadge) — etiquetas canónicas:** `Agendada`, `Atendida`, `Cancelada`, `Pendiente` / `Pago pendiente`, `Enviado`, `Activo`, `Inactivo`, `Stock bajo`, `Crítico`, `Aprobado`, `Rechazado`. Siempre adjetivo/participio en femenino para citas (la cita), masculino para paciente/pago según el sustantivo.

**Microcopy:**
- Placeholders concretos y realistas: `correo@medil.com`, `Ej: Dra. Carmen Solís`, `Buscar por nombre…`, `Buscar en tabla…`.
- Estados de carga reescriben el botón: `Ingresando…`, `Guardando…` (con elipsis tipográfica `…`, **no** tres puntos).
- Estados vacíos en tono neutro y breve: `Sin pacientes registrados`, `Sin citas para hoy`, `Sin datos`.
- Errores directos, sin culpar: `El nombre es obligatorio`, `Correo inválido`, `El CI es obligatorio`.
- Campos obligatorios marcados con asterisco rojo `*`.

**Emoji:** **No.** No se usan emoji en la UI del producto. (Aparecen solo como adornos en el README del repo, no en la app.) Los íconos son SVG de trazo.

**Vibe:** Confiable, sobrio, eficiente. Cero jerga de marketing, cero signos de exclamación, cero tono "amigable de startup". Es software clínico: la claridad y la calma priman sobre la personalidad.

---

## VISUAL FOUNDATIONS

**Color & uso.** Blanco es la superficie dominante; el fondo del área de contenido es gris muy claro (`gray-50`, `#F9FAFB`). El **aqua `#00B4D8`** es el color de marca y de acción: botón primario, item de navegación activo, anillo de foco (`focus:ring-2 ring-[#00B4D8]`), avatares, y badge "agendada". El **navy `#0E4A8A`** es jerarquía y texto de marca: todos los H1 de página, los items de nav inactivos, el email del usuario en el sidebar. El verde `#00A896`/`green-500` = éxito, el rojo `#EF4444` = destructivo/error, el naranja/ámbar = pendiente, el amarillo `#FFD100` = el punto de la "i" del logo y avisos puntuales. El color **se usa con moderación** — la mayoría de la pantalla es blanco/gris/texto, con aqua como acento.

**Tipografía.** La marca usa **Nunito Sans** como webfont (variable, pesos 200–1000), servida localmente desde `fonts/`. Es una sans humanista, redondeada y legible — cálida pero profesional, apropiada para salud. Como respaldo cae al stack de sistema (`ui-sans-serif, system-ui…`). *Nota: el codebase original no declaraba webfont propia y usaba el stack de sistema por defecto de Tailwind v4; Nunito Sans fue aportada por el dueño de marca y es ahora la familia oficial de este design system.* Escala real en uso: H1 página `text-2xl` (24px) bold navy; número de métrica `text-3xl` (30px) bold; título de modal `text-lg` (18px) semibold gris-800; cuerpo/inputs/celdas `text-sm` (14px); badges, overlines y acciones de tabla `text-xs` (12px); overlines en `uppercase` con `tracking-wide`. Pesos: 400 cuerpo, 500 medium (labels, items nav), 600 semibold (títulos sección/modal), 700 bold (H1, métricas).

**Espaciado & layout.** Escala de 4px (Tailwind). Páginas en contenedor `max-w-6xl mx-auto`, padding `p-6`, secciones separadas con `space-y-6`/`space-y-8`. Tarjetas con padding `p-5`/`p-6`. Métricas en grid de 2 (móvil) → 4 (desktop) con `gap-4`. El layout principal es **TopBar fija arriba + Sidebar como drawer** (overlay deslizante de 256px, no fijo) + contenido scrollable sobre `gray-50`. La consola médica usa **SplitScreen** (panel izquierdo ~40% + derecho ~60%).

**Fondos.** Planos. Sin imágenes de fondo, sin full-bleed, sin ilustraciones dibujadas a mano, sin patrones repetidos, sin texturas. **Sin gradientes** en superficies de producto (el único gradiente de la marca vive dentro del logo). El fondo del login es un aqua translúcido muy suave (`bg-[#00B4D8]/10`) o `gray-50`.

**Bordes.** Hairlines de 1px en gris: `border-gray-100` para tarjetas, `border-gray-200` para inputs y divisores, `divide-y divide-gray-100/50` en tablas. Inputs con borde gris que al foco muestran `ring-2` aqua y borde transparente.

**Radios (corner radius).** `rounded-lg` (8px) en botones, inputs e items de nav; `rounded-xl` (12px) en tarjetas, modales y el contenedor de tabla; `rounded-2xl` (16px) en la tarjeta de login y los toasts; `rounded-full` en badges, chips de filtro y avatares.

**Sombras (elevación).** Sistema Tailwind: `shadow-sm` en tarjetas, TopBar y filas; `shadow-lg` en toasts; `shadow-xl` en la tarjeta de login; `shadow-2xl` en modales. Sin sombras internas, sin neumorfismo. La elevación es sutil y fría.

**Tarjetas (anatomía).** Fondo blanco + `border border-gray-100` + `shadow-sm` + `rounded-xl` + padding `p-5`. La métrica = overline en mayúsculas (gris-500) sobre número grande bold (navy o color de acento según semántica).

**Botones.** `rounded-lg`, `font-medium`, `transition-colors`, `inline-flex items-center justify-center gap-2`. Variantes: **primary** = aqua sólido, texto blanco, hover aqua-oscuro `#0096B4`; **danger** = rojo `red-500`, hover `red-600`; **ghost** = borde aqua + texto aqua, hover `aqua/10`; **secondary** = `gray-100`, texto `gray-700`, hover `gray-200`. Tamaños sm/md/lg. `disabled` → `opacity-50 cursor-not-allowed`. Botón cargando muestra **Spinner** inline.

**Estados hover/press.** Hover = **oscurecer** el relleno (primario/danger) o **teñir suave** (`/10`, `blue-50`, `gray-200`) en superficies claras. Filas de tabla: hover `bg-blue-50/30`. Items de nav inactivos: hover `bg-blue-50`. No hay efecto de "press"/scale; la interacción es por cambio de color con `transition-colors`. Foco siempre visible con `ring-2` aqua.

**Animación.** Mínima y funcional. `transition-colors` en hovers; Spinner con `animate-spin`; Toast entra con un `slideInFromRight` de 0.3s `ease-out` y auto-cierra a los 3s. Sin bounces, sin parallax, sin micro-animaciones decorativas. Easing por defecto del navegador.

**Transparencia & blur.** Casi nula. Overlays de modal/drawer usan `bg-black/40` (negro al 40%, sin blur). Badges usan el color de marca al 10% como fondo. No hay glassmorphism ni backdrop-blur.

**Imágenes.** El producto no usa fotografía. El único activo gráfico es el logo (corazón con línea de pulso/latido + wordmark "MedIL" en degradado navy→teal con el punto de la "i" amarillo). Paleta del logo: fría (azules y verde-azulados) con un único acento cálido (amarillo).

---

## ICONOGRAPHY

**Sistema:** íconos **SVG inline de trazo** (outline), estilo **Heroicons**. `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `viewBox="0 0 24 24"`. **Grosor de trazo `2`** para íconos de UI (lupa, X, hamburguesa, logout) y `1.5` para la ilustración del estado vacío. El color hereda del texto (`currentColor`), normalmente gris (`gray-400` en placeholders, navy en acciones).

**No hay icon font ni sprite propio.** (El `frontend/public/icons.svg` del repo es un sprite **del template Vite** — bluesky/discord/github — y **no** pertenece a MedIL; igual que `favicon.svg`, que es el morado de Vite. No usarlos.) Los íconos viven inline en cada componente.

**Íconos en uso (todos Heroicons outline):** lupa (`SearchBar`), X de cierre (`Toast`, modales, drawer), hamburguesa de 3 líneas (`TopBar`), salida/logout (`Sidebar`), y un ícono de "imagen/galería" como glifo del estado vacío (`EmptyState`). Las acciones de tabla (`Ver`, `Editar`, `Desactivar`, `Atendida`, `Cancelar`) son **texto**, no íconos.

**Recomendación para recreaciones:** usa **Heroicons** (https://heroicons.com) — outline, 24px, stroke-2 — que es exactamente el estilo del codebase. En estas recreaciones cargamos Heroicons como SVG inline para fidelidad 1:1. Emoji y caracteres unicode **no** se usan como íconos (excepto las flechas `↑`/`↓` de ordenamiento de tabla, que sí son unicode).

**Logo:** `assets/logo-web.png`. Se muestra a `h-14`/`h-16`/`h-20` (sidebar / topbar / login). Tiene fondo blanco (no transparente) — usar siempre sobre superficies blancas o muy claras.

---

## VISUAL FOUNDATIONS — resumen rápido (tokens)

| Token | Valor | Uso |
|---|---|---|
| Aqua primario | `#00B4D8` | Acción, activo, foco, marca |
| Aqua hover | `#0096B4` | Hover de botón primario |
| Navy | `#0E4A8A` | Títulos, nav, texto de marca |
| Verde acento | `#00A896` / `#10B981` | Éxito, atendida, activo |
| Rojo | `#EF4444` | Destructivo, cancelada, error |
| Ámbar | `#F59E0B` | Pendiente, stock bajo |
| Amarillo | `#FFD100` | Punto del logo, avisos |
| Fondo app | `#F9FAFB` | Área de contenido |
| Radio botón/input | 8px | `rounded-lg` |
| Radio tarjeta/modal | 12px | `rounded-xl` |
| Fuente | Nunito Sans (variable) | Webfont de marca, fallback system-ui |

---

## ÍNDICE — manifiesto de archivos

**Raíz:**
- `README.md` — este documento (contexto, contenido, fundamentos visuales, iconografía, índice).
- `colors_and_type.css` — tokens CSS de color, tipografía, espaciado, radios y sombras (base + semánticos).
- `SKILL.md` — guía para usar este sistema como Agent Skill.

**Carpetas:**
- `assets/` — `logo-web.png` (logo optimizado), `logo.png` (original a 640px).
- `preview/` — tarjetas HTML del Design System (colores, tipografía, espaciado, componentes, marca). Se registran como cards en la pestaña Design System.
- `ui_kits/medil-crm/` — UI kit de alta fidelidad: recreación interactiva de **10 pantallas** (Login, Dashboard, Pacientes, Citas, Consola Médica, Portal Paciente, Recordatorios, Sucursales, Facturación con pago QR, Insumos) con componentes JSX reutilizables y navegación filtrada por rol. Abre `index.html`.

**Productos representados:** un único producto — la **app web MedIL CRM/ERP** (no hay sitio de marketing ni docs públicas). Por eso hay un solo UI kit.
