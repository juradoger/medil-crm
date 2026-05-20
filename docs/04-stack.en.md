[![Español](https://img.shields.io/badge/Idioma-Español-00A896?style=flat-square)](04-stack.md)
[![README](https://img.shields.io/badge/←_Home-README-0E4A8A?style=flat-square)](../README.md)
![Doc](https://img.shields.io/badge/doc-04%20of%2004-FFD100?style=flat-square&logoColor=black)

<div align="center">

<img src="assets/logo.png" alt="MediL" width="110"/>

# 🛠️ Technical Stack Justification

*Every technology chosen for software engineering principles, not trends*

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-00A896?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## React 18 + Vite

![Principle](https://img.shields.io/badge/Principle-High_Cohesion-00A896?style=flat-square)

React 18 enables building interfaces based on reusable, independent components, directly aligning with the **high cohesion** principle: each component has a single, well-defined responsibility. React's composition model facilitates **low coupling** between views, as components communicate through props and hooks without direct module dependencies.

Vite acts as a build tool with Hot Module Replacement (HMR), eliminating the slow traditional compilation cycle. For an iterative academic project, this reduces friction and allows focus on domain logic.

> **Applied principle:** High cohesion — `StatusBadge` only manages the visual representation of a status; `usePatients` only manages the patient list state.

---

## TailwindCSS v4

![Principle](https://img.shields.io/badge/Principle-Low_Coupling-00A896?style=flat-square)

TailwindCSS provides atomic utility classes composed directly in JSX. This eliminates the need for per-component CSS files, increasing component **cohesion** (style and logic in the same place) and preserving **low coupling** with the rest of the stack.

For the SPL, design tokens are centralized in `index.css` using `@theme`, making visual adaptation of each CRM variant possible without touching component logic.

```css
@import "tailwindcss";

@theme {
  --color-primary:    #0E4A8A;  /* Corporate Blue */
  --color-accent:     #00A896;  /* Aqua Green */
  --color-alert:      #FFD100;  /* Yellow — reminders */
  --color-background: #FFFFFF;  /* Pure White */
}
```

---

## React Router v6

![Principle](https://img.shields.io/badge/Principle-Modularity-00A896?style=flat-square)

React Router v6 implements declarative client-side routing. Each CRM module corresponds to an independent route, reinforcing **modularity**: adding a new specialty only requires adding a route and its view, without modifying the rest of the application.

| Route | Module |
|:---|:---|
| `/` | Dashboard |
| `/patients` | Patient Management |
| `/appointments` | Appointment Management |
| `/reminders` | Reminders |
| `/patients/:id` | Patient Detail |

---

## InsForge

![Principle](https://img.shields.io/badge/Principle-Single_Responsibility-00A896?style=flat-square)

InsForge acts as the integrated backend and database of the system. Its selection reduces configuration surface: in an academic project, configuring an independent REST server would add operational complexity that distracts from the main objective — software design, engineering principles, and product lines.

InsForge encapsulates the persistence layer behind a uniform interface, allowing `*Service.js` files to be the single point of contact with the database (**single responsibility principle** at the data layer).

---

## Vercel

![Principle](https://img.shields.io/badge/Principle-Low_Coupling_CI%2FCD-00A896?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Automatic_on_push-000000?style=flat-square&logo=vercel&logoColor=white)

Vercel is the selected deployment platform for the MediL CRM frontend. Its native GitHub integration means every push to `main` automatically deploys a new version of the application, eliminating manual build and publish steps.

**Benefits for the project:**

| Feature | Value for MediL CRM |
|:---|:---|
| Automatic deployment | Every commit to `main` publishes the app without manual intervention |
| Preview per PR | Each Pull Request generates a preview URL |
| Global CDN | Minimal load times without additional configuration |
| Free tier | Fully covers the academic project scope |

> **Applied principle:** Low coupling between the development cycle and deployment cycle — the developer does not need to know the production infrastructure to publish changes.

---

## Mermaid

![Principle](https://img.shields.io/badge/Principle-Docs_as_Code-00A896?style=flat-square)

Mermaid generates diagrams from plain text embedded in Markdown files. By living in the same repository as the code, diagrams are updated with each commit, avoiding desynchronization between documentation and code.

GitHub renders Mermaid natively in `.md` files, eliminating external visualization tools and keeping the project completely self-contained.

---

## Principles Summary

| Principle | How the stack applies it |
|:---|:---|
| **Modularity** | React for the view · Router for navigation · InsForge for persistence · Vercel for deployment |
| **Low coupling** | Domain modules communicate only through service interfaces; deployment decoupled from development |
| **High cohesion** | Each component, hook, and service encapsulates exactly one domain responsibility |
| **Reuse** | Backend services and frontend hooks transferable across CRM variants without modification |

---

<div align="center">

[← ♻️ Refactorings](03-refactorizacion.en.md) &nbsp;|&nbsp; [← Back to README](../README.md)

</div>
