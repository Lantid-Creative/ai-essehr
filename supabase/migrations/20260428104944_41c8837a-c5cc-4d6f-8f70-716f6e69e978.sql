-- Lock down newly-added helpers so they can't be called from the REST/RPC surface

-- 1. jsonb_diff_keys: pin search_path and revoke public execute
CREATE OR REPLACE FUNCTION public.jsonb_diff_keys(_old jsonb, _new jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    array_agg(key ORDER BY key),
    ARRAY[]::text[]
  )
  FROM (
    SELECT key
    FROM jsonb_each(_new)
    WHERE _old->key IS DISTINCT FROM _new->key
    UNION
    SELECT key
    FROM jsonb_each(_old)
    WHERE _new->key IS DISTINCT FROM _old->key
  ) d;
$$;

REVOKE ALL ON FUNCTION public.jsonb_diff_keys(jsonb, jsonb) FROM PUBLIC, anon, authenticated;

-- 2. audit_row_change: trigger only, not API-callable
REVOKE ALL ON FUNCTION public.audit_row_change() FROM PUBLIC, anon, authenticated;

-- 3. log_audit_event: only authenticated users (edge functions / RPC for trusted server flows)
REVOKE ALL ON FUNCTION public.log_audit_event(text, text, uuid, jsonb, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, jsonb, uuid) TO authenticated;