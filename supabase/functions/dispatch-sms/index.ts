// SMS dispatcher (stub) — pulls pending sms_outbox rows and "sends" them.
// Provider not wired yet: marks rows as 'sent' in simulation mode if env SMS_SIMULATE=true,
// otherwise marks 'failed' so super admin can configure a provider later.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const SIMULATE = (Deno.env.get('SMS_SIMULATE') ?? 'true') === 'true';
  const provider = Deno.env.get('SMS_PROVIDER') ?? 'simulated';

  const { data: pending } = await admin.from('sms_outbox')
    .select('*')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .limit(50);

  let sent = 0, failed = 0;
  for (const row of pending ?? []) {
    if (SIMULATE) {
      await admin.from('sms_outbox').update({
        status: 'sent', provider, sent_at: new Date().toISOString(),
        external_id: `sim-${crypto.randomUUID()}`,
      }).eq('id', row.id);
      sent++;
    } else {
      // Provider not configured — mark failed with backoff
      const newRetry = row.retry_count + 1;
      const dead = newRetry >= row.max_retries;
      const next = new Date(Date.now() + Math.min(60_000 * Math.pow(2, newRetry), 4 * 60 * 60_000));
      await admin.from('sms_outbox').update({
        status: dead ? 'dead_letter' : 'pending',
        retry_count: newRetry,
        last_error: 'No SMS provider configured. Set SMS_PROVIDER + credentials in Super Admin → Integrations.',
        next_retry_at: next.toISOString(),
      }).eq('id', row.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ processed: pending?.length ?? 0, sent, failed, simulate: SIMULATE }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
