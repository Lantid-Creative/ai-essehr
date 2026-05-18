import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Building2, Users, Newspaper } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const channels = [
  { icon: Building2, title: 'Facilities & Onboarding', desc: 'Deploy Integra+ at your hospital, PHC, or clinic.', email: 'facilities@ai-pews.ng' },
  { icon: Users, title: 'Government & Partnerships', desc: 'States, LGAs, agencies, donors, multilaterals.', email: 'partners@ai-pews.ng' },
  { icon: Newspaper, title: 'Press & Media', desc: 'Interviews, official statements, press kit.', email: 'press@ai-pews.ng' },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    toast({ title: 'Message received', description: 'We will get back to you within 2 business days.' });
    (e.target as HTMLFormElement).reset();
    setSubmitting(false);
  };

  return (
    <PageShell title="Contact" description="Get in touch with the Integra+ team — for facility onboarding, government partnerships, or media inquiries.">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Contact</span>
            <h1 className="editorial-display text-ink text-4xl md:text-6xl mt-3 mb-4">Talk to a human.<br /><span className="italic font-light">We respond in 2 days.</span></h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mb-12">
            {channels.map((c) => (
              <div key={c.title} className="bg-white rounded-3xl p-7 border border-black/5">
                <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center mb-5">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-ink text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-ink-soft mb-4">{c.desc}</p>
                <a href={`mailto:${c.email}`} className="text-sm text-primary font-semibold hover:underline">{c.email}</a>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-black/5 space-y-5">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required className="mt-1.5" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="org">Organisation</Label>
                  <Input id="org" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="topic">What is this about?</Label>
                <select id="topic" required className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select a topic…</option>
                  <option>Facility deployment</option>
                  <option>Government / agency partnership</option>
                  <option>Press / media</option>
                  <option>Technical question</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={5} className="mt-1.5" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
                <Send className="h-4 w-4 mr-2" /> {submitting ? 'Sending…' : 'Send message'}
              </Button>
            </form>

            <div className="bg-ink text-[hsl(var(--cream))] rounded-3xl p-8">
              <h2 className="editorial-display text-3xl mb-6">Other ways to reach us.</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0"><Phone className="h-4 w-4" /></div>
                  <div>
                    <div className="font-heading font-bold">NCDC Toll-Free</div>
                    <div className="text-sm text-[hsl(var(--cream))]/70 mt-0.5">6232 (free from any Nigerian network)</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0"><Mail className="h-4 w-4" /></div>
                  <div>
                    <div className="font-heading font-bold">General inquiries</div>
                    <div className="text-sm text-[hsl(var(--cream))]/70 mt-0.5">info@ai-pews.ng</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0"><MapPin className="h-4 w-4" /></div>
                  <div>
                    <div className="font-heading font-bold">Headquarters</div>
                    <div className="text-sm text-[hsl(var(--cream))]/70 mt-0.5">Abuja · Federal Capital Territory<br />Nigeria</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-[hsl(var(--cream))]/50">
                For urgent disease-outbreak reports, please call the NCDC line directly. For platform incidents
                outside business hours, use ops@ai-pews.ng.
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
