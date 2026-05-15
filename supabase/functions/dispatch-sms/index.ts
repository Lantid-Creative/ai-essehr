// SMS / Voice dispatcher — Termii provider
// Pulls pending sms_outbox rows and sends via Termii API.
// Channels supported: sms, whatsapp, voice
// Falls back to simulation mode if TERMII_API_KEY is not configured (or SMS_SIMULATE=true).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TERMII_BASE = 'https://api.ng.termii.com/api';

function normalizeMsisdn(raw: string): string {
  // Termii expects international format without '+', e.g. 2348012345678
  let n = (raw ?? '').replace(/[^\d+]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('0') && n.length === 11) n = '234' + n.slice(1);
  return n;
}

async function sendViaTermii(opts: {
  apiKey: string;
  senderId: string;
  to: string;
  message: string;
  channel: 'sms' | 'whatsapp' | 'voice';
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const to = normalizeMsisdn(opts.to);

  if (opts.channel === 'voice') {
    // Termii voice: text-to-speech call
    const res = await fetch(`${TERMII_BASE}/sms/otp/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: opts.apiKey,
        phone_number: to,
        // Termii's voice endpoint is OTP-style; we re-use it to deliver a short numeric code
        // For free-form voice content, switch to /api/sms/send with channel:'dnd' + voice add-on
        code: opts.message.replace(/\D/g, '').slice(0, 8) || '0000',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `Termii voice ${res.status}: ${JSON.stringify(data)}` };
    return { ok: true, id: data.pinId ?? data.message_id };
  }

  const channel = opts.channel === 'whatsapp' ? 'whatsapp' : 'generic';
  const res = await fetch(`${TERMII_BASE}/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: opts.apiKey,
      to,
      from: opts.senderId,
      sms: opts.message,
      type: 'plain',
      channel,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.code === 'error') {
    return { ok: false, error: `Termii ${res.status}: ${JSON.stringify(data)}` };
  }
  return { ok: true, id: data.message_id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY') ?? '';
  const TERMII_SENDER_ID = Deno.env.get('TERMII_SENDER_ID') ?? 'AI-PEWS';
  const SIMULATE = (Deno.env.get('SMS_SIMULATE') ?? '').toLowerCase() === 'true' || !TERMII_API_KEY;
  const provider = SIMULATE ? 'simulated' : 'termii';

  const { data: pending, error: fetchErr } = await admin.from('sms_outbox')
    .select('*')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .limit(50);

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let sent = 0, failed = 0;
  for (const row of pending ?? []) {
    try {
      let result: { ok: boolean; id?: string; error?: string };
      if (SIMULATE) {
        result = { ok: true, id: `sim-${crypto.randomUUID()}` };
      } else {
        result = await sendViaTermii({
          apiKey: TERMII_API_KEY,
          senderId: TERMII_SENDER_ID,
          to: row.to_phone,
          message: row.message,
          channel: (row.channel as 'sms' | 'whatsapp' | 'voice') ?? 'sms',
        });
      }

      if (result.ok) {
        await admin.from('sms_outbox').update({
          status: 'sent',
          provider,
          sent_at: new Date().toISOString(),
          external_id: result.id ?? null,
          last_error: null,
        }).eq('id', row.id);
        sent++;
      } else {
        const newRetry = row.retry_count + 1;
        const dead = newRetry >= row.max_retries;
        const next = new Date(Date.now() + Math.min(60_000 * Math.pow(2, newRetry), 4 * 60 * 60_000));
        await admin.from('sms_outbox').update({
          status: dead ? 'dead_letter' : 'pending',
          provider,
          retry_count: newRetry,
          last_error: result.error ?? 'Unknown send failure',
          next_retry_at: next.toISOString(),
        }).eq('id', row.id);
        failed++;
      }
    } catch (e) {
      const newRetry = row.retry_count + 1;
      const dead = newRetry >= row.max_retries;
      const next = new Date(Date.now() + Math.min(60_000 * Math.pow(2, newRetry), 4 * 60 * 60_000));
      await admin.from('sms_outbox').update({
        status: dead ? 'dead_letter' : 'pending',
        provider,
        retry_count: newRetry,
        last_error: (e as Error).message,
        next_retry_at: next.toISOString(),
      }).eq('id', row.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({
    processed: pending?.length ?? 0, sent, failed, simulate: SIMULATE, provider,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
