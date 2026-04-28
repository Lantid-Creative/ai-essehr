-- Ambulances
CREATE TABLE IF NOT EXISTS public.ambulances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL,
  call_sign text NOT NULL,
  plate_number text,
  capability text NOT NULL DEFAULT 'basic',
  status text NOT NULL DEFAULT 'offline',
  current_crew uuid[] DEFAULT '{}',
  current_lat numeric,
  current_lng numeric,
  last_ping_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view their ambulances" ON public.ambulances
FOR SELECT TO authenticated
USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Paramedics see all ambulances" ON public.ambulances
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'paramedic'::app_role));

CREATE POLICY "Facility admins manage ambulances" ON public.ambulances
FOR ALL TO authenticated
USING (facility_id = public.get_user_facility_id(auth.uid())
       AND (public.has_role(auth.uid(), 'facility_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role)))
WITH CHECK (facility_id = public.get_user_facility_id(auth.uid())
       AND (public.has_role(auth.uid(), 'facility_admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "Paramedic crew updates own ambulance" ON public.ambulances
FOR UPDATE TO authenticated USING (auth.uid() = ANY(current_crew)) WITH CHECK (auth.uid() = ANY(current_crew));

-- Rescue requests
CREATE TABLE IF NOT EXISTS public.rescue_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid,
  caller_user_id uuid,
  caller_name text NOT NULL,
  caller_phone text,
  symptom_summary text,
  urgency text NOT NULL DEFAULT 'urgent',
  pickup_lat numeric,
  pickup_lng numeric,
  pickup_address text,
  status text NOT NULL DEFAULT 'pending',
  assigned_ambulance_id uuid,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  arrived_hospital_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  suggested_hospital_id uuid,
  destination_hospital_id uuid,
  destination_eta_minutes integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rescue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caller views own rescues" ON public.rescue_requests
FOR SELECT TO authenticated USING (caller_user_id = auth.uid());

CREATE POLICY "Caller creates rescue" ON public.rescue_requests
FOR INSERT TO authenticated WITH CHECK (caller_user_id = auth.uid());

CREATE POLICY "Caller cancels own pending rescue" ON public.rescue_requests
FOR UPDATE TO authenticated
USING (caller_user_id = auth.uid() AND status IN ('pending','accepted'))
WITH CHECK (caller_user_id = auth.uid());

CREATE POLICY "Paramedics see broadcast and assigned rescues" ON public.rescue_requests
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'paramedic'::app_role) AND
  (status = 'pending' OR assigned_ambulance_id IN (
    SELECT id FROM public.ambulances WHERE auth.uid() = ANY(current_crew)
  ))
);

CREATE POLICY "Paramedics update assigned rescues" ON public.rescue_requests
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'paramedic'::app_role) AND
  (status = 'pending' OR assigned_ambulance_id IN (
    SELECT id FROM public.ambulances WHERE auth.uid() = ANY(current_crew)
  ))
)
WITH CHECK (public.has_role(auth.uid(), 'paramedic'::app_role));

CREATE POLICY "Destination hospital sees inbound rescue" ON public.rescue_requests
FOR SELECT TO authenticated
USING (
  destination_hospital_id = public.get_user_facility_id(auth.uid())
  OR suggested_hospital_id = public.get_user_facility_id(auth.uid())
);

CREATE POLICY "Super admin sees all rescues" ON public.rescue_requests
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Care log
CREATE TABLE IF NOT EXISTS public.ambulance_care_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_request_id uuid NOT NULL REFERENCES public.rescue_requests(id) ON DELETE CASCADE,
  recorded_by uuid NOT NULL,
  entry_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  free_text text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ambulance_care_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.user_can_view_rescue(_user_id uuid, _rescue_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rescue_requests r
    WHERE r.id = _rescue_id
      AND (
        r.caller_user_id = _user_id
        OR r.destination_hospital_id = public.get_user_facility_id(_user_id)
        OR r.suggested_hospital_id = public.get_user_facility_id(_user_id)
        OR (public.has_role(_user_id, 'paramedic'::app_role)
            AND r.assigned_ambulance_id IN (SELECT id FROM public.ambulances WHERE _user_id = ANY(current_crew)))
        OR public.has_role(_user_id, 'super_admin'::app_role)
      )
  );
$$;

CREATE POLICY "Authorized parties view care log" ON public.ambulance_care_log
FOR SELECT TO authenticated USING (public.user_can_view_rescue(auth.uid(), rescue_request_id));

CREATE POLICY "Crew records care log" ON public.ambulance_care_log
FOR INSERT TO authenticated
WITH CHECK (
  recorded_by = auth.uid()
  AND public.has_role(auth.uid(), 'paramedic'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.rescue_requests r
    JOIN public.ambulances a ON a.id = r.assigned_ambulance_id
    WHERE r.id = rescue_request_id AND auth.uid() = ANY(a.current_crew)
  )
);

-- Realtime
ALTER TABLE public.rescue_requests REPLICA IDENTITY FULL;
ALTER TABLE public.ambulance_care_log REPLICA IDENTITY FULL;
ALTER TABLE public.ambulances REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rescue_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_care_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulances;

-- updated_at triggers
DROP TRIGGER IF EXISTS update_ambulances_updated_at ON public.ambulances;
CREATE TRIGGER update_ambulances_updated_at BEFORE UPDATE ON public.ambulances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rescue_requests_updated_at ON public.rescue_requests;
CREATE TRIGGER update_rescue_requests_updated_at BEFORE UPDATE ON public.rescue_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_rescue_status ON public.rescue_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rescue_dest ON public.rescue_requests(destination_hospital_id);
CREATE INDEX IF NOT EXISTS idx_carelog_rescue ON public.ambulance_care_log(rescue_request_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambulance_facility ON public.ambulances(facility_id, status);