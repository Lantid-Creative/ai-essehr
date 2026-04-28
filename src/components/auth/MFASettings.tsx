import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, Loader2, KeyRound } from 'lucide-react';

type Factor = { id: string; status: string; friendly_name?: string | null };

export default function MFASettings() {
  const { toast } = useToast();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      setFactors([...(data.totp ?? [])] as any);
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const startEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `AI-PEWS ${new Date().toLocaleDateString()}`,
      });
      if (error) throw error;
      setEnrollData({
        factorId: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch (e: any) {
      toast({ title: 'Enrollment failed', description: e.message, variant: 'destructive' });
    } finally {
      setEnrolling(false);
    }
  };

  const verifyEnroll = async () => {
    if (!enrollData || code.length !== 6) return;
    setVerifying(true);
    try {
      const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: enrollData.factorId });
      if (chalErr) throw chalErr;
      const { error: verErr } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId: chal.id,
        code,
      });
      if (verErr) throw verErr;
      toast({ title: '2FA enabled', description: 'Your account is now protected with two-factor authentication.' });
      setEnrollData(null);
      setCode('');
      await refresh();
    } catch (e: any) {
      toast({ title: 'Invalid code', description: e.message, variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const cancelEnroll = async () => {
    if (enrollData) {
      await supabase.auth.mfa.unenroll({ factorId: enrollData.factorId });
    }
    setEnrollData(null);
    setCode('');
  };

  const removeFactor = async (factorId: string) => {
    if (!confirm('Disable two-factor authentication? Your account will be less secure.')) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast({ title: 'Could not remove', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '2FA disabled' });
      await refresh();
    }
  };

  const verifiedFactor = factors.find(f => f.status === 'verified');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Two-Factor Authentication
          {verifiedFactor && <Badge variant="default" className="ml-2">Enabled</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : verifiedFactor ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Your account is protected by an authenticator app.
            </div>
            <Button variant="destructive" size="sm" onClick={() => removeFactor(verifiedFactor.id)}>
              <ShieldOff className="w-4 h-4 mr-1" />Disable 2FA
            </Button>
          </div>
        ) : enrollData ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              1. Scan the QR code below with Google Authenticator, Authy, 1Password, or any TOTP app.
            </p>
            <div className="flex justify-center bg-white p-4 rounded-lg border">
              {/* Supabase returns the QR as an SVG data URL */}
              <img src={enrollData.qr} alt="2FA QR code" className="w-48 h-48" />
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Or enter this secret manually:
              <code className="block mt-1 font-mono bg-muted p-2 rounded select-all">{enrollData.secret}</code>
            </div>
            <div>
              <Label htmlFor="totp">2. Enter the 6-digit code from your app</Label>
              <Input
                id="totp"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                className="mt-1.5 text-center text-lg tracking-widest font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={verifyEnroll} disabled={code.length !== 6 || verifying} className="flex-1">
                {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <KeyRound className="w-4 h-4 mr-1" />}
                Verify & enable
              </Button>
              <Button variant="outline" onClick={cancelEnroll}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security with an authenticator app. Optional — you can enable or disable this at any time.
            </p>
            <Button onClick={startEnroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Shield className="w-4 h-4 mr-1" />}
              Enable 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
