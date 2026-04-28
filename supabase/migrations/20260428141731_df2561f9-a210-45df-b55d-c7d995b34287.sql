
CREATE TABLE IF NOT EXISTS public.demo_seed_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL,
  message text,
  credentials jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.demo_seed_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_admin can read seed status" ON public.demo_seed_status
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'::app_role));
