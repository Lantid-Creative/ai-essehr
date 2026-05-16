CREATE TABLE public.qi_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL,
  title TEXT NOT NULL,
  problem_statement TEXT,
  aim_statement TEXT,
  category TEXT,
  baseline_value NUMERIC,
  target_value NUMERIC,
  current_value NUMERIC,
  measure_unit TEXT,
  team_lead TEXT,
  team_members TEXT,
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  status TEXT NOT NULL DEFAULT 'planning',
  outcome_summary TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.qi_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view qi projects" ON public.qi_projects
  FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Facility admin manage qi projects" ON public.qi_projects
  FOR ALL TO authenticated
  USING ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_qi_projects_updated_at
  BEFORE UPDATE ON public.qi_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.qi_pdsa_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.qi_projects(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  cycle_start_date DATE,
  cycle_end_date DATE,
  plan_text TEXT,
  do_text TEXT,
  study_text TEXT,
  act_text TEXT,
  measured_value NUMERIC,
  status TEXT NOT NULL DEFAULT 'planning',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.qi_pdsa_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view qi cycles" ON public.qi_pdsa_cycles
  FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Facility admin manage qi cycles" ON public.qi_pdsa_cycles
  FOR ALL TO authenticated
  USING ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_qi_pdsa_cycles_updated_at
  BEFORE UPDATE ON public.qi_pdsa_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_qi_projects_facility ON public.qi_projects(facility_id, status);
CREATE INDEX idx_qi_cycles_project ON public.qi_pdsa_cycles(project_id, cycle_number);