
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='surveillance_alerts' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.surveillance_alerts', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users insert surveillance alerts for own facility"
ON public.surveillance_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  reported_by = auth.uid()
  AND facility_id = public.get_user_facility_id(auth.uid())
);
