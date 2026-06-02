-- ============================================================================
-- MedIL CRM — Migración de índices de claves foráneas
-- Fecha: 2026-06-02
-- Motivo: el advisor de rendimiento de InsForge reportó columnas FK sin índice.
--         Sin índice, los JOIN y filtros por estas columnas se degradan a medida
--         que crecen los datos (scan secuencial en cada consulta).
--
-- Cómo aplicar:
--   InsForge Dashboard → SQL Editor → pegar y ejecutar.
--   Es idempotente (IF NOT EXISTS), seguro de re-ejecutar.
--
-- Nota: los nombres de columna están en camelCase, por eso van entre comillas
--       dobles (Postgres las requiere para preservar mayúsculas).
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id
  ON public.appointments ("patientId");

CREATE INDEX IF NOT EXISTS idx_medical_records_appointment_id
  ON public.medical_records ("appointmentId");

CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id
  ON public.medical_records ("patientId");

CREATE INDEX IF NOT EXISTS idx_reminders_appointment_id
  ON public.reminders ("appointmentId");

CREATE INDEX IF NOT EXISTS idx_reminders_patient_id
  ON public.reminders ("patientId");

-- Verificación (opcional): listar índices creados
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
