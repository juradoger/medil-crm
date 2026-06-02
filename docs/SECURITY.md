# Seguridad — Estado y deuda técnica conocida

> Última revisión: 2026-06-02 (antes del deploy de Etapa 1)

Este documento registra el estado de seguridad de la base de datos InsForge y
las decisiones tomadas, para que la deuda quede explícita y trazable (principio
de transparencia técnica de Ingeniería de Software II).

## ✅ Resuelto

### Índices de claves foráneas (rendimiento)
El advisor de InsForge reportó 5 columnas FK sin índice. Se crearon vía
`scripts/migrations/2026-06-02-fk-indexes.sql`:

| Tabla | Columna |
|-------|---------|
| `appointments` | `patientId` |
| `medical_records` | `appointmentId`, `patientId` |
| `reminders` | `appointmentId`, `patientId` |

Impacto: JOIN y filtros por paciente/cita dejan de hacer scan secuencial.

## ⚠️ Deuda técnica conocida (NO resuelto en Etapa 1)

### Tablas públicas / sin RLS
`patients`, `appointments`, `medical_records` y `reminders` son accesibles
públicamente. El advisor lo marca como **prioridad muy alta** para una app médica.

**Causa raíz (arquitectónica):** la aplicación accede a InsForge **directamente
desde el navegador con la `anonKey`** (ver `frontend/src/lib/insforge.js` y los
10 servicios en `frontend/src/services/`). La autenticación es propia:
- contraseñas comparadas en **texto plano** (`users.passwordHash`),
- token = JSON en **base64 sin firmar** en `localStorage`,
- **no** se usa la auth nativa de InsForge (JWT).

Por eso **no se puede activar RLS sin romper toda la app**: las políticas RLS
necesitan un usuario autenticado (`auth.uid()`) que hoy no existe en InsForge.
Además, la `anonKey` viaja al navegador, así que cualquiera puede leer las tablas
—incluida `users` con los `passwordHash`.

### Plan de remediación (Etapa posterior)
Para cerrar esta deuda hay que **re-arquitectar la autenticación**. Dos caminos:

1. **Migrar a la auth de InsForge (recomendado):** registrar/loguear usuarios
   con el sistema de auth de InsForge para obtener un JWT real, hashear
   contraseñas, y luego activar **políticas RLS por rol** (admin/doctor/patient).
2. **Proxy por backend:** enrutar todo el acceso a datos por el backend Express
   con una *service key*, dejar las tablas privadas y validar el rol en el server
   (hoy `backend/middleware/auth.js` es un stub — ver `TODO Etapa 8`).

Ambos requieren reescribir `authService`, `AuthContext` y los servicios del
frontend, además de reprobar todos los flujos. Se difiere por riesgo/tiempo
frente a la fecha de entrega.

### Otros puntos a corregir junto con lo anterior
- Hashear contraseñas (bcrypt/argon2) en lugar de texto plano.
- No exponer `users.passwordHash` al cliente (hoy `select('*')` lo trae).
- Firmar el token (JWT) en vez de base64 plano.
