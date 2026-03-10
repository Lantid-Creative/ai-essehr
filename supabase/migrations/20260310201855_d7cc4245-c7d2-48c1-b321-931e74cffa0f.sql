
-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'facility_admin', 'doctor', 'nurse', 'chew', 'lab_tech', 'pharmacist', 'data_clerk', 'epidemiologist', 'dsno');
CREATE TYPE public.facility_type AS ENUM ('primary', 'secondary', 'tertiary', 'clinic', 'hospital');
CREATE TYPE public.facility_status AS ENUM ('pending', 'active', 'suspended', 'deactivated');
CREATE TYPE public.patient_status AS ENUM ('active', 'inactive', 'deceased', 'transferred');
CREATE TYPE public.encounter_type AS ENUM ('consultation', 'emergency', 'follow_up', 'referral', 'anc', 'immunization', 'lab');
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.alert_status AS ENUM ('pending', 'investigating', 'confirmed', 'dismissed', 'resolved');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- =============================================
-- 2. FACILITIES TABLE
-- =============================================
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  facility_code TEXT UNIQUE,
  facility_type public.facility_type NOT NULL DEFAULT 'primary',
  status public.facility_status NOT NULL DEFAULT 'pending',
  region TEXT,
  district TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  bed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. PROFILES TABLE (linked to auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  job_title TEXT,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. USER ROLES TABLE (separate from profiles)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, facility_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. PATIENTS TABLE
-- =============================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  patient_code TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender public.gender_type,
  phone TEXT,
  address TEXT,
  next_of_kin_name TEXT,
  next_of_kin_phone TEXT,
  blood_group TEXT,
  genotype TEXT,
  allergies TEXT,
  status public.patient_status NOT NULL DEFAULT 'active',
  photo_url TEXT,
  registered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. ENCOUNTERS TABLE (clinical consultations)
-- =============================================
CREATE TABLE public.encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  clinician_id UUID REFERENCES auth.users(id),
  encounter_type public.encounter_type NOT NULL DEFAULT 'consultation',
  chief_complaint TEXT,
  symptoms JSONB DEFAULT '[]'::jsonb,
  vital_signs JSONB DEFAULT '{}'::jsonb,
  examination_notes TEXT,
  diagnosis TEXT,
  diagnosis_codes JSONB DEFAULT '[]'::jsonb,
  treatment_plan TEXT,
  prescriptions JSONB DEFAULT '[]'::jsonb,
  referral_notes TEXT,
  syndromic_flags JSONB DEFAULT '[]'::jsonb,
  is_syndromic_alert BOOLEAN NOT NULL DEFAULT false,
  encounter_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. SURVEILLANCE ALERTS TABLE
-- =============================================
CREATE TABLE public.surveillance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  disease_name TEXT NOT NULL,
  severity public.alert_severity NOT NULL DEFAULT 'medium',
  status public.alert_status NOT NULL DEFAULT 'pending',
  case_count INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  region TEXT,
  district TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.surveillance_alerts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. IMMUNIZATIONS TABLE
-- =============================================
CREATE TABLE public.immunizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  vaccine_name TEXT NOT NULL,
  dose_number INTEGER NOT NULL DEFAULT 1,
  batch_number TEXT,
  administered_by UUID REFERENCES auth.users(id),
  administered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_dose_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. LAB RESULTS TABLE
-- =============================================
CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  encounter_id UUID REFERENCES public.encounters(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  test_name TEXT NOT NULL,
  test_category TEXT,
  result TEXT,
  result_data JSONB DEFAULT '{}'::jsonb,
  reference_range TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  ordered_by UUID REFERENCES auth.users(id),
  performed_by UUID REFERENCES auth.users(id),
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resulted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 10. SECURITY DEFINER FUNCTION FOR ROLE CHECKS
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_facility_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT facility_id FROM public.profiles WHERE id = _user_id
$$;

-- =============================================
-- 11. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 12. RLS POLICIES
-- =============================================

-- FACILITIES: anyone authenticated can read, admins can modify
CREATE POLICY "Anyone can view facilities" ON public.facilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Facility admins can update their facility" ON public.facilities
  FOR UPDATE TO authenticated
  USING (id = public.get_user_facility_id(auth.uid()))
  WITH CHECK (id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Anyone can register a facility" ON public.facilities
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- PROFILES: users can read profiles in their facility, update own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view facility profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- USER ROLES: viewable by same facility, manageable by facility admins
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Facility admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'facility_admin') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- PATIENTS: facility-scoped access
CREATE POLICY "Facility staff can view patients" ON public.patients
  FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can insert patients" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can update patients" ON public.patients
  FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

-- ENCOUNTERS: facility-scoped
CREATE POLICY "Facility staff can view encounters" ON public.encounters
  FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Clinicians can create encounters" ON public.encounters
  FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Clinicians can update encounters" ON public.encounters
  FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

-- SURVEILLANCE ALERTS: broader access for epidemiologists
CREATE POLICY "Facility staff can view own alerts" ON public.surveillance_alerts
  FOR SELECT TO authenticated
  USING (
    facility_id = public.get_user_facility_id(auth.uid()) OR
    public.has_role(auth.uid(), 'epidemiologist') OR
    public.has_role(auth.uid(), 'dsno') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "System can create alerts" ON public.surveillance_alerts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authorized users can update alerts" ON public.surveillance_alerts
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'epidemiologist') OR
    public.has_role(auth.uid(), 'dsno') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- IMMUNIZATIONS: facility-scoped
CREATE POLICY "Facility staff can view immunizations" ON public.immunizations
  FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can insert immunizations" ON public.immunizations
  FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));

-- LAB RESULTS: facility-scoped
CREATE POLICY "Facility staff can view lab results" ON public.lab_results
  FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Lab staff can insert results" ON public.lab_results
  FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Lab staff can update results" ON public.lab_results
  FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

-- =============================================
-- 13. ENABLE REALTIME FOR SURVEILLANCE ALERTS
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.surveillance_alerts;
