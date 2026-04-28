-- 1. Add approval fields to facilities
ALTER TABLE public.facilities
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Ensure facility_status enum has the values we need
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rejected' AND enumtypid = 'public.facility_status'::regtype) THEN
    ALTER TYPE public.facility_status ADD VALUE 'rejected';
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'suspended' AND enumtypid = 'public.facility_status'::regtype) THEN
    ALTER TYPE public.facility_status ADD VALUE 'suspended';
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;

-- Allow super_admin to view & update any facility for approval workflow
DROP POLICY IF EXISTS "Super admins can update any facility" ON public.facilities;
CREATE POLICY "Super admins can update any facility"
ON public.facilities FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 2. Patient referrals table
CREATE TABLE IF NOT EXISTS public.patient_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  referring_facility_id uuid NOT NULL,
  receiving_facility_id uuid NOT NULL,
  referring_clinician_id uuid,
  encounter_id uuid,
  reason text NOT NULL,
  urgency text NOT NULL DEFAULT 'routine',
  clinical_summary text,
  status text NOT NULL DEFAULT 'pending',
  response_notes text,
  responded_by uuid,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_referrals ENABLE ROW LEVEL SECURITY;

-- Helper: is current user staff of either facility on this referral
CREATE OR REPLACE FUNCTION public.user_can_access_referral(_user_id uuid, _referring uuid, _receiving uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.get_user_facility_id(_user_id) IN (_referring, _receiving)
      OR public.has_role(_user_id, 'super_admin'::app_role);
$$;

CREATE POLICY "View referrals for own facility"
ON public.patient_referrals FOR SELECT TO authenticated
USING (public.user_can_access_referral(auth.uid(), referring_facility_id, receiving_facility_id));

CREATE POLICY "Referring facility can create referrals"
ON public.patient_referrals FOR INSERT TO authenticated
WITH CHECK (referring_facility_id = public.get_user_facility_id(auth.uid()));

CREATE POLICY "Receiving facility can update referral status"
ON public.patient_referrals FOR UPDATE TO authenticated
USING (receiving_facility_id = public.get_user_facility_id(auth.uid()))
WITH CHECK (receiving_facility_id = public.get_user_facility_id(auth.uid()));

-- 3. Cross-facility patient access via accepted referral
CREATE OR REPLACE FUNCTION public.user_has_referral_access_to_patient(_user_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_referrals r
    WHERE r.patient_id = _patient_id
      AND r.receiving_facility_id = public.get_user_facility_id(_user_id)
      AND r.status IN ('accepted','completed')
  );
$$;

DROP POLICY IF EXISTS "Receiving facility can view referred patient" ON public.patients;
CREATE POLICY "Receiving facility can view referred patient"
ON public.patients FOR SELECT TO authenticated
USING (public.user_has_referral_access_to_patient(auth.uid(), id));

DROP POLICY IF EXISTS "Receiving facility can view referred patient encounters" ON public.encounters;
CREATE POLICY "Receiving facility can view referred patient encounters"
ON public.encounters FOR SELECT TO authenticated
USING (public.user_has_referral_access_to_patient(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Receiving facility can view referred patient labs" ON public.lab_results;
CREATE POLICY "Receiving facility can view referred patient labs"
ON public.lab_results FOR SELECT TO authenticated
USING (public.user_has_referral_access_to_patient(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Receiving facility can view referred patient immunizations" ON public.immunizations;
CREATE POLICY "Receiving facility can view referred patient immunizations"
ON public.immunizations FOR SELECT TO authenticated
USING (public.user_has_referral_access_to_patient(auth.uid(), patient_id));

-- updated_at trigger for referrals
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_patient_referrals_updated_at ON public.patient_referrals;
CREATE TRIGGER update_patient_referrals_updated_at
BEFORE UPDATE ON public.patient_referrals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_referrals_receiving ON public.patient_referrals(receiving_facility_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_referring ON public.patient_referrals(referring_facility_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON public.patient_referrals(patient_id);