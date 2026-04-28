-- ============================================================
-- Priority 1: Real case_reports table + outbox + jurisdiction mapping
-- ============================================================

-- 1. Add jurisdiction mapping fields to facilities (for SORMAS/DHIS2 routing)
ALTER TABLE public.facilities
  ADD COLUMN IF NOT EXISTS dhis2_orgunit_id text,
  ADD COLUMN IF NOT EXISTS sormas_facility_uuid text,
  ADD COLUMN IF NOT EXISTS lga_code text,
  ADD COLUMN IF NOT EXISTS state_code text;

-- 2. Add case classification + ICD-10 to encounters
ALTER TABLE public.encounters
  ADD COLUMN IF NOT EXISTS icd10_code text,
  ADD COLUMN IF NOT EXISTS case_classification text
    CHECK (case_classification IS NULL OR case_classification IN ('suspected','probable','confirmed','not_a_case'));

-- 3. case_reports — the validated chain record of truth
CREATE TABLE IF NOT EXISTS public.case_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid REFERENCES public.encounters(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  disease text NOT NULL,
  case_classification text NOT NULL DEFAULT 'suspected'
    CHECK (case_classification IN ('suspected','probable','confirmed','not_a_case')),
  onset_date date,
  symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcome text CHECK (outcome IS NULL OR outcome IN ('alive','recovered','dead','unknown')),
  -- 3-tier validation chain
  status text NOT NULL DEFAULT 'pending_facility'
    CHECK (status IN ('pending_facility','facility_validated','pending_lga','lga_validated','pending_state','state_validated','rejected','dispatched','partially_dispatched','failed')),
  facility_validated_by uuid,
  facility_validated_at timestamptz,
  lga_validated_by uuid,
  lga_validated_at timestamptz,
  state_validated_by uuid,
  state_validated_at timestamptz,
  rejection_reason text,
  -- SLA tracking
  sla_facility_due_at timestamptz DEFAULT now() + interval '4 hours',
  sla_lga_due_at timestamptz,
  sla_state_due_at timestamptz,
  -- Idempotency
  external_uuid text NOT NULL DEFAULT gen_random_uuid()::text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_reports_status ON public.case_reports(status);
CREATE INDEX IF NOT EXISTS idx_case_reports_facility ON public.case_reports(facility_id);
CREATE INDEX IF NOT EXISTS idx_case_reports_disease ON public.case_reports(disease);

-- 4. case_report_dispatches — outbox pattern (one row per target system per case)
CREATE TABLE IF NOT EXISTS public.case_report_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_report_id uuid NOT NULL REFERENCES public.case_reports(id) ON DELETE CASCADE,
  target text NOT NULL CHECK (target IN ('SORMAS','DHIS2')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sending','success','failed','dead_letter')),
  payload jsonb NOT NULL,
  response jsonb,
  external_id text,
  retry_count int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 5,
  next_retry_at timestamptz DEFAULT now(),
  last_error text,
  acknowledged_at timestamptz,
  dispatched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (case_report_id, target)
);

CREATE INDEX IF NOT EXISTS idx_dispatches_pending ON public.case_report_dispatches(status, next_retry_at)
  WHERE status IN ('pending','failed');

-- 5. updated_at triggers
CREATE TRIGGER trg_case_reports_updated
  BEFORE UPDATE ON public.case_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_dispatches_updated
  BEFORE UPDATE ON public.case_report_dispatches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Audit triggers (universal pattern already in project)
CREATE TRIGGER trg_audit_case_reports
  AFTER INSERT OR UPDATE ON public.case_reports
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

CREATE TRIGGER trg_audit_dispatches
  AFTER INSERT OR UPDATE ON public.case_report_dispatches
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- 7. RLS
ALTER TABLE public.case_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_report_dispatches ENABLE ROW LEVEL SECURITY;

-- Facility staff: see + create their own facility's reports
CREATE POLICY "Facility staff view own case reports"
  ON public.case_reports FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff create case reports"
  ON public.case_reports FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND created_by = auth.uid());

-- Facility validators (admin/doctor) update their own
CREATE POLICY "Facility staff update own case reports"
  ON public.case_reports FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

-- DSNO / Epi / Super admin see everything
CREATE POLICY "DSNO Epi SuperAdmin view all case reports"
  ON public.case_reports FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'dsno'::app_role)
    OR public.has_role(auth.uid(),'epidemiologist'::app_role)
    OR public.has_role(auth.uid(),'super_admin'::app_role)
  );

CREATE POLICY "DSNO Epi SuperAdmin update all case reports"
  ON public.case_reports FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'dsno'::app_role)
    OR public.has_role(auth.uid(),'epidemiologist'::app_role)
    OR public.has_role(auth.uid(),'super_admin'::app_role)
  );

-- Dispatches: visible to the same readers; writes only by service role (edge function)
CREATE POLICY "View dispatches via case access"
  ON public.case_report_dispatches FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.case_reports cr
      WHERE cr.id = case_report_dispatches.case_report_id
        AND (
          cr.facility_id = public.get_user_facility_id(auth.uid())
          OR public.has_role(auth.uid(),'dsno'::app_role)
          OR public.has_role(auth.uid(),'epidemiologist'::app_role)
          OR public.has_role(auth.uid(),'super_admin'::app_role)
        )
    )
  );

-- No direct writes to dispatches from clients
CREATE POLICY "No direct dispatch inserts"
  ON public.case_report_dispatches FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct dispatch updates"
  ON public.case_report_dispatches FOR UPDATE TO authenticated
  USING (false);

-- 8. Helper function: enqueue dispatches when case reaches state_validated
CREATE OR REPLACE FUNCTION public.enqueue_case_dispatches()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When status transitions to lga_validated (or higher), queue both targets
  IF NEW.status IN ('lga_validated','state_validated')
     AND (OLD.status IS DISTINCT FROM NEW.status)
     AND NEW.status <> OLD.status THEN
    INSERT INTO public.case_report_dispatches (case_report_id, target, payload, status)
    VALUES
      (NEW.id, 'SORMAS', '{}'::jsonb, 'pending'),
      (NEW.id, 'DHIS2',  '{}'::jsonb, 'pending')
    ON CONFLICT (case_report_id, target) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enqueue_case_dispatches
  AFTER UPDATE ON public.case_reports
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_case_dispatches();