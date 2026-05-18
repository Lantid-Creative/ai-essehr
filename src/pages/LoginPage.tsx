import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, Wifi, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const highlights = [
  { icon: Bell, title: 'Real-time alerts', desc: '24-hour outbreak detection across LGAs.' },
  { icon: Wifi, title: 'Works offline', desc: 'Charting continues during network outages.' },
  { icon: ShieldCheck, title: 'NDPA-grade security', desc: 'AES-256 at rest. Role-based access.' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    toast({ title: 'Welcome back', description: 'Redirecting to your dashboard…' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Form card */}
          <div className="bg-white rounded-3xl border border-black/5 p-7 sm:p-10 order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-8">
              <Brand size="md" />
              <span className="text-[10px] text-editorial-muted font-medium">NIGERIA</span>
            </div>

            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Sign in</span>
            <h1 className="editorial-display text-ink text-3xl sm:text-4xl mt-3 mb-2">Welcome back.</h1>
            <p className="text-sm text-ink-soft mb-8">Access your facility dashboard, surveillance feed, and clinical workflow.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@facility.org" className="mt-1.5 h-11" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink" aria-label="Toggle password">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold rounded-full bg-ink text-[hsl(var(--cream))] hover:bg-ink/90" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in…</> : 'Sign in'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-black/5 grid sm:grid-cols-2 gap-3 text-sm">
              <Link to="/register/facility" className="block rounded-2xl border border-black/10 p-4 hover:border-ink/40 transition">
                <div className="font-heading font-bold text-ink">Register a facility</div>
                <div className="text-xs text-ink-soft mt-0.5">Hospitals, clinics, PHCs</div>
              </Link>
              <Link to="/register/citizen" className="block rounded-2xl border border-black/10 p-4 hover:border-ink/40 transition">
                <div className="font-heading font-bold text-ink">Citizen sign up</div>
                <div className="text-xs text-ink-soft mt-0.5">Free LGA outbreak alerts</div>
              </Link>
            </div>
          </div>

          {/* Editorial side */}
          <div className="order-1 lg:order-2">
            <div className="h-full bg-ink text-[hsl(var(--cream))] rounded-3xl p-8 sm:p-10 flex flex-col justify-between min-h-[420px]">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/60">A national health network</span>
                <h2 className="editorial-display text-3xl sm:text-4xl lg:text-5xl mt-4">
                  From 717 days<br />to <span className="italic font-light">24 hours.</span>
                </h2>
                <p className="text-[hsl(var(--cream))]/70 mt-5 leading-relaxed max-w-md">
                  Integra+ connects Nigerian health facilities into a single early-warning network. Sign in to keep your facility on the line.
                </p>
              </div>

              <div className="grid gap-3 mt-8">
                {highlights.map((h) => (
                  <div key={h.title} className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center shrink-0">
                      <h.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-sm">{h.title}</div>
                      <div className="text-xs text-[hsl(var(--cream))]/65 mt-0.5">{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
