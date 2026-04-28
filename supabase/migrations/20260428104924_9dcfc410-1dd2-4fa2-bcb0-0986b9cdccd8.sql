-- =========================================================
-- Universal Audit Logging via DB Triggers
-- =========================================================

-- 1. Helper: which fields changed between OLD and NEW
CREATE OR REPLACE FUNCTION public.jsonb_diff_keys(_old jsonb, _new jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
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

-- 2. Generic audit trigger function
-- Logs every INSERT/UPDATE on the attached table to public.audit_logs.
-- Resolves facility_id from common columns; falls back to caller's facility.
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid;
  v_facility  uuid;
  v_action    text;
  v_old       jsonb;
  v_new       jsonb;
  v_changed   text[];
  v_entity_id uuid;
BEGIN
  -- Caller (NULL = background / system task)
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  IF TG_OP = 'INSERT' THEN
    v_action  := TG_TABLE_NAME || '_created';
    v_new     := to_jsonb(NEW);
    v_old     := NULL;
    v_changed := ARRAY[]::text[];
  ELSIF TG_OP = 'UPDATE' THEN
    v_action  := TG_TABLE_NAME || '_updated';
    v_new     := to_jsonb(NEW);
    v_old     := to_jsonb(OLD);
    v_changed := public.jsonb_diff_keys(v_old, v_new);
    -- Skip no-op updates (only updated_at changed)
    IF array_length(v_changed, 1) IS NULL
       OR (array_length(v_changed, 1) = 1 AND v_changed[1] = 'updated_at') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Resolve facility_id from row, falling back to caller's facility
  BEGIN
    v_facility := COALESCE(
      (v_new->>'facility_id')::uuid,
      (v_new->>'receiving_facility_id')::uuid,
      (v_new->>'referring_facility_id')::uuid,
      (v_new->>'destination_hospital_id')::uuid,
      public.get_user_facility_id(v_user_id)
    );
  EXCEPTION WHEN OTHERS THEN
    v_facility := public.get_user_facility_id(v_user_id);
  END;

  -- Resolve entity id (row id, or row itself for facilities/profiles)
  BEGIN
    v_entity_id := (v_new->>'id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_entity_id := NULL;
  END;

  INSERT INTO public.audit_logs (user_id, facility_id, action, entity_type, entity_id, details)
  VALUES (
    v_user_id,
    v_facility,
    v_action,
    TG_TABLE_NAME,
    v_entity_id,
    jsonb_build_object(
      'op',           TG_OP,
      'changed_keys', v_changed,
      'old',          v_old,
      'new',          v_new
    )
  );

  RETURN NEW;
END;
$$;

-- 3. Tighten audit_logs INSERT: only triggers/SECURITY DEFINER may write.
-- (Drop the existing user-spoofable INSERT policy.)
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;

-- Permanent default-deny for client INSERT; SECURITY DEFINER triggers bypass RLS.
CREATE POLICY "No direct client inserts to audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 4. Server-side helper for trusted edge functions / RPCs to write audit entries
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action      text,
  _entity_type text,
  _entity_id   uuid,
  _details     jsonb DEFAULT '{}'::jsonb,
  _facility_id uuid  DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.audit_logs (user_id, facility_id, action, entity_type, entity_id, details)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(_facility_id, public.get_user_facility_id(auth.uid())),
    _action,
    _entity_type,
    _entity_id,
    COALESCE(_details, '{}'::jsonb)
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 5. Attach the universal trigger to every clinical & admin table.
-- Idempotent: drops first, then recreates.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'patients',
    'encounters',
    'lab_results',
    'immunizations',
    'patient_referrals',
    'rescue_requests',
    'ambulances',
    'ambulance_care_log',
    'appointments',
    'ward_beds',
    'drug_inventory',
    'invoices',
    'invoice_items',
    'facilities',
    'profiles',
    'user_roles'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I;', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_audit_%I
         AFTER INSERT OR UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();',
      t, t
    );
  END LOOP;
END $$;

-- 6. Helpful index for the new audit query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_facility_action
  ON public.audit_logs (facility_id, action, created_at DESC);