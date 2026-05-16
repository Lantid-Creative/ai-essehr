-- WDC Meetings
CREATE TABLE public.wdc_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'regular',
  chairperson TEXT,
  secretary TEXT,
  attendance_count INTEGER DEFAULT 0,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  agenda TEXT,
  decisions TEXT,
  action_items TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wdc_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view wdc meetings" ON public.wdc_meetings
  FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Facility admin manage wdc meetings" ON public.wdc_meetings
  FOR ALL TO authenticated
  USING ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_wdc_meetings_updated_at
  BEFORE UPDATE ON public.wdc_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Supervisory Visits
CREATE TABLE public.supervisory_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL,
  visit_date DATE NOT NULL,
  visit_type TEXT NOT NULL DEFAULT 'integrated',
  supervisor_name TEXT NOT NULL,
  supervisor_cadre TEXT,
  supervisor_organization TEXT,
  areas_assessed JSONB NOT NULL DEFAULT '[]'::jsonb,
  findings TEXT,
  recommendations TEXT,
  strengths TEXT,
  gaps TEXT,
  overall_score NUMERIC,
  next_visit_date DATE,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supervisory_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view supervisory visits" ON public.supervisory_visits
  FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Facility admin manage supervisory visits" ON public.supervisory_visits
  FOR ALL TO authenticated
  USING ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_supervisory_visits_updated_at
  BEFORE UPDATE ON public.supervisory_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Supervisory visit action items
CREATE TABLE public.supervisory_visit_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID NOT NULL REFERENCES public.supervisory_visits(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL,
  action_description TEXT NOT NULL,
  responsible_person TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supervisory_visit_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view supervisory actions" ON public.supervisory_visit_actions
  FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Facility admin manage supervisory actions" ON public.supervisory_visit_actions
  FOR ALL TO authenticated
  USING ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK ((facility_id = get_user_facility_id(auth.uid()) AND (has_role(auth.uid(), 'facility_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_supervisory_visit_actions_updated_at
  BEFORE UPDATE ON public.supervisory_visit_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wdc_meetings_facility_date ON public.wdc_meetings(facility_id, meeting_date DESC);
CREATE INDEX idx_supervisory_visits_facility_date ON public.supervisory_visits(facility_id, visit_date DESC);
CREATE INDEX idx_supervisory_visit_actions_visit ON public.supervisory_visit_actions(visit_id);