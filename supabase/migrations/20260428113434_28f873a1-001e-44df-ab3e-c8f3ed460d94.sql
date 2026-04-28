-- =========================================================
-- EPIC A: Production-readiness foundation
-- =========================================================

-- ---------- INSURANCE & CLAIMS ----------

CREATE TABLE public.insurance_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  name TEXT NOT NULL,
  scheme_type TEXT NOT NULL CHECK (scheme_type IN ('nhia','hmo','corporate','cbhis','state')),
  code TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  default_copay_percent NUMERIC NOT NULL DEFAULT 10,
  preauth_required BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  tariff_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view schemes" ON public.insurance_schemes FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility admin manages schemes" ON public.insurance_schemes FOR ALL TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()) AND (public.has_role(auth.uid(),'facility_admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_schemes_uat BEFORE UPDATE ON public.insurance_schemes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.patient_insurance_enrolments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  scheme_id UUID NOT NULL REFERENCES public.insurance_schemes(id) ON DELETE RESTRICT,
  policy_number TEXT NOT NULL,
  valid_from DATE,
  valid_until DATE,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  dependents JSONB NOT NULL DEFAULT '[]'::jsonb,
  card_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patient_insurance_enrolments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view enrolments" ON public.patient_insurance_enrolments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.facility_id = public.get_user_facility_id(auth.uid())));
CREATE POLICY "Facility staff manage enrolments" ON public.patient_insurance_enrolments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.facility_id = public.get_user_facility_id(auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.facility_id = public.get_user_facility_id(auth.uid())));
CREATE TRIGGER trg_enrol_uat BEFORE UPDATE ON public.patient_insurance_enrolments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.insurance_preauthorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  scheme_id UUID NOT NULL REFERENCES public.insurance_schemes(id),
  enrolment_id UUID REFERENCES public.patient_insurance_enrolments(id),
  encounter_id UUID,
  reason TEXT NOT NULL,
  estimated_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  authorization_code TEXT,
  scheme_response TEXT,
  requested_by UUID,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_preauthorizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view preauths" ON public.insurance_preauthorizations FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff create preauths" ON public.insurance_preauthorizations FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND requested_by = auth.uid());
CREATE POLICY "Facility staff update preauths" ON public.insurance_preauthorizations FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_preauth_uat BEFORE UPDATE ON public.insurance_preauthorizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.insurance_claim_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  scheme_id UUID NOT NULL REFERENCES public.insurance_schemes(id),
  batch_number TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','submitted','reconciled','closed')),
  submitted_at TIMESTAMPTZ,
  reconciled_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_claim_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view batches" ON public.insurance_claim_batches FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff manage batches" ON public.insurance_claim_batches FOR ALL TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()))
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_batch_uat BEFORE UPDATE ON public.insurance_claim_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID,
  invoice_id UUID,
  scheme_id UUID NOT NULL REFERENCES public.insurance_schemes(id),
  enrolment_id UUID REFERENCES public.patient_insurance_enrolments(id),
  preauth_id UUID REFERENCES public.insurance_preauthorizations(id),
  batch_id UUID REFERENCES public.insurance_claim_batches(id),
  claim_number TEXT NOT NULL,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  copay_amount NUMERIC NOT NULL DEFAULT 0,
  scheme_payable NUMERIC NOT NULL DEFAULT 0,
  scheme_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','partially_paid','paid','rejected','cancelled')),
  rejection_reason TEXT,
  diagnosis_code TEXT,
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view claims" ON public.insurance_claims FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff create claims" ON public.insurance_claims FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Facility staff update claims" ON public.insurance_claims FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_claim_uat BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.insurance_claim_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'service',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  scheme_tariff NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_claim_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View items via claim" ON public.insurance_claim_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.facility_id = public.get_user_facility_id(auth.uid())));
CREATE POLICY "Insert items via claim" ON public.insurance_claim_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.insurance_claims c WHERE c.id = claim_id AND c.facility_id = public.get_user_facility_id(auth.uid())));

-- ---------- CASHIER ----------

CREATE TABLE public.cashier_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  cashier_id UUID NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opening_cash NUMERIC NOT NULL DEFAULT 0,
  expected_cash NUMERIC NOT NULL DEFAULT 0,
  actual_cash NUMERIC,
  variance NUMERIC,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cashier_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view shifts" ON public.cashier_shifts FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Cashier opens own shift" ON public.cashier_shifts FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND cashier_id = auth.uid());
