
-- Fix the permissive INSERT policy on facilities - restrict to only create facility if user has no facility yet
DROP POLICY IF EXISTS "Anyone can register a facility" ON public.facilities;
CREATE POLICY "Authenticated users can register a facility" ON public.facilities
  FOR INSERT TO authenticated WITH CHECK (
    get_user_facility_id(auth.uid()) IS NULL OR has_role(auth.uid(), 'super_admin')
  );
