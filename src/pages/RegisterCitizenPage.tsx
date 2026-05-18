import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Loader2, MessageSquare, Shield, Heart } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

const benefits = [
  { icon: MessageSquare, title: 'Free WhatsApp alerts', desc: 'Real-time outbreak alerts in your LGA' },
  { icon: Shield, title: 'Privacy-respecting', desc: 'Phone & LGA only. No medical data required' },
  { icon: Heart, title: 'You can help', desc: 'Submit community reports when you see something' },
];

export default function RegisterCitizenPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get('full_name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const phone = String(fd.get('phone') || '').trim();
    const state = String(fd.get('state') || '');
    const lga = String(fd.get('lga') || '').trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: fullName, phone, state, lga, role_intent: 'citizen' },
      },
    });

    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    // Best-effort: assign citizen role (RLS will permit only if a server policy allows; otherwise admin will assign)
    if (data.user) {
      try {
        await supabase.from('user_roles').insert({ user_id: data.user.id, role: 'citizen' as never });
      } catch {/* noop — fallback to admin grant */}
    }

    toast({
      title: 'Welcome to Integra+',
      description: 'Check your email to confirm your account, then sign in.',
    });
    navigate('/login');
  };

  return (
    <PageShell title="Sign up — Citizen" description="Sign up for free WhatsApp & SMS outbreak alerts in your LGA. Three fields, less than a minute.">
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Form */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-black/5 order-2 lg:order-1">
              <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Citizen sign up</span>
              <h1 className="editorial-display text-ink text-3xl md:text-4xl mt-3 mb-2">Create your account.</h1>
              <p className="text-sm text-ink-soft mb-7">Free. Less than a minute. Unsubscribe anytime.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" required className="mt-1.5" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="0801 234 5678" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Choose a password</Label>
                  <Input id="password" name="password" type="password" required minLength={8} className="mt-1.5" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <select id="state" name="state" required className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select…</option>
                      {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="lga">LGA</Label>
                    <Input id="lga" name="lga" required placeholder="e.g. Bama" className="mt-1.5" />
                  </div>
                </div>
                <p className="text-xs text-editorial-muted">
                  By signing up you agree to our <Link to="/legal/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
                <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account…</> : 'Create my account'}
                </Button>
                <p className="text-center text-sm text-ink-soft pt-2">
                  Already signed up? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </p>
              </form>
            </div>

            {/* Editorial side */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-6">
              <div className="bg-ink text-[hsl(var(--cream))] rounded-3xl p-8 md:p-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg gradient-primary grid place-items-center">
                    <Activity className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-heading font-bold">Integra+ Citizen</span>
                </div>
                <h2 className="editorial-display text-3xl md:text-4xl mb-4">Be among the first<br /><span className="italic font-light">to know.</span></h2>
                <p className="text-[hsl(var(--cream))]/70 mb-8 leading-relaxed">
                  When a disease cluster forms in your LGA, you'll receive a clear, actionable alert — by WhatsApp,
                  SMS, or in-app. Free, always.
                </p>
                <div className="space-y-4">
                  {benefits.map((b) => (
                    <div key={b.title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center shrink-0">
                        <b.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm">{b.title}</div>
                        <div className="text-xs text-[hsl(var(--cream))]/65">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/case-studies/first-time-citizen" className="mt-8 text-sm text-primary hover:underline inline-flex items-center gap-1">
                  Read Aisha's story →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
