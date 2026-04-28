import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageSquare, Smartphone, Bell, ShieldCheck, MapPin } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import heroImg from '@/assets/solution-alerts.jpg';

const channels = [
  { icon: MessageSquare, name: 'WhatsApp', desc: 'Rich situation summaries with safety guidance, in English & Pidgin.' },
  { icon: Smartphone, name: 'SMS', desc: 'Plain-text alerts for feature phones — no internet required to receive.' },
  { icon: Bell, name: 'In-app push', desc: 'Real-time notifications to facility staff and citizen app users.' },
];

const exampleAlert = `🚨 AI-PEWS Health Alert
Bama LGA · Borno State

Cluster of acute watery diarrhoea reported across 3 facilities in the past 24 hours.

What this means for you:
• Drink only treated or boiled water
• Wash hands with soap before eating
• If you or anyone shows symptoms (severe diarrhoea, vomiting), go to the nearest health facility immediately

Nearest treatment centre: Bama PHC
NCDC toll-free line: 6232

— Borno State Ministry of Health`;

export default function SolutionAlertsPage() {
  return (
    <PageShell
      title="Early Warning Alerts for Citizens"
      description="Autonomous WhatsApp & SMS alerts when outbreak thresholds are crossed. Reach citizens in their language, on their phone, in time to act."
    >
      <section className="px-3 sm:px-5 lg:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden min-h-[480px] md:min-h-[560px]">
          <img src={heroImg} alt="Citizen receiving an early warning alert" className="absolute inset-0 w-full h-full object-cover" width={1280} height={832} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
          <div className="relative z-10 p-8 md:p-14 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/70">For Citizens & Communities</span>
            <h1 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-6xl mt-4 mb-5">
              Get the alert<br /><span className="italic font-light">before the outbreak.</span>
            </h1>
            <p className="text-[hsl(var(--cream))]/80 text-base md:text-lg leading-relaxed mb-7 max-w-xl">
              When a disease cluster forms in your LGA, you'll know — by WhatsApp, SMS, or app — with clear guidance
              on what to do, in your language. Free. Always.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register/citizen" className="pill-light">Sign up for alerts <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/community-report" className="pill-dark">Report an outbreak</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Channels */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">How alerts reach you</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">Three channels.<br /><span className="italic font-light">Every Nigerian phone.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {channels.map((c) => (
              <div key={c.name} className="bg-white rounded-3xl p-7 border border-black/5">
                <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center mb-5">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-ink text-xl mb-2">{c.name}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example alert */}
      <section className="bg-cream-deep py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Sample alert</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3 mb-5">Clear. Local.<br /><span className="italic font-light">Actionable.</span></h2>
            <p className="text-ink-soft leading-relaxed mb-6">
              Every alert tells you three things: what's happening, what to do about it, and where to get help. No
              jargon. No fearmongering. Just the information your family needs to stay safe.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-primary mt-0.5" /><span className="text-sm text-ink-soft"><b>Geographically targeted</b> — only LGAs at risk receive the alert</span></div>
              <div className="flex items-start gap-3"><ShieldCheck className="h-4 w-4 text-primary mt-0.5" /><span className="text-sm text-ink-soft"><b>Human-validated</b> — every alert reviewed by a state epidemiologist</span></div>
            </div>
          </div>
          <div className="bg-[#075e54] rounded-3xl p-3 shadow-2xl">
            <div className="bg-[#dcf8c6] rounded-2xl p-5 text-sm text-ink leading-relaxed whitespace-pre-line font-mono">
              {exampleAlert}
              <div className="text-[10px] text-ink/50 text-right mt-3">14:02 ✓✓</div>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen CTA */}
      <section className="px-3 sm:px-4 lg:px-6">
        <div className="rounded-3xl bg-ink text-[hsl(var(--cream))] p-10 md:p-16 max-w-7xl mx-auto text-center">
          <h2 className="editorial-display text-3xl md:text-5xl mb-4">Get protected.<br /><span className="italic font-light">It takes 30 seconds.</span></h2>
          <p className="text-[hsl(var(--cream))]/70 max-w-xl mx-auto mb-7">Sign up with just your phone number and LGA. No fees. Unsubscribe anytime.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/citizen" className="pill-light">Sign up for alerts <ArrowUpRight className="h-4 w-4" /></Link>
            <Link to="/community-report" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15">Report an outbreak</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
