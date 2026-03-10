
-- Add dispensed_at column to encounters for proper pharmacy tracking
ALTER TABLE public.encounters ADD COLUMN IF NOT EXISTS dispensed_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.encounters ADD COLUMN IF NOT EXISTS dispensed_by uuid DEFAULT NULL;

-- Create appointments table for patient queue management
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id),
  scheduled_by uuid DEFAULT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  appointment_type text NOT NULL DEFAULT 'consultation',
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff can view appointments" ON public.appointments
  FOR SELECT TO authenticated USING (facility_id = get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff can insert appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (facility_id = get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff can update appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (facility_id = get_user_facility_id(auth.uid()));

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  facility_id uuid REFERENCES public.facilities(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'facility_admin') OR has_role(auth.uid(), 'super_admin')
  );
CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Seed ward beds for demo facility
INSERT INTO public.ward_beds (facility_id, ward_name, bed_number, status) VALUES
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M-01', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M-02', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M-03', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M-04', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M-05', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M-06', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F-01', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F-02', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F-03', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F-04', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F-05', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F-06', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children Ward', 'C-01', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children Ward', 'C-02', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children Ward', 'C-03', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children Ward', 'C-04', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Isolation Ward', 'I-01', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Isolation Ward', 'I-02', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Isolation Ward', 'I-03', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MT-01', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MT-02', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MT-03', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MT-04', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Emergency', 'E-01', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Emergency', 'E-02', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Emergency', 'E-03', 'available');

-- Enable realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