CREATE POLICY "Cashier closes own shift" ON public.cashier_shifts FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()) AND (cashier_id = auth.uid() OR public.has_role(auth.uid(),'facility_admin')));
CREATE TRIGGER trg_shift_uat BEFORE UPDATE ON public.cashier_shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cashier_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.cashier_shifts(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('cash_in','cash_out','refund','petty_cash','deposit','payment')),
  amount NUMERIC NOT NULL,
  reference TEXT,
  invoice_id UUID,
  notes TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cashier_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View via shift" ON public.cashier_movements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cashier_shifts s WHERE s.id = shift_id AND s.facility_id = public.get_user_facility_id(auth.uid())));
CREATE POLICY "Record on own open shift" ON public.cashier_movements FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.cashier_shifts s WHERE s.id = shift_id AND s.facility_id = public.get_user_facility_id(auth.uid()) AND s.status='open') AND recorded_by = auth.uid());

CREATE TABLE public.patient_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  balance NUMERIC NOT NULL,
  reference TEXT,
  recorded_by UUID NOT NULL,
  shift_id UUID REFERENCES public.cashier_shifts(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patient_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view deposits" ON public.patient_deposits FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff record deposits" ON public.patient_deposits FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND recorded_by = auth.uid());
CREATE POLICY "Facility staff update deposits" ON public.patient_deposits FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_dep_uat BEFORE UPDATE ON public.patient_deposits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- NURSE: MAR + VITALS ----------

CREATE TABLE public.medication_administrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID,
  drug_name TEXT NOT NULL,
  dose TEXT NOT NULL,
  route TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  administered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('due','given','refused','held','missed')),
  hold_reason TEXT,
  administered_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medication_administrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view MAR" ON public.medication_administrations FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff create MAR" ON public.medication_administrations FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff update MAR" ON public.medication_administrations FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_mar_uat BEFORE UPDATE ON public.medication_administrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vitals_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  temperature_c NUMERIC,
  pulse_bpm INTEGER,
  respiratory_rate INTEGER,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  spo2 INTEGER,
  consciousness TEXT,
  pain_score INTEGER,
  news2_score INTEGER,
  recorded_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vitals_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view vitals" ON public.vitals_observations FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff create vitals" ON public.vitals_observations FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND recorded_by = auth.uid());

-- ---------- LAB: SPECIMENS + CRITICAL VALUES ----------

CREATE TABLE public.specimens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID,
  lab_result_id UUID,
  barcode TEXT NOT NULL,
  specimen_type TEXT NOT NULL,
  test_requested TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'collected' CHECK (status IN ('collected','received','in_progress','resulted','rejected')),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  collected_by UUID,
  received_at TIMESTAMPTZ,
  received_by UUID,
  resulted_at TIMESTAMPTZ,
  rejection_reason TEXT,
  chain_of_custody JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.specimens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view specimens" ON public.specimens FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff create specimens" ON public.specimens FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff update specimens" ON public.specimens FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_spec_uat BEFORE UPDATE ON public.specimens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.critical_value_callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  lab_result_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  notified_clinician_id UUID,
  notified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_by UUID NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  callback_method TEXT NOT NULL DEFAULT 'in_app' CHECK (callback_method IN ('in_app','phone','sms')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.critical_value_callbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view callbacks" ON public.critical_value_callbacks FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Lab staff create callbacks" ON public.critical_value_callbacks FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND notified_by = auth.uid());
CREATE POLICY "Clinician acknowledges callback" ON public.critical_value_callbacks FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));

-- ---------- CLINICAL: SIGNOFFS, CONSENTS, TASKS ----------

CREATE TABLE public.encounter_signoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  signed_by UUID NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature_text TEXT NOT NULL,
  encounter_snapshot JSONB NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);
ALTER TABLE public.encounter_signoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view signoffs" ON public.encounter_signoffs FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Clinician signs own encounter" ON public.encounter_signoffs FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND signed_by = auth.uid());

CREATE TABLE public.consent_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('surgery','anaesthesia','hiv_testing','ndpr_data','treatment','blood_transfusion','other')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  signed_at TIMESTAMPTZ,
  signed_by_patient_name TEXT,
  signature_image_url TEXT,
  witness_name TEXT,
  witness_signature_url TEXT,
  collected_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','signed','refused','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view consents" ON public.consent_forms FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff create consents" ON public.consent_forms FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()) AND collected_by = auth.uid());
