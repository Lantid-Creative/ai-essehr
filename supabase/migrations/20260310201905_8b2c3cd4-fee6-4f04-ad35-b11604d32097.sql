
-- Tighten the surveillance alert insert policy to require authenticated users who reported it
DROP POLICY "System can create alerts" ON public.surveillance_alerts;
CREATE POLICY "Authenticated users can create alerts" ON public.surveillance_alerts
  FOR INSERT TO authenticated
  WITH CHECK (reported_by = auth.uid());
