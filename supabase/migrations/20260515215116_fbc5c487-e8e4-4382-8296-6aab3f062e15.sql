
-- ============================================================
-- Sprint A: Clinical completeness schema
-- ============================================================

-- Helper: facility-scoped policy template uses public.get_user_facility_id

-- ---------- 1. Discharge summaries (ICD-10 structured) ----------
CREATE TABLE IF NOT EXISTS public.discharge_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid NOT NULL REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  admitted_at timestamptz,
  discharged_at timestamptz NOT NULL DEFAULT now(),
  primary_icd10_code text NOT NULL,
  primary_icd10_label text,
  secondary_icd10 jsonb NOT NULL DEFAULT '[]'::jsonb,
  procedures jsonb NOT NULL DEFAULT '[]'::jsonb,
  investigations_summary text,
  treatment_summary text,
  outcome text NOT NULL CHECK (outcome IN ('closed','follow_up','admitted','referred_out','dama','died')),
  follow_up_date date,
  referral_destination text,
  clinician_id uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discharge_facility ON public.discharge_summaries(facility_id, discharged_at DESC);
CREATE INDEX IF NOT EXISTS idx_discharge_patient ON public.discharge_summaries(patient_id);
ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facility staff read discharges" ON public.discharge_summaries FOR SELECT
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "facility staff write discharges" ON public.discharge_summaries FOR INSERT
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "facility staff update discharges" ON public.discharge_summaries FOR UPDATE
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_discharge_updated BEFORE UPDATE ON public.discharge_summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_discharge_audit AFTER INSERT OR UPDATE ON public.discharge_summaries
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- ---------- 2. Birth registrations ----------
CREATE TABLE IF NOT EXISTS public.birth_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  mother_patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  mother_name text NOT NULL,
  mother_nin text,
  father_name text,
  father_nin text,
  child_first_name text NOT NULL,
  child_surname text NOT NULL,
  child_sex text NOT NULL CHECK (child_sex IN ('male','female')),
  date_of_birth date NOT NULL,
  time_of_birth time,
  birth_weight_kg numeric(4,2),
  apgar_1_min int,
  apgar_5_min int,
  mode_of_delivery text CHECK (mode_of_delivery IN ('svd','assisted','c_section','breech','other')),
  place_of_birth text DEFAULT 'facility',
  attending_clinician uuid REFERENCES auth.users(id),
  nimc_request_status text NOT NULL DEFAULT 'pending'
    CHECK (nimc_request_status IN ('pending','submitted','nin_assigned','failed')),
  child_nin text,
  npopc_status text NOT NULL DEFAULT 'pending'
    CHECK (npopc_status IN ('pending','submitted','certificate_issued','failed')),
  npopc_certificate_number text,
  remarks text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_birth_facility ON public.birth_registrations(facility_id, date_of_birth DESC);
ALTER TABLE public.birth_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facility read births" ON public.birth_registrations FOR SELECT
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "facility write births" ON public.birth_registrations FOR INSERT
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "facility update births" ON public.birth_registrations FOR UPDATE
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_birth_updated BEFORE UPDATE ON public.birth_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_birth_audit AFTER INSERT OR UPDATE ON public.birth_registrations
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- ---------- 3. Death registrations ----------
CREATE TABLE IF NOT EXISTS public.death_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  deceased_name text NOT NULL,
  deceased_nin text,
  sex text NOT NULL CHECK (sex IN ('male','female')),
  age_years int,
  age_months int,
  date_of_death date NOT NULL,
  time_of_death time,
  place_of_death text NOT NULL DEFAULT 'facility'
    CHECK (place_of_death IN ('facility','home','transit','other')),
  manner_of_death text CHECK (manner_of_death IN ('natural','accident','suicide','homicide','undetermined')),
  primary_cause_icd10_code text NOT NULL,
  primary_cause_icd10_label text,
  contributing_causes jsonb NOT NULL DEFAULT '[]'::jsonb,
  certified_by uuid REFERENCES auth.users(id),
  npopc_status text NOT NULL DEFAULT 'pending'
    CHECK (npopc_status IN ('pending','submitted','certificate_issued','failed')),
  npopc_certificate_number text,
  remarks text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_death_facility ON public.death_registrations(facility_id, date_of_death DESC);
