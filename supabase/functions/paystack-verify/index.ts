// Verify a Paystack transaction by reference (idempotent)
// POST { reference: string }
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET) return json({ error: 'Paystack not configured' }, 503);

    const { reference } = await req.json();
    if (!reference) return json({ error: 'reference required' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const psJson = await psRes.json();
    if (!psRes.ok || !psJson.status) {
      return json({ error: psJson.message || 'Verify failed', detail: psJson }, 502);
    }

    const data = psJson.data;
    const success = data.status === 'success';

    // Fetch existing transaction
    const { data: tx } = await admin.from('payment_transactions')
      .select('*').eq('reference', reference).maybeSingle();
    if (!tx) return json({ error: 'Unknown reference' }, 404);

    // Idempotent update
    await admin.from('payment_transactions').update({
      status: success ? 'success' : (data.status === 'abandoned' ? 'abandoned' : 'failed'),
      channel: data.channel,
      gateway_response: data.gateway_response,
      paid_at: data.paid_at,
      raw_response: data,
    }).eq('reference', reference);

    // If success and not already credited, write to invoice_payments
    if (success && tx.status !== 'success' && tx.invoice_id) {
      const amountNaira = Number(data.amount) / 100;
      // Use service role insert (bypasses RLS)
      await admin.from('invoice_payments').insert({
        invoice_id: tx.invoice_id,
        amount: amountNaira,
        method: data.channel === 'card' ? 'card'
          : data.channel === 'ussd' ? 'ussd'
          : data.channel === 'bank_transfer' ? 'bank_transfer'
          : 'card',
        reference,
        payment_transaction_id: tx.id,
        recorded_by: tx.initiated_by,
        notes: `Paystack ${data.channel}`,
      });
    }

    return json({ status: success ? 'success' : data.status, amount: data.amount / 100 });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: any, status = 200) {
  return new Response(JSON.stringify(b), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
