
-- Ward beds table for real ward management
CREATE TABLE public.ward_beds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id uuid REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
  ward_name text NOT NULL,
  bed_number text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  admission_date timestamp with time zone,
  discharge_date timestamp with time zone,
  isolation_flag boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(facility_id, ward_name, bed_number)
);

ALTER TABLE public.ward_beds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff can view ward beds"
  ON public.ward_beds FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can insert ward beds"
  ON public.ward_beds FOR INSERT TO authenticated
  WITH CHECK (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can update ward beds"
  ON public.ward_beds FOR UPDATE TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

-- Seed ward beds for Demo General Hospital
INSERT INTO public.ward_beds (facility_id, ward_name, bed_number, status) VALUES
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M1', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M2', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M3', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Male Ward', 'M4', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F1', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F2', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F3', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Female Ward', 'F4', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children''s Ward', 'C1', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children''s Ward', 'C2', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children''s Ward', 'C3', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Children''s Ward', 'C4', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Isolation Ward', 'I1', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Isolation Ward', 'I2', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Isolation Ward', 'I3', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Isolation Ward', 'I4', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MW1', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MW2', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MW3', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Maternity Ward', 'MW4', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Emergency', 'E1', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Emergency', 'E2', 'available'),
  ('c66611e3-9806-4a68-9d32-5ea50f52bfdd', 'Emergency', 'E3', 'available');
