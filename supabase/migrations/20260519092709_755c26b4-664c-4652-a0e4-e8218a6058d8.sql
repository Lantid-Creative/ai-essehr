
-- Drop unscoped facility admin policies on user_roles
DROP POLICY IF EXISTS "Facility admins manage non-super roles" ON public.user_roles;
DROP POLICY IF EXISTS "Facility admins update non-super roles" ON public.user_roles;
DROP POLICY IF EXISTS "Facility admins delete non-super roles" ON public.user_roles;

-- Re-scope feedback_responses policies to authenticated
DROP POLICY IF EXISTS "Facility staff add responses" ON public.feedback_responses;
DROP POLICY IF EXISTS "Facility staff view responses" ON public.feedback_responses;

CREATE POLICY "Facility staff add responses"
ON public.feedback_responses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patient_feedback pf
    WHERE pf.id = feedback_responses.feedback_id
      AND pf.facility_id = public.get_user_facility_id(auth.uid())
  )
);

CREATE POLICY "Facility staff view responses"
ON public.feedback_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patient_feedback pf
    WHERE pf.id = feedback_responses.feedback_id
      AND pf.facility_id = public.get_user_facility_id(auth.uid())
  )
);