CREATE POLICY "Facility staff update consents" ON public.consent_forms FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_consent_uat BEFORE UPDATE ON public.consent_forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.clinical_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  assignee_id UUID,
  assignee_role TEXT,
  patient_id UUID,
  encounter_id UUID,
  related_entity_type TEXT,
  related_entity_id UUID,
  task_type TEXT NOT NULL CHECK (task_type IN ('review_lab','ack_abnormal','refill_request','referral_response','signoff','consent_pending','preauth_pending','critical_value','other')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done','dismissed')),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clinical_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view tasks" ON public.clinical_tasks FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff create tasks" ON public.clinical_tasks FOR INSERT TO authenticated
  WITH CHECK (facility_id = public.get_user_facility_id(auth.uid()));
CREATE POLICY "Facility staff update tasks" ON public.clinical_tasks FOR UPDATE TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()));
CREATE TRIGGER trg_task_uat BEFORE UPDATE ON public.clinical_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- SMS OUTBOX (provider-agnostic stub) ----------

CREATE TABLE public.sms_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID,
  to_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms','whatsapp','voice')),
  provider TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','dead_letter')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ DEFAULT now(),
  related_entity_type TEXT,
  related_entity_id UUID,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  external_id TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sms_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Facility staff view sms" ON public.sms_outbox FOR SELECT TO authenticated
  USING (facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Facility staff queue sms" ON public.sms_outbox FOR INSERT TO authenticated
  WITH CHECK ((facility_id = public.get_user_facility_id(auth.uid()) OR public.has_role(auth.uid(),'super_admin')) AND created_by = auth.uid());
CREATE POLICY "No direct sms updates" ON public.sms_outbox FOR UPDATE TO authenticated USING (false);
CREATE TRIGGER trg_sms_uat BEFORE UPDATE ON public.sms_outbox FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- TRIGGERS: auto task creation ----------

CREATE OR REPLACE FUNCTION public.task_on_abnormal_lab()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_abnormal = true AND (OLD.is_abnormal IS DISTINCT FROM NEW.is_abnormal) THEN
    INSERT INTO public.clinical_tasks (facility_id, assignee_id, assignee_role, patient_id, encounter_id, related_entity_type, related_entity_id, task_type, title, description, priority, created_by)
    VALUES (NEW.facility_id, NEW.ordered_by, 'doctor', NEW.patient_id, NEW.encounter_id, 'lab_result', NEW.id, 'ack_abnormal',
            'Abnormal lab result: ' || NEW.test_name,
            COALESCE('Result: ' || NEW.result, 'Abnormal flagged'), 'high', COALESCE(auth.uid(), NEW.performed_by));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_task_abnormal_lab AFTER UPDATE ON public.lab_results
  FOR EACH ROW EXECUTE FUNCTION public.task_on_abnormal_lab();

CREATE OR REPLACE FUNCTION public.task_on_referral()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.clinical_tasks (facility_id, assignee_role, patient_id, related_entity_type, related_entity_id, task_type, title, description, priority, created_by)
  VALUES (NEW.receiving_facility_id, 'doctor', NEW.patient_id, 'referral', NEW.id, 'referral_response',
          'Incoming referral (' || NEW.urgency || ')',
          COALESCE(NEW.reason, ''), CASE WHEN NEW.urgency='emergency' THEN 'urgent' WHEN NEW.urgency='urgent' THEN 'high' ELSE 'normal' END,
          NEW.referring_clinician_id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_task_referral AFTER INSERT ON public.patient_referrals
  FOR EACH ROW EXECUTE FUNCTION public.task_on_referral();

-- ---------- INDEXES ----------
CREATE INDEX idx_claims_facility_status ON public.insurance_claims(facility_id, status);
CREATE INDEX idx_tasks_assignee_status ON public.clinical_tasks(assignee_id, status);
CREATE INDEX idx_tasks_facility_status ON public.clinical_tasks(facility_id, status);
CREATE INDEX idx_mar_patient_scheduled ON public.medication_administrations(patient_id, scheduled_at DESC);
CREATE INDEX idx_vitals_patient_observed ON public.vitals_observations(patient_id, observed_at DESC);
CREATE INDEX idx_specimens_facility_status ON public.specimens(facility_id, status);
CREATE INDEX idx_sms_outbox_status_retry ON public.sms_outbox(status, next_retry_at);
CREATE INDEX idx_shifts_cashier_status ON public.cashier_shifts(cashier_id, status);
