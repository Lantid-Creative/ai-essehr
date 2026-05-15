
CREATE TABLE public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  dataset TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or shared facility reports"
ON public.saved_reports FOR SELECT TO authenticated
USING (
  owner_id = auth.uid()
  OR (is_shared = true AND facility_id = public.get_user_facility_id(auth.uid()))
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Insert own reports"
ON public.saved_reports FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Update own reports"
ON public.saved_reports FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Delete own reports"
ON public.saved_reports FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_saved_reports_updated
BEFORE UPDATE ON public.saved_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_saved_reports_owner ON public.saved_reports(owner_id);
CREATE INDEX idx_saved_reports_facility ON public.saved_reports(facility_id);
