# Justificación Técnica del Stack / Technical Stack Justification

---

## React 18 + Vite

<details open>
<summary>🇪🇸 Español</summary>

React 18 permite construir interfaces basadas en componentes reutilizables e independientes, lo que alinea directamente con el principio de **alta cohesión**: cada componente tiene una responsabilidad única y bien definida. El modelo de composición de React facilita el **bajo acoplamiento** entre vistas, ya que los componentes se comunican a través de props y hooks sin dependencias directas entre módulos.

Vite actúa como build tool con Hot Module Replacement (HMR), eliminando el ciclo lento de compilación tradicional. Para un proyecto académico iterativo, esto reduce la fricción y permite concentrarse en la lógica de dominio en lugar de en la infraestructura de desarrollo.

**Principio aplicado:** Alta cohesión — cada componente encapsula un único concepto del dominio (ej. `StatusBadge` solo gestiona la representación visual de un estado).

</details>

<details>
<summary>🇬🇧 English</summary>

React 18 enables building interfaces based on reusable, independent components, which directly aligns with the **high cohesion** principle: each component has a single, well-defined responsibility. React's composition model facilitates **low coupling** between views, as components communicate through props and hooks without direct module dependencies.

Vite acts as a build tool with Hot Module Replacement (HMR), eliminating the slow traditional compilation cycle. For an iterative academic project, this reduces friction and allows focus on domain logic rather than development infrastructure.

**Applied principle:** High cohesion — each component encapsulates a single domain concept (e.g., `StatusBadge` only manages the visual representation of a status).

</details>

---

## TailwindCSS

<details open>
<summary>🇪🇸 Español</summary>

TailwindCSS proporciona clases de utilidad atómicas que se componen directamente en el JSX. Esto elimina la necesidad de archivos CSS por componente, reduciendo el número de archivos a mantener y aumentando la **cohesión** del componente (estilo y lógica en el mismo lugar). Al ser una biblioteca de diseño, no impone opiniones sobre la arquitectura de la aplicación, preservando el **bajo acoplamiento** con el resto del stack.

Para una línea de producto de software, TailwindCSS permite que los tokens de diseño (colores, espaciado) se centralicen en `index.css` con `@theme`, facilitando la adaptación visual de cada variante del CRM (dental, pediátrico, etc.) sin modificar la lógica de los componentes.

</details>

<details>
<summary>🇬🇧 English</summary>

TailwindCSS provides atomic utility classes composed directly in JSX. This eliminates the need for per-component CSS files, reducing the number of files to maintain and increasing component **cohesion** (style and logic in the same place). As a design library, it does not impose opinions on application architecture, preserving **low coupling** with the rest of the stack.

For a software product line, TailwindCSS allows design tokens (colors, spacing) to be centralized in `index.css` using `@theme`, making visual adaptation of each CRM variant (dental, pediatric, etc.) possible without modifying component logic.

</details>

---

## React Router v6

<details open>
<summary>🇪🇸 Español</summary>

React Router v6 implementa enrutamiento declarativo del lado del cliente mediante el componente `<Routes>` y el hook `useParams`. Cada módulo del CRM (Pacientes, Citas, Historial, Recordatorios) corresponde a una ruta independiente, lo que refuerza el principio de **modularidad**: agregar una nueva especialidad o módulo implica únicamente añadir una ruta y su vista correspondiente, sin modificar el resto de la aplicación.

El uso de `<Outlet>` y rutas anidadas en versiones futuras permitirá estructuras de navegación jerárquicas (ej. `/patients/:id/records`) sin acoplamiento adicional.

</details>

<details>
<summary>🇬🇧 English</summary>

React Router v6 implements declarative client-side routing via the `<Routes>` component and `useParams` hook. Each CRM module (Patients, Appointments, Records, Reminders) corresponds to an independent route, reinforcing the **modularity** principle: adding a new specialty or module only requires adding a route and its corresponding view, without modifying the rest of the application.

The use of `<Outlet>` and nested routes in future versions will enable hierarchical navigation structures (e.g., `/patients/:id/records`) without additional coupling.

</details>

---

## InsForge

<details open>
<summary>🇪🇸 Español</summary>

InsForge actúa como backend integrado y base de datos del sistema. Su elección se justifica por la reducción de la superficie de configuración: en un proyecto académico, configurar un servidor REST independiente (Express, Django, etc.) con una base de datos relacional separada (PostgreSQL, MySQL) agregaría complejidad operacional que distrae del objetivo principal de la materia: diseño de software, principios de ingeniería y líneas de producto.

InsForge encapsula la capa de persistencia detrás de una interfaz uniforme, lo que permite que los `*Service.js` del backend sean el único punto de contacto con la base de datos (**principio de responsabilidad única** en la capa de datos).

</details>

<details>
<summary>🇬🇧 English</summary>

InsForge acts as the integrated backend and database of the system. Its selection is justified by the reduction of configuration surface: in an academic project, configuring an independent REST server (Express, Django, etc.) with a separate relational database (PostgreSQL, MySQL) would add operational complexity that distracts from the main course objective: software design, engineering principles, and product lines.

InsForge encapsulates the persistence layer behind a uniform interface, allowing the backend `*Service.js` files to be the single point of contact with the database (**single responsibility principle** at the data layer).

</details>

---

## Mermaid

<details open>
<summary>🇪🇸 Español</summary>

Mermaid genera diagramas a partir de texto plano integrado en archivos Markdown. Al vivir en el mismo repositorio que el código, los diagramas de arquitectura y flujo se actualizan junto con cada commit, evitando la desincronización frecuente entre documentación y código (el problema del "diagrama que ya no refleja la realidad").

GitHub renderiza Mermaid de forma nativa en los archivos `.md`, lo que elimina herramientas externas para visualización y mantiene el proyecto completamente autocontenido.

</details>

<details>
<summary>🇬🇧 English</summary>

Mermaid generates diagrams from plain text embedded in Markdown files. By living in the same repository as the code, architecture and flow diagrams are updated with each commit, avoiding the frequent desynchronization between documentation and code (the "diagram that no longer reflects reality" problem).

GitHub renders Mermaid natively in `.md` files, eliminating external visualization tools and keeping the project completely self-contained.

</details>

---

## Principios que Guían el Stack / Guiding Principles for the Stack

| Principio / Principle | Cómo lo aplica el stack / How the stack applies it |
|---|---|
| **Modularidad / Modularity** | Cada tecnología tiene una responsabilidad única: React para la vista, Router para la navegación, InsForge para la persistencia — Each technology has a single responsibility: React for the view, Router for navigation, InsForge for persistence |
| **Bajo acoplamiento / Low coupling** | Los módulos de dominio se comunican únicamente a través de interfaces de servicio, nunca directamente entre sí — Domain modules communicate only through service interfaces, never directly with each other |
| **Alta cohesión / High cohesion** | Cada componente, hook y servicio encapsula exactamente una responsabilidad del dominio — Each component, hook, and service encapsulates exactly one domain responsibility |
| **Reutilización / Reuse** | Los servicios de backend y los hooks de frontend son transferibles entre variantes del CRM sin modificación — Backend services and frontend hooks are transferable across CRM variants without modification |
