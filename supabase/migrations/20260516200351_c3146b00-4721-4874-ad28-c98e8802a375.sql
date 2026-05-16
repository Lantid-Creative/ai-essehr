
CREATE TABLE public.facility_microplans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  plan_year INT NOT NULL,
  plan_period TEXT NOT NULL DEFAULT 'annual',
  catchment_population INT,
  under_5_population INT,
  pregnant_women_estimate INT,
  strategies TEXT,
  budget_ngn NUMERIC(14,2),
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (facility_id, plan_year, plan_period)
);

CREATE TABLE public.microplan_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  microplan_id UUID NOT NULL REFERENCES public.facility_microplans(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  indicator_code TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  unit TEXT DEFAULT 'count',
  target_month INT,
  target_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  achieved_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_microplans_facility_year ON public.facility_microplans(facility_id, plan_year);
CREATE INDEX idx_microplan_targets_plan ON public.microplan_targets(microplan_id);
CREATE INDEX idx_microplan_targets_facility ON public.microplan_targets(facility_id);

ALTER TABLE public.facility_microplans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microplan_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view facility microplans" ON public.facility_microplans
  FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "manage facility microplans" ON public.facility_microplans
  FOR ALL TO authenticated
  USING ((facility_id = public.get_user_facility_id(auth.uid()) AND public.has_role(auth.uid(),'facility_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((facility_id = public.get_user_facility_id(auth.uid()) AND public.has_role(auth.uid(),'facility_admin')) OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "view microplan targets" ON public.microplan_targets
  FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "manage microplan targets" ON public.microplan_targets
  FOR ALL TO authenticated
  USING ((facility_id = public.get_user_facility_id(auth.uid()) AND public.has_role(auth.uid(),'facility_admin')) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK ((facility_id = public.get_user_facility_id(auth.uid()) AND public.has_role(auth.uid(),'facility_admin')) OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_microplans_updated_at BEFORE UPDATE ON public.facility_microplans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_microplan_targets_updated_at BEFORE UPDATE ON public.microplan_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_microplans_audit AFTER INSERT OR UPDATE ON public.facility_microplans
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
CREATE TRIGGER trg_microplan_targets_audit AFTER INSERT OR UPDATE ON public.microplan_targets
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
