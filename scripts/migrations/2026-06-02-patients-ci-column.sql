-- ============================================================================
-- MedIL CRM — Migración: columna CI en pacientes
-- Fecha: 2026-06-02
-- Motivo: el frontend y los servicios usan el campo `ci` (Carnet de Identidad)
--         de pacientes (registro público, alta y edición de pacientes), pero la
--         columna nunca se creó en la tabla `patients`. Sin ella, InsForge
--         responde: "Could not find the 'ci' column of 'patients' in the schema
--         cache" y falla el guardado al crear/editar un paciente.
--
-- Cómo aplicar:
--   InsForge Dashboard → SQL Editor → pegar y ejecutar.
--   Es idempotente (IF NOT EXISTS), seguro de re-ejecutar.
--
-- Nota: `ci` queda como texto nullable (los pacientes ya existentes no tienen
--       CI). No se fuerza UNIQUE para no romper filas previas; si se desea
--       unicidad más adelante, agregar un índice único parcial sobre los no
--       nulos (ver al final, comentado).
-- ============================================================================

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS "ci" text;

-- Forzar a PostgREST a recargar el caché de esquema para que reconozca la
-- columna inmediatamente (si no, puede tardar en reflejarse).
NOTIFY pgrst, 'reload schema';

-- Verificación (opcional):
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'ci';

-- (Opcional) Unicidad de CI ignorando nulos, para activar más adelante:
-- CREATE UNIQUE INDEX IF NOT EXISTS uniq_patients_ci
--   ON public.patients ("ci") WHERE "ci" IS NOT NULL;
