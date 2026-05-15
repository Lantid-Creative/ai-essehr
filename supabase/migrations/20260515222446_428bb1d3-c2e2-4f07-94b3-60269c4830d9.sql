
CREATE TYPE public.nhed_app_status AS ENUM ('draft','submitted','under_review','approved','rejected','expired','suspended');
CREATE TYPE public.nhed_doc_status AS ENUM ('pending','verified','rejected');

CREATE TABLE public.nhed_empanelment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  scheme TEXT NOT NULL,
  application_ref TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  facility_tier TEXT,
  services_offered TEXT[],
  status public.nhed_app_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  reviewer_id UUID,
  reviewer_notes TEXT,
  rejection_reason TEXT,
  empanelment_code TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nhed_empanelment_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view own applications"
ON public.nhed_empanelment_applications FOR SELECT TO authenticated
USING (
  facility_id = public.get_user_facility_id(auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);
CREATE POLICY "Facility admin creates applications"
ON public.nhed_empanelment_applications FOR INSERT TO authenticated
WITH CHECK (
  (facility_id = public.get_user_facility_id(auth.uid())
   AND public.has_role(auth.uid(),'facility_admin'::app_role))
  OR public.has_role(auth.uid(),'super_admin'::app_role)
);
CREATE POLICY "Facility admin or reviewer updates"
ON public.nhed_empanelment_applications FOR UPDATE TO authenticated
USING (
  (facility_id = public.get_user_facility_id(auth.uid())
   AND public.has_role(auth.uid(),'facility_admin'::app_role))
  OR public.has_role(auth.uid(),'super_admin'::app_role)
);
CREATE POLICY "Facility admin deletes drafts"
ON public.nhed_empanelment_applications FOR DELETE TO authenticated
USING (
  (status = 'draft'
   AND facility_id = public.get_user_facility_id(auth.uid())
   AND public.has_role(auth.uid(),'facility_admin'::app_role))
  OR public.has_role(auth.uid(),'super_admin'::app_role)
);

CREATE TRIGGER trg_nhed_apps_updated
BEFORE UPDATE ON public.nhed_empanelment_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_nhed_apps_audit
AFTER INSERT OR UPDATE ON public.nhed_empanelment_applications
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

-- Documents
CREATE TABLE public.nhed_application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.nhed_empanelment_applications(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  doc_label TEXT NOT NULL,
  file_url TEXT,
  status public.nhed_doc_status NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nhed_application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View docs of accessible apps"
ON public.nhed_application_documents FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.nhed_empanelment_applications a
  WHERE a.id = application_id
    AND (a.facility_id = public.get_user_facility_id(auth.uid())
         OR public.has_role(auth.uid(),'super_admin'::app_role))
));
CREATE POLICY "Insert docs to own facility apps"
ON public.nhed_application_documents FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.nhed_empanelment_applications a
  WHERE a.id = application_id
    AND ((a.facility_id = public.get_user_facility_id(auth.uid())
          AND public.has_role(auth.uid(),'facility_admin'::app_role))
         OR public.has_role(auth.uid(),'super_admin'::app_role))
));
CREATE POLICY "Update docs"
ON public.nhed_application_documents FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.nhed_empanelment_applications a
  WHERE a.id = application_id
    AND ((a.facility_id = public.get_user_facility_id(auth.uid())
          AND public.has_role(auth.uid(),'facility_admin'::app_role))
         OR public.has_role(auth.uid(),'super_admin'::app_role))
));
CREATE POLICY "Delete docs"
ON public.nhed_application_documents FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.nhed_empanelment_applications a
  WHERE a.id = application_id
    AND ((a.facility_id = public.get_user_facility_id(auth.uid())
          AND public.has_role(auth.uid(),'facility_admin'::app_role))
         OR public.has_role(auth.uid(),'super_admin'::app_role))
));

CREATE TRIGGER trg_nhed_docs_updated
BEFORE UPDATE ON public.nhed_application_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Status events
CREATE TABLE public.nhed_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.nhed_empanelment_applications(id) ON DELETE CASCADE,
  from_status public.nhed_app_status,
  to_status public.nhed_app_status NOT NULL,
  actor_id UUID,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nhed_status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View events of accessible apps"
ON public.nhed_status_events FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.nhed_empanelment_applications a
  WHERE a.id = application_id
    AND (a.facility_id = public.get_user_facility_id(auth.uid())
         OR public.has_role(auth.uid(),'super_admin'::app_role))
));
CREATE POLICY "Insert events from server only"
ON public.nhed_status_events FOR INSERT TO authenticated
WITH CHECK (true);

-- Trigger to write a status event on every status change / create
CREATE OR REPLACE FUNCTION public.log_nhed_status_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.nhed_status_events(application_id, from_status, to_status, actor_id, comment)
    VALUES (NEW.id, NULL, NEW.status, COALESCE(auth.uid(), NEW.created_by), 'Application created');
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.nhed_status_events(application_id, from_status, to_status, actor_id, comment)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.reviewer_notes);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_nhed_status_event
AFTER INSERT OR UPDATE OF status ON public.nhed_empanelment_applications
FOR EACH ROW EXECUTE FUNCTION public.log_nhed_status_event();

CREATE INDEX idx_nhed_apps_facility ON public.nhed_empanelment_applications(facility_id);
CREATE INDEX idx_nhed_apps_status ON public.nhed_empanelment_applications(status);
CREATE INDEX idx_nhed_docs_app ON public.nhed_application_documents(application_id);
CREATE INDEX idx_nhed_events_app ON public.nhed_status_events(application_id);
