-- Throttle helper: counts recent inserts by the current user on a given table.
CREATE OR REPLACE FUNCTION public.enforce_rate_limit(
  _table text,
  _user_col text,
  _per_minute int,
  _per_hour int
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_min_count int;
  v_hour_count int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN; -- no auth, RLS will reject
  END IF;

  EXECUTE format(
    'SELECT
       count(*) FILTER (WHERE created_at >= now() - interval ''1 minute''),
       count(*) FILTER (WHERE created_at >= now() - interval ''1 hour'')
     FROM public.%I WHERE %I = $1',
    _table, _user_col
  ) INTO v_min_count, v_hour_count USING v_uid;

  IF v_min_count >= _per_minute THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many submissions in the last minute. Please wait.'
      USING ERRCODE = '54000';
  END IF;
  IF v_hour_count >= _per_hour THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many submissions in the last hour. Please try again later.'
      USING ERRCODE = '54000';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_rate_limit(text, text, int, int) FROM PUBLIC, anon, authenticated;

-- Trigger: rescue_requests — 3/minute, 10/hour per user
CREATE OR REPLACE FUNCTION public.throttle_rescue_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.enforce_rate_limit('rescue_requests', 'caller_user_id', 3, 10);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.throttle_rescue_requests() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_throttle_rescue ON public.rescue_requests;
CREATE TRIGGER trg_throttle_rescue
  BEFORE INSERT ON public.rescue_requests
  FOR EACH ROW EXECUTE FUNCTION public.throttle_rescue_requests();

-- Trigger: surveillance_alerts (community reports) — 5/minute, 20/hour
CREATE OR REPLACE FUNCTION public.throttle_surveillance_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.enforce_rate_limit('surveillance_alerts', 'reported_by', 5, 20);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.throttle_surveillance_alerts() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_throttle_surveillance ON public.surveillance_alerts;
CREATE TRIGGER trg_throttle_surveillance
  BEFORE INSERT ON public.surveillance_alerts
  FOR EACH ROW EXECUTE FUNCTION public.throttle_surveillance_alerts();

-- Indexes to keep the throttle queries fast
CREATE INDEX IF NOT EXISTS idx_rescue_caller_created
  ON public.rescue_requests (caller_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_surveillance_reporter_created
  ON public.surveillance_alerts (reported_by, created_at DESC);