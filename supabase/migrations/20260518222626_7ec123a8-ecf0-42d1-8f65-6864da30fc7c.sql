
-- 1. Remove plaintext credentials column
ALTER TABLE public.demo_seed_status DROP COLUMN IF EXISTS credentials;

-- 2. Prevent privilege escalation via user_roles
DROP POLICY IF EXISTS "Facility admins can manage roles" ON public.user_roles;

CREATE POLICY "Super admins manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Facility admins manage non-super roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'facility_admin'::app_role)
  AND role <> 'super_admin'::app_role
);

CREATE POLICY "Facility admins update non-super roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'facility_admin'::app_role)
  AND role <> 'super_admin'::app_role
)
WITH CHECK (
  has_role(auth.uid(), 'facility_admin'::app_role)
  AND role <> 'super_admin'::app_role
);

CREATE POLICY "Facility admins delete non-super roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'facility_admin'::app_role)
  AND role <> 'super_admin'::app_role
);

-- 3. Patient feedback: require authentication
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.patient_feedback;
CREATE POLICY "Authenticated users submit feedback"
ON public.patient_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. NHED status events: restrict insert
DROP POLICY IF EXISTS "Insert events from server only" ON public.nhed_status_events;
CREATE POLICY "Insert events for own facility apps"
ON public.nhed_status_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.nhed_empanelment_applications a
    WHERE a.id = nhed_status_events.application_id
      AND (
        a.facility_id = get_user_facility_id(auth.uid())
        OR has_role(auth.uid(), 'super_admin'::app_role)
      )
  )
);

-- 5. Lock down SECURITY DEFINER helper functions from direct API execution.
-- These are intended to be invoked from RLS policies, triggers, or other server
-- code, never directly by anon/authenticated clients.
REVOKE EXECUTE ON FUNCTION public.apply_invoice_payment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_row_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_rate_limit(text, text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_case_dispatches() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.flag_cold_chain_excursion() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_facility_id(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_user_suspended(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, jsonb, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_nhed_status_event() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_case_sla_due_dates() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_profile_suspension() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.task_on_abnormal_lab() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.task_on_referral() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.throttle_rescue_requests() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.throttle_surveillance_alerts() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_can_access_referral(uuid, uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_can_view_rescue(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_has_referral_access_to_patient(uuid, uuid) FROM anon, authenticated;
