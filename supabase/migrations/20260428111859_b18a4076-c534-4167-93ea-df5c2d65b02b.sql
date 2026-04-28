
-- Platform settings (global key-value store for integrations & feature flags)
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage platform settings"
ON public.platform_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_platform_settings_updated
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User suspensions
CREATE TABLE public.user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  suspended_by UUID NOT NULL,
  suspended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lifted_at TIMESTAMPTZ,
  lifted_by UUID
);

ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage suspensions"
ON public.user_suspensions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own suspension"
ON public.user_suspensions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_user_suspended(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_suspensions
    WHERE user_id = _user_id AND lifted_at IS NULL
  );
$$;

-- Add suspension flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

-- Trigger to sync is_suspended on profiles when suspension changes
CREATE OR REPLACE FUNCTION public.sync_profile_suspension()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET is_suspended = true WHERE id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
       SET is_suspended = (NEW.lifted_at IS NULL)
     WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET is_suspended = false WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_profile_suspension
AFTER INSERT OR UPDATE OR DELETE ON public.user_suspensions
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_suspension();

-- Broadcast announcements
CREATE TABLE public.broadcast_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  target_role TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage broadcasts"
ON public.broadcast_announcements FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users view active broadcasts"
ON public.broadcast_announcements FOR SELECT TO authenticated
USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE TRIGGER trg_broadcasts_updated
BEFORE UPDATE ON public.broadcast_announcements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-facility payment credentials (Paystack subaccount)
CREATE TABLE public.facility_payment_credentials (
  facility_id UUID PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'paystack',
  subaccount_code TEXT,
  settlement_bank TEXT,
  account_number TEXT,
  business_name TEXT,
  percentage_charge NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  configured_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.facility_payment_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility admin manages own facility credentials"
ON public.facility_payment_credentials FOR ALL TO authenticated
USING (
  (facility_id = public.get_user_facility_id(auth.uid())
   AND public.has_role(auth.uid(), 'facility_admin'::app_role))
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (facility_id = public.get_user_facility_id(auth.uid())
   AND public.has_role(auth.uid(), 'facility_admin'::app_role))
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE TRIGGER trg_fac_pay_creds_updated
BEFORE UPDATE ON public.facility_payment_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default platform setting rows (so the UI has placeholders)
INSERT INTO public.platform_settings (key, value, description, is_secret) VALUES
  ('integration.sormas',  '{"base_url": "", "configured": false}'::jsonb, 'SORMAS API endpoint configuration', false),
  ('integration.dhis2',   '{"base_url": "", "configured": false}'::jsonb, 'DHIS2 API endpoint configuration', false),
  ('integration.twilio',  '{"sender_id": "AI-PEWS", "configured": false}'::jsonb, 'Twilio SMS / WhatsApp configuration', false),
  ('integration.paystack', '{"public_key": "", "configured": false}'::jsonb, 'Paystack platform-level public key', false),
  ('feature.flags',       '{"community_portal": true, "ai_anomaly": true, "rescue_tap": true}'::jsonb, 'Feature flags', false)
ON CONFLICT (key) DO NOTHING;
