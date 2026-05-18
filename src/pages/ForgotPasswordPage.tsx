import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-5">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white rounded-3xl border border-black/5 p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-primary grid place-items-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-ink">Integra+</span>
          </div>

          {sent ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
              <h2 className="editorial-display text-2xl text-ink">Check your email.</h2>
              <p className="text-ink-soft text-sm">
                We sent a reset link to <strong className="text-ink">{email}</strong>.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-2 rounded-full">Back to sign in</Button>
              </Link>
            </div>
          ) : (
            <>
              <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Account recovery</span>
              <h1 className="editorial-display text-ink text-3xl mt-3 mb-2">Forgot password?</h1>
              <p className="text-sm text-ink-soft mb-6">Enter your email — we'll send a secure reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@facility.org" className="mt-1.5 h-11" required />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-full bg-ink text-[hsl(var(--cream))] hover:bg-ink/90" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending…</> : 'Send reset link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
