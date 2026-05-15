
ALTER TABLE public.case_reports
  ADD COLUMN IF NOT EXISTS sla_breach_notified_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_case_sla_due_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.sla_facility_due_at IS NULL THEN
      NEW.sla_facility_due_at := COALESCE(NEW.created_at, now()) + interval '24 hours';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.facility_validated_at IS NOT NULL
       AND OLD.facility_validated_at IS NULL
       AND NEW.sla_lga_due_at IS NULL THEN
      NEW.sla_lga_due_at := NEW.facility_validated_at + interval '5 days';
    END IF;
    IF NEW.lga_validated_at IS NOT NULL
       AND OLD.lga_validated_at IS NULL
       AND NEW.sla_state_due_at IS NULL THEN
      NEW.sla_state_due_at := NEW.lga_validated_at + interval '10 days';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_sla_due_dates ON public.case_reports;
CREATE TRIGGER trg_case_sla_due_dates
BEFORE INSERT OR UPDATE ON public.case_reports
FOR EACH ROW EXECUTE FUNCTION public.set_case_sla_due_dates();

CREATE OR REPLACE VIEW public.case_validation_sla_kpis
WITH (security_invoker = true)
AS
SELECT
  facility_id,
  count(*) AS total_cases,
  count(*) FILTER (
    WHERE status = 'pending_facility' AND sla_facility_due_at < now()
  ) AS overdue_facility,
  count(*) FILTER (
    WHERE status IN ('facility_validated','pending_lga') AND sla_lga_due_at < now()
  ) AS overdue_lga,
  count(*) FILTER (
    WHERE status IN ('lga_validated','pending_state') AND sla_state_due_at < now()
  ) AS overdue_state,
  count(*) FILTER (
    WHERE facility_validated_at IS NOT NULL
      AND facility_validated_at <= sla_facility_due_at
  ) AS on_time_facility,
  count(*) FILTER (
    WHERE lga_validated_at IS NOT NULL
      AND sla_lga_due_at IS NOT NULL
      AND lga_validated_at <= sla_lga_due_at
  ) AS on_time_lga,
  count(*) FILTER (
    WHERE state_validated_at IS NOT NULL
      AND sla_state_due_at IS NOT NULL
      AND state_validated_at <= sla_state_due_at
  ) AS on_time_state
FROM public.case_reports
GROUP BY facility_id;
