
-- ============================
-- 1. DRUG INVENTORY TABLE
-- ============================
CREATE TABLE public.drug_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  drug_name text NOT NULL,
  generic_name text,
  category text DEFAULT 'General',
  unit text DEFAULT 'tablets',
  quantity_in_stock integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 10,
  unit_cost numeric(10,2) DEFAULT 0,
  batch_number text,
  expiry_date date,
  supplier text,
  last_restocked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.drug_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff can view inventory"
  ON public.drug_inventory FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can insert inventory"
  ON public.drug_inventory FOR INSERT TO authenticated
  WITH CHECK (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can update inventory"
  ON public.drug_inventory FOR UPDATE TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can delete inventory"
  ON public.drug_inventory FOR DELETE TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

-- ============================
-- 2. INVOICES TABLE
-- ============================
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  encounter_id uuid REFERENCES public.encounters(id),
  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'unpaid',
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text,
  paid_at timestamp with time zone,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff can view invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can create invoices"
  ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (facility_id = get_user_facility_id(auth.uid()));

CREATE POLICY "Facility staff can update invoices"
  ON public.invoices FOR UPDATE TO authenticated
  USING (facility_id = get_user_facility_id(auth.uid()));

-- ============================
-- 3. INVOICE ITEMS TABLE
-- ============================
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'service',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accessible via invoice"
  ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id AND i.facility_id = get_user_facility_id(auth.uid())
  ));

CREATE POLICY "Insert via invoice"
  ON public.invoice_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id AND i.facility_id = get_user_facility_id(auth.uid())
  ));

-- ============================
-- 4. ADD TRIAGE PRIORITY TO APPOINTMENTS
-- ============================
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS triage_priority text DEFAULT 'routine';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS queue_number integer;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone;
