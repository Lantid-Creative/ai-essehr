
CREATE TABLE public.patient_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  submitted_by uuid,
  channel text NOT NULL DEFAULT 'in_person',
  category text NOT NULL DEFAULT 'general',
  rating int CHECK (rating BETWEEN 1 AND 5),
  subject text NOT NULL,
  message text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid,
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_feedback_facility ON public.patient_feedback(facility_id);
CREATE INDEX idx_patient_feedback_status ON public.patient_feedback(status);

ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view feedback"
ON public.patient_feedback FOR SELECT
USING (
  facility_id = public.get_user_facility_id(auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Anyone can submit feedback"
ON public.patient_feedback FOR INSERT
WITH CHECK (true);

CREATE POLICY "Facility staff update feedback"
ON public.patient_feedback FOR UPDATE
USING (
  facility_id = public.get_user_facility_id(auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins delete feedback"
ON public.patient_feedback FOR DELETE
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'facility_admin'::app_role)
);

CREATE TRIGGER trg_patient_feedback_updated
BEFORE UPDATE ON public.patient_feedback
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_patient_feedback_audit
AFTER INSERT OR UPDATE ON public.patient_feedback
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

CREATE TABLE public.feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES public.patient_feedback(id) ON DELETE CASCADE,
  responder_id uuid NOT NULL,
  response_text text NOT NULL,
  is_internal_note boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_responses_feedback ON public.feedback_responses(feedback_id);

ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view responses"
ON public.feedback_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_feedback pf
    WHERE pf.id = feedback_id
      AND (pf.facility_id = public.get_user_facility_id(auth.uid())
           OR public.has_role(auth.uid(), 'super_admin'::app_role))
  )
);

CREATE POLICY "Facility staff add responses"
ON public.feedback_responses FOR INSERT
WITH CHECK (
  responder_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.patient_feedback pf
    WHERE pf.id = feedback_id
      AND (pf.facility_id = public.get_user_facility_id(auth.uid())
           OR public.has_role(auth.uid(), 'super_admin'::app_role))
  )
);
