
CREATE TABLE IF NOT EXISTS public.nhmis_001_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL,
  reporting_year int NOT NULL,
  reporting_month int NOT NULL CHECK (reporting_month BETWEEN 1 AND 12),
  indicators jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  submitted_by uuid,
  submitted_at timestamptz,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (facility_id, reporting_year, reporting_month)
);

ALTER TABLE public.nhmis_001_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "facility read nhmis001"
  ON public.nhmis_001_submissions FOR SELECT
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "facility write nhmis001"
  ON public.nhmis_001_submissions FOR INSERT
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "facility update nhmis001"
  ON public.nhmis_001_submissions FOR UPDATE
  USING (facility_id = public.get_user_facility_id(auth.uid()) AND status <> 'locked');

CREATE TRIGGER trg_nhmis001_updated
  BEFORE UPDATE ON public.nhmis_001_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
