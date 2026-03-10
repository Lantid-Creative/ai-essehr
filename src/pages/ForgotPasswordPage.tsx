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

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-xl font-heading font-bold text-foreground">AI-ESS EHR</span>
        </div>

        <div className="card-ehr p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-xl font-heading font-bold text-foreground">Check your email</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to <strong>{email}</strong>. Click the link to reset your password.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-1">Forgot password?</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@facility.com" className="mt-1.5" required />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : 'Send Reset Link'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
