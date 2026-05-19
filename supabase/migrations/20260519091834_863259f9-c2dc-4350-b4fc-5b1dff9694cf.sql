
-- 1) user_roles: scope facility admin role management to same-facility users, exclude super_admin
DROP POLICY IF EXISTS "Facility admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Facility admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Facility admins can delete roles" ON public.user_roles;

CREATE POLICY "Facility admins can insert roles in their facility"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'facility_admin'::app_role)
    AND role <> 'super_admin'::app_role
    AND (SELECT facility_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_facility_id(auth.uid())
  )
);

CREATE POLICY "Facility admins can update roles in their facility"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'facility_admin'::app_role)
    AND role <> 'super_admin'::app_role
    AND (SELECT facility_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_facility_id(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'facility_admin'::app_role)
    AND role <> 'super_admin'::app_role
    AND (SELECT facility_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_facility_id(auth.uid())
  )
);

CREATE POLICY "Facility admins can delete roles in their facility"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'facility_admin'::app_role)
    AND role <> 'super_admin'::app_role
    AND (SELECT facility_id FROM public.profiles WHERE id = user_roles.user_id)
        = public.get_user_facility_id(auth.uid())
  )
);

-- 2) Re-scope clinical table policies from {public} to {authenticated}
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND 'public' = ANY(roles)
      AND tablename IN (
        'discharge_summaries','death_registrations','birth_registrations',
        'cold_chain_temperature_logs','cold_chain_equipment',
        'nhmis_001_submissions','nhmis_register_entries','patient_feedback'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);

    IF r.cmd = 'INSERT' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',
        r.policyname, r.tablename, COALESCE(r.with_check, 'true')
      );
    ELSIF r.cmd = 'UPDATE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
        r.policyname, r.tablename,
        COALESCE(r.qual, 'true'),
        COALESCE(r.with_check, r.qual, 'true')
      );
    ELSIF r.cmd = 'DELETE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (%s)',
        r.policyname, r.tablename, COALESCE(r.qual, 'true')
      );
    ELSIF r.cmd = 'SELECT' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (%s)',
        r.policyname, r.tablename, COALESCE(r.qual, 'true')
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (%s) WITH CHECK (%s)',
        r.policyname, r.tablename,
        COALESCE(r.qual, 'true'),
        COALESCE(r.with_check, r.qual, 'true')
      );
    END IF;
  END LOOP;
END $$;
