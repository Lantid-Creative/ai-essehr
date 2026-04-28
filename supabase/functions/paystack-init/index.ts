// Initialize a Paystack transaction for an invoice
// POST { invoice_id: uuid, callback_url?: string, channels?: string[] }
// Returns { authorization_url, access_code, reference }
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PAYSTACK_BASE = 'https://api.paystack.co';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!PAYSTACK_SECRET) {
      return json({ error: 'Paystack not configured. Add PAYSTACK_SECRET_KEY in backend secrets.' }, 503);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const { invoice_id, callback_url, channels } = body;
    if (!invoice_id) return json({ error: 'invoice_id required' }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Fetch invoice + patient
    const { data: invoice, error: invErr } = await admin
      .from('invoices')
      .select('id, total, amount_paid, status, facility_id, patient_id, invoice_number, patients(first_name, last_name, phone)')
      .eq('id', invoice_id)
      .maybeSingle();

    if (invErr || !invoice) return json({ error: 'Invoice not found' }, 404);

    const balance = Number(invoice.total) - Number(invoice.amount_paid || 0);
    if (balance <= 0) return json({ error: 'Invoice already paid in full' }, 400);

    // Check facility-level Paystack subaccount (optional split payment)
    const { data: facCreds } = await admin
      .from('facility_payment_credentials')
      .select('subaccount_code, is_active')
      .eq('facility_id', invoice.facility_id)
      .maybeSingle();

    const reference = `AIPEWS_${invoice.invoice_number || invoice.id.slice(0, 8)}_${Date.now()}`;
    const patient: any = invoice.patients;
    const email = `patient_${invoice.patient_id}@aipews.local`; // Paystack requires email

    const initBody: any = {
      email,
      amount: Math.round(balance * 100), // kobo
      reference,
      callback_url: callback_url || `${new URL(req.url).origin.replace(/functions\..*$/, '')}/pay/return?ref=${reference}`,
      currency: 'NGN',
      channels: channels || ['card', 'bank', 'ussd', 'bank_transfer', 'mobile_money'],
      metadata: {
        invoice_id,
        facility_id: invoice.facility_id,
        patient_id: invoice.patient_id,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : null,
        invoice_number: invoice.invoice_number,
      },
    };
    if (facCreds?.subaccount_code && facCreds.is_active) {
      initBody.subaccount = facCreds.subaccount_code;
      initBody.bearer = 'subaccount';
    }

    const psRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initBody),
    });
    const psJson = await psRes.json();
    if (!psRes.ok || !psJson.status) {
      return json({ error: psJson.message || 'Paystack init failed', detail: psJson }, 502);
    }

    // Persist pending transaction
    await admin.from('payment_transactions').insert({
      reference,
      invoice_id,
      patient_id: invoice.patient_id,
      facility_id: invoice.facility_id,
      amount: balance,
      currency: 'NGN',
      status: 'pending',
      authorization_url: psJson.data.authorization_url,
      access_code: psJson.data.access_code,
      initiated_by: user.id,
      metadata: initBody.metadata,
    });

    return json({
      reference,
      authorization_url: psJson.data.authorization_url,
      access_code: psJson.data.access_code,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: any, status = 200) {
  return new Response(JSON.stringify(b), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
