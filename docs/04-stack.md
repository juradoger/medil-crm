[![English](https://img.shields.io/badge/Language-English-0E4A8A?style=flat-square)](04-stack.en.md)
[![README](https://img.shields.io/badge/←_Inicio-README-00A896?style=flat-square)](../README.es.md)
![Doc](https://img.shields.io/badge/doc-04%20de%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# 🛠️ Justificación Técnica del Stack

*Cada tecnología elegida por principios de ingeniería de software, no por tendencia*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-00A896?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## React 18 + Vite

![Principio](https://img.shields.io/badge/Principio-Alta_Cohesión-00A896?style=flat-square)

React 18 permite construir interfaces basadas en componentes reutilizables e independientes, alineándose directamente con el principio de **alta cohesión**: cada componente tiene una responsabilidad única y bien definida. El modelo de composición facilita el **bajo acoplamiento** entre vistas, ya que los componentes se comunican a través de props y hooks sin dependencias directas entre módulos.

Vite actúa como build tool con Hot Module Replacement (HMR), eliminando el ciclo lento de compilación tradicional. Para un proyecto académico iterativo, esto reduce la fricción y permite concentrarse en la lógica de dominio.

> **Principio aplicado:** Alta cohesión — `StatusBadge` solo gestiona la representación visual de un estado; `usePatients` solo gestiona el estado de la lista de pacientes.

---

## TailwindCSS v4

![Principio](https://img.shields.io/badge/Principio-Bajo_Acoplamiento-00A896?style=flat-square)

TailwindCSS proporciona clases de utilidad atómicas compuestas directamente en el JSX. Esto elimina la necesidad de archivos CSS por componente, aumentando la **cohesión** (estilo y lógica en el mismo lugar) y preservando el **bajo acoplamiento** con el resto del stack.

Para la SPL, los tokens de diseño se centralizan en `index.css` con `@theme`, facilitando la adaptación visual de cada variante del CRM sin tocar la lógica de los componentes.

```css
@import "tailwindcss";

@theme {
  --color-primary:    #0E4A8A;  /* Azul Corporativo */
  --color-accent:     #00A896;  /* Verde Aqua */
  --color-alert:      #FFD100;  /* Amarillo — recordatorios */
  --color-background: #FFFFFF;  /* Blanco Puro */
}
```

---

## React Router v6

![Principio](https://img.shields.io/badge/Principio-Modularidad-00A896?style=flat-square)

React Router v6 implementa enrutamiento declarativo del lado del cliente. Cada módulo del CRM corresponde a una ruta independiente, lo que refuerza la **modularidad**: agregar una nueva especialidad implica únicamente añadir una ruta y su vista, sin modificar el resto de la aplicación.

| Ruta | Módulo |
|:---|:---|
| `/` | Dashboard |
| `/patients` | Gestión de Pacientes |
| `/appointments` | Gestión de Citas |
| `/reminders` | Recordatorios |
| `/patients/:id` | Detalle del Paciente |

---

## InsForge

![Principio](https://img.shields.io/badge/Principio-Responsabilidad_Única-00A896?style=flat-square)

InsForge actúa como backend integrado y base de datos del sistema. Su elección reduce la superficie de configuración: en un proyecto académico, configurar un servidor REST independiente agregaría complejidad que distrae del objetivo principal — diseño de software, principios de ingeniería y líneas de producto.

InsForge encapsula la capa de persistencia detrás de una interfaz uniforme, permitiendo que los `*Service.js` sean el único punto de contacto con la base de datos (**principio de responsabilidad única** en la capa de datos).

---

## Vercel

![Principio](https://img.shields.io/badge/Principio-Bajo_Acoplamiento_CI%2FCD-00A896?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Automático_en_push-000000?style=flat-square&logo=vercel&logoColor=white)

Vercel es la plataforma de despliegue seleccionada para el frontend de MediL CRM. Su integración nativa con GitHub permite que cada push a `main` despliegue automáticamente una nueva versión de la aplicación, eliminando pasos manuales de build y publicación.

**Beneficios para el proyecto:**

| Característica | Valor para MediL CRM |
|:---|:---|
| Despliegue automático | Cada commit a `main` publica la app sin intervención manual |
| Preview por PR | Cada Pull Request genera una URL de previsualización |
| CDN global | Tiempos de carga mínimos sin configuración adicional |
| Tier gratuito | Cubre completamente el alcance del proyecto académico |

> **Principio aplicado:** Bajo acoplamiento entre el ciclo de desarrollo y el ciclo de despliegue — el desarrollador no necesita conocer la infraestructura de producción para publicar cambios.

---

## Mermaid

![Principio](https://img.shields.io/badge/Principio-Documentación_como_Código-00A896?style=flat-square)

Mermaid genera diagramas a partir de texto plano en archivos Markdown. Al vivir en el mismo repositorio que el código, los diagramas se actualizan con cada commit, evitando la desincronización entre documentación y código.

GitHub renderiza Mermaid de forma nativa en los archivos `.md`, eliminando herramientas externas y manteniendo el proyecto completamente autocontenido.

---

## Resumen de Principios

| Principio | Cómo lo aplica el stack |
|:---|:---|
| **Modularidad** | React para la vista · Router para la navegación · InsForge para la persistencia · Vercel para el despliegue |
| **Bajo acoplamiento** | Módulos de dominio comunicados solo por interfaces de servicio; despliegue desacoplado del desarrollo |
| **Alta cohesión** | Cada componente, hook y servicio encapsula exactamente una responsabilidad del dominio |
| **Reutilización** | Servicios de backend y hooks de frontend transferibles entre variantes del CRM sin modificación |

---

<div align="center">

[← ♻️ Refactorizaciones](03-refactorizacion.md) &nbsp;|&nbsp; [← Volver al README](../README.es.md)

</div>
