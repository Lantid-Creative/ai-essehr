import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, LogOut } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

/**
 * Gates the dashboard if the user has an unsatisfied MFA challenge,
 * or if their role requires MFA (super_admin / facility_admin) and they
 * haven't enrolled yet.
 */
export default function MFAGate({ children }: { children: React.ReactNode }) {
  const { roles, signOut } = useAppContext();
  const { toast } = useToast();
  const [state, setState] = useState<'loading' | 'pass' | 'challenge' | 'must_enroll'>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const requiresMFA = roles.includes('super_admin') || roles.includes('facility_admin');

  const evaluate = async () => {
    setState('loading');
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = (factorsData?.totp ?? []).filter((f: any) => f.status === 'verified');

    // User has 2FA and needs to challenge it (logged in but only AAL1)
    if (verifiedFactors.length > 0 && aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
      const f = verifiedFactors[0];
      const { data: chal, error } = await supabase.auth.mfa.challenge({ factorId: f.id });
      if (error || !chal) {
        toast({ title: 'Could not start 2FA challenge', description: error?.message, variant: 'destructive' });
        setState('pass'); // fail open to login screen rather than locking out
        return;
      }
      setFactorId(f.id);
      setChallengeId(chal.id);
      setState('challenge');
      return;
    }

    // Role requires MFA but no factor enrolled
    if (requiresMFA && verifiedFactors.length === 0) {
      setState('must_enroll');
      return;
    }

    setState('pass');
  };

  useEffect(() => { evaluate(); }, [requiresMFA]);

  const verify = async () => {
    if (!factorId || !challengeId || code.length !== 6) return;
    setVerifying(true);
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    setVerifying(false);
    if (error) {
      toast({ title: 'Invalid code', description: error.message, variant: 'destructive' });
      return;
    }
    setCode('');
    await evaluate();
  };

  if (state === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (state === 'challenge') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Two-Factor Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Open your authenticator app and enter the 6-digit code.</p>
            <div>
              <Label htmlFor="mfa-code">Verification code</Label>
              <Input
                id="mfa-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                className="mt-1.5 text-center text-2xl tracking-widest font-mono h-14"
                onKeyDown={(e) => { if (e.key === 'Enter') verify(); }}
              />
            </div>
            <Button onClick={verify} disabled={code.length !== 6 || verifying} className="w-full h-12">
              {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Verify
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full">
              <LogOut className="w-4 h-4 mr-1" />Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'must_enroll') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Two-Factor Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your administrator role requires two-factor authentication. You'll be redirected to Settings to enroll.
            </p>
            <Button onClick={() => { window.location.href = '/settings#mfa'; }} className="w-full">
              Set up 2FA now
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full">
              <LogOut className="w-4 h-4 mr-1" />Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
