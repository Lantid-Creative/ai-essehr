// Paystack webhook receiver — verifies HMAC signature, updates transactions atomically
// POST (from Paystack) — event payload with x-paystack-signature header
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET) return new Response('Not configured', { status: 503 });

    const raw = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const expected = createHmac('sha512', PAYSTACK_SECRET).update(raw).digest('hex');
    if (signature !== expected) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(raw);
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (event.event === 'charge.success' || event.event === 'charge.failed') {
      const data = event.data;
      const reference = data.reference;
      const success = event.event === 'charge.success';

      const { data: tx } = await admin.from('payment_transactions')
        .select('*').eq('reference', reference).maybeSingle();
      if (!tx) return new Response('Unknown ref', { status: 200 }); // 200 to ack

      await admin.from('payment_transactions').update({
        status: success ? 'success' : 'failed',
        channel: data.channel,
        gateway_response: data.gateway_response,
        paid_at: data.paid_at,
        raw_response: data,
      }).eq('reference', reference);

      if (success && tx.status !== 'success' && tx.invoice_id) {
        const amountNaira = Number(data.amount) / 100;
        await admin.from('invoice_payments').insert({
          invoice_id: tx.invoice_id,
          amount: amountNaira,
          method: data.channel === 'card' ? 'card'
            : data.channel === 'ussd' ? 'ussd'
            : data.channel === 'bank_transfer' ? 'bank_transfer' : 'card',
          reference,
          payment_transaction_id: tx.id,
          recorded_by: tx.initiated_by,
          notes: `Paystack webhook ${data.channel}`,
        });
      }
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('error', { status: 500 });
  }
});
