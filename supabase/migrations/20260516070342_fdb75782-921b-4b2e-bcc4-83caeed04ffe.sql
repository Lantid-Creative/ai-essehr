
-- HRH Roster
CREATE TABLE public.hrh_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  cadre TEXT,
  posting TEXT,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL DEFAULT 'morning',
  attendance_status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment Register
CREATE TABLE public.equipment_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  serial_number TEXT,
  manufacturer TEXT,
  acquired_date DATE,
  condition TEXT NOT NULL DEFAULT 'functional',
  status TEXT NOT NULL DEFAULT 'in_use',
  location TEXT,
  last_service_date DATE,
  next_service_due DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Utilities Log
CREATE TABLE public.utilities_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  utility_type TEXT NOT NULL,
  reading NUMERIC,
  unit TEXT,
  cost NUMERIC DEFAULT 0,
  downtime_minutes INT DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicle Maintenance
CREATE TABLE public.vehicle_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.ambulances(id) ON DELETE SET NULL,
  vehicle_label TEXT NOT NULL,
  service_type TEXT NOT NULL,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  odometer_km INT,
  cost NUMERIC DEFAULT 0,
  vendor TEXT,
  next_service_due DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Finance Ledger
CREATE TABLE public.finance_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  reference TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_hrh_roster_facility_date ON public.hrh_roster(facility_id, shift_date DESC);
CREATE INDEX idx_equipment_facility ON public.equipment_register(facility_id);
CREATE INDEX idx_utilities_facility_date ON public.utilities_log(facility_id, log_date DESC);
CREATE INDEX idx_vehicle_maintenance_facility ON public.vehicle_maintenance(facility_id, service_date DESC);
CREATE INDEX idx_finance_ledger_facility_date ON public.finance_ledger(facility_id, entry_date DESC);

-- Enable RLS
ALTER TABLE public.hrh_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilities_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_ledger ENABLE ROW LEVEL SECURITY;

-- Policies factory
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['hrh_roster','equipment_register','utilities_log','vehicle_maintenance','finance_ledger']
  LOOP
    EXECUTE format($f$
      CREATE POLICY "Facility staff can view %1$s"
        ON public.%1$I FOR SELECT TO authenticated
        USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'::app_role));
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Facility admin can insert %1$s"
        ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (
          (facility_id = public.get_user_facility_id(auth.uid())
            AND (public.has_role(auth.uid(),'facility_admin'::app_role)
              OR public.has_role(auth.uid(),'super_admin'::app_role)))
          OR public.has_role(auth.uid(),'super_admin'::app_role)
        );
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Facility admin can update %1$s"
        ON public.%1$I FOR UPDATE TO authenticated
        USING (
          (facility_id = public.get_user_facility_id(auth.uid())
            AND (public.has_role(auth.uid(),'facility_admin'::app_role)
              OR public.has_role(auth.uid(),'super_admin'::app_role)))
          OR public.has_role(auth.uid(),'super_admin'::app_role)
        );
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY "Facility admin can delete %1$s"
        ON public.%1$I FOR DELETE TO authenticated
        USING (
          (facility_id = public.get_user_facility_id(auth.uid())
            AND (public.has_role(auth.uid(),'facility_admin'::app_role)
              OR public.has_role(auth.uid(),'super_admin'::app_role)))
          OR public.has_role(auth.uid(),'super_admin'::app_role)
        );
    $f$, t);

    EXECUTE format($f$
      CREATE TRIGGER trg_%1$s_updated_at
        BEFORE UPDATE ON public.%1$I
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    $f$, t);
  END LOOP;
END $$;
