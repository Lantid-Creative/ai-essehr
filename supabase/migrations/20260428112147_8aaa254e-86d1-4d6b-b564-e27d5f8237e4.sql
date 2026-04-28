
-- Add amount_paid to invoices for partial payment support
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC NOT NULL DEFAULT 0;

-- Payment transactions (Paystack init/verify cycle)
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  invoice_id UUID,
  patient_id UUID,
  facility_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  channel TEXT,
  provider TEXT NOT NULL DEFAULT 'paystack',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','abandoned','reversed')),
  gateway_response TEXT,
  authorization_url TEXT,
  access_code TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  raw_response JSONB,
  initiated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pay_tx_invoice ON public.payment_transactions(invoice_id);
CREATE INDEX idx_pay_tx_facility ON public.payment_transactions(facility_id);
CREATE INDEX idx_pay_tx_status ON public.payment_transactions(status);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facility staff view own transactions"
ON public.payment_transactions FOR SELECT TO authenticated
USING (facility_id = public.get_user_facility_id(auth.uid())
       OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Facility staff init transactions"
ON public.payment_transactions FOR INSERT TO authenticated
WITH CHECK (facility_id = public.get_user_facility_id(auth.uid())
            AND initiated_by = auth.uid());

-- Updates only by service role (webhook). No client UPDATE policy = blocked by default.

CREATE TRIGGER trg_pay_tx_updated
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Invoice payments ledger (supports part payments + cash)
CREATE TABLE public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','card','ussd','bank_transfer','pos','nhis','other')),
  reference TEXT,
  payment_transaction_id UUID,
  notes TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inv_pay_invoice ON public.invoice_payments(invoice_id);

ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View invoice payments via invoice access"
ON public.invoice_payments FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.invoices i
  WHERE i.id = invoice_payments.invoice_id
    AND i.facility_id = public.get_user_facility_id(auth.uid())
));

CREATE POLICY "Insert invoice payments via invoice access"
ON public.invoice_payments FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.invoices i
  WHERE i.id = invoice_payments.invoice_id
    AND i.facility_id = public.get_user_facility_id(auth.uid())
) AND recorded_by = auth.uid());

-- Trigger: after invoice payment, update invoice amount_paid + status
CREATE OR REPLACE FUNCTION public.apply_invoice_payment()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total NUMERIC;
  v_paid  NUMERIC;
BEGIN
  UPDATE public.invoices
     SET amount_paid = amount_paid + NEW.amount,
         updated_at = now()
   WHERE id = NEW.invoice_id
   RETURNING total, amount_paid INTO v_total, v_paid;

  IF v_paid >= v_total THEN
    UPDATE public.invoices
       SET status = 'paid',
           paid_at = COALESCE(paid_at, now()),
           payment_method = COALESCE(payment_method, NEW.method)
     WHERE id = NEW.invoice_id;
  ELSIF v_paid > 0 THEN
    UPDATE public.invoices SET status = 'partial' WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_invoice_payment
AFTER INSERT ON public.invoice_payments
FOR EACH ROW EXECUTE FUNCTION public.apply_invoice_payment();