ALTER TABLE public.death_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facility read deaths" ON public.death_registrations FOR SELECT
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "facility write deaths" ON public.death_registrations FOR INSERT
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "facility update deaths" ON public.death_registrations FOR UPDATE
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_death_updated BEFORE UPDATE ON public.death_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_death_audit AFTER INSERT OR UPDATE ON public.death_registrations
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- ---------- 4. NHMIS register entries ----------
CREATE TABLE IF NOT EXISTS public.nhmis_register_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  register_type text NOT NULL CHECK (register_type IN ('family_planning','post_natal','tb_leprosy','hiv','malaria','nutrition_gmp')),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  serial_number int,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nhmis_fac_type_date
  ON public.nhmis_register_entries(facility_id, register_type, visit_date DESC);
ALTER TABLE public.nhmis_register_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facility read nhmis" ON public.nhmis_register_entries FOR SELECT
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "facility write nhmis" ON public.nhmis_register_entries FOR INSERT
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "facility update nhmis" ON public.nhmis_register_entries FOR UPDATE
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_nhmis_updated BEFORE UPDATE ON public.nhmis_register_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_nhmis_audit AFTER INSERT OR UPDATE ON public.nhmis_register_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- ---------- 5. Cold-chain equipment + temperature logs ----------
CREATE TABLE IF NOT EXISTS public.cold_chain_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  name text NOT NULL,
  asset_tag text,
  equipment_type text NOT NULL CHECK (equipment_type IN ('fridge','freezer','cold_box','vaccine_carrier','solar_fridge')),
  manufacturer text,
  model text,
  location text,
  min_temp_c numeric(4,1) NOT NULL DEFAULT 2.0,
  max_temp_c numeric(4,1) NOT NULL DEFAULT 8.0,
  status text NOT NULL DEFAULT 'operational'
    CHECK (status IN ('operational','needs_maintenance','out_of_service','retired')),
  last_serviced_on date,
  installed_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ccold_facility ON public.cold_chain_equipment(facility_id);
ALTER TABLE public.cold_chain_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facility read ccold" ON public.cold_chain_equipment FOR SELECT
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "facility write ccold" ON public.cold_chain_equipment FOR INSERT
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "facility update ccold" ON public.cold_chain_equipment FOR UPDATE
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_ccold_updated BEFORE UPDATE ON public.cold_chain_equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ccold_audit AFTER INSERT OR UPDATE ON public.cold_chain_equipment
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

CREATE TABLE IF NOT EXISTS public.cold_chain_temperature_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.cold_chain_equipment(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  reading_period text NOT NULL DEFAULT 'morning' CHECK (reading_period IN ('morning','afternoon','evening','adhoc')),
  temp_c numeric(4,1) NOT NULL,
  is_excursion boolean NOT NULL DEFAULT false,
  action_taken text,
  recorded_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cclog_equip_time ON public.cold_chain_temperature_logs(equipment_id, recorded_at DESC);
ALTER TABLE public.cold_chain_temperature_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facility read cclog" ON public.cold_chain_temperature_logs FOR SELECT
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "facility write cclog" ON public.cold_chain_temperature_logs FOR INSERT
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_cclog_audit AFTER INSERT ON public.cold_chain_temperature_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- Auto-flag temperature excursions on insert
CREATE OR REPLACE FUNCTION public.flag_cold_chain_excursion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_min numeric; v_max numeric;
BEGIN
  SELECT min_temp_c, max_temp_c INTO v_min, v_max
    FROM public.cold_chain_equipment WHERE id = NEW.equipment_id;
  IF NEW.temp_c < v_min OR NEW.temp_c > v_max THEN
    NEW.is_excursion := true;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_cclog_excursion BEFORE INSERT ON public.cold_chain_temperature_logs
  FOR EACH ROW EXECUTE FUNCTION public.flag_cold_chain_excursion();
