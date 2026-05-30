# CICD.md — MedIL CRM/ERP
> Referencia de integración continua y despliegue del proyecto.

---

## 1. Pipeline actual
Archivo:  .github/workflows/ci-quality.yml
Trigger:  push a main o develop
pull request a main

### Jobs
JOB 1 — test

Checkout del repositorio
Setup Node.js 20
npm ci (instalación limpia)
npm run test (todos los tests deben pasar)
npm run test:coverage (reporte de cobertura)

JOB 2 — lint

Checkout del repositorio
Setup Node.js 20
npm ci
npm run lint (ESLint sin errores ni warnings)


---

## 2. Scripts disponibles
npm run dev              → servidor de desarrollo (localhost:5173)
npm run build            → build de producción en dist/
npm run preview          → previsualizar el build de producción
npm run test             → correr todos los tests una vez
npm run test:watch       → tests en modo watch (desarrollo)
npm run test:coverage    → tests con reporte de cobertura HTML
npm run lint             → verificar calidad del código

---

## 3. Criterios de calidad para merge a main

Todo PR debe cumplir estos criterios antes de hacer merge:
□ JOB test → todos los tests en verde
□ JOB lint → sin errores ni warnings
□ Cobertura atoms/     ≥ 90%
□ Cobertura molecules/ ≥ 85%
□ Cobertura organisms/ ≥ 80%
□ Cobertura hooks/     ≥ 85%
□ Cobertura domain/    ≥ 95%
□ No hay console.log en código productivo
□ No hay strings literales en componentes
□ No hay números mágicos en lógica de negocio
□ Todos los archivos nuevos tienen su .test correspondiente
□ Los mensajes de error vienen de messages.js
□ No hay bad smells nuevos (ver ARCHITECTURE.md sección 6)

---

## 4. Deploy (Etapa 9)
Frontend:  Vercel
Branch main    → producción automática
Branch develop → preview automático por PR
Variables de entorno en Vercel:
VITE_INSFORGE_API_URL
VITE_INSFORGE_API_KEY
VITE_PAGOFACIL_API_URL  (producción)
VITE_PAGOFACIL_API_KEY  (producción)
VITE_CLAUDE_API_KEY     (Etapa 8)

---

## 5. Ramas del repositorio
main      → producción, siempre estable
develop   → integración, se hace merge desde features
feature/* → desarrollo de features individuales
hotfix/*  → correcciones urgentes en producción
