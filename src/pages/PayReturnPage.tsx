import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Receipt } from 'lucide-react';

export default function PayReturnPage() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref') || params.get('ref');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'pending'>('verifying');
  const [amount, setAmount] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) { setStatus('failed'); setErr('Missing payment reference.'); return; }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('paystack-verify', { body: { reference } });
        if (error) throw error;
        if (data?.status === 'success') {
          setStatus('success');
          setAmount(data.amount);
        } else if (data?.status === 'abandoned' || data?.status === 'failed') {
          setStatus('failed');
          setErr(data.status);
        } else {
          setStatus('pending');
        }
      } catch (e: any) {
        setStatus('failed');
        setErr(e.message || String(e));
      }
    })();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p>Verifying your payment…</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Payment successful!</h2>
              {amount && <p className="text-lg">₦{amount.toLocaleString()}</p>}
              <p className="text-sm text-muted-foreground">Reference: <code className="font-mono">{reference}</code></p>
            </>
          )}
          {status === 'pending' && (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-amber-500" />
              <p>Payment is still being processed. You'll be notified shortly.</p>
            </>
          )}
          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold">Payment not completed</h2>
              {err && <p className="text-sm text-muted-foreground">{err}</p>}
            </>
          )}
          <Button asChild className="w-full"><Link to="/dashboard">Return to dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
