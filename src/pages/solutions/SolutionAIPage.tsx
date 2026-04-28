import { Link } from 'react-router-dom';
import { ArrowUpRight, Brain, Sparkles, Languages, MapPin, ShieldCheck, Activity, Quote } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import heroImg from '@/assets/solution-ai.jpg';
import chewPhoto from '@/assets/landing-chew.jpg';

const samples = [
  { src: '“Pikin dey breathe hard, neck dey stiff, fever since yesterday.”', signal: 'Meningitis criteria · 92% confidence', tone: 'critical' },
  { src: '“Mama bring am with serious purging, no fit hold water down.”', signal: 'Acute watery diarrhoea · cluster forming', tone: 'high' },
  { src: '“Yellow eye, weakness, body hot — village 3 km from here.”', signal: 'Possible viral haemorrhagic fever signal', tone: 'critical' },
  { src: '“Rash on face, fever, dey 4 days — no vaccination card.”', signal: 'Measles probable case', tone: 'high' },
];

const capabilities = [
  { icon: Languages, title: 'Reads English & Pidgin', desc: 'Trained specifically on Nigerian clinical language patterns — including code-switched English, Pidgin, and major regional vernaculars.' },
  { icon: Sparkles, title: 'Extracts syndromic signals', desc: 'Identifies fever-rash, acute flaccid paralysis, haemorrhagic, neurological, and respiratory syndromes from free-text notes.' },
  { icon: MapPin, title: 'Clusters geographically', desc: 'Detects unusual concentrations of cases across facilities, LGAs, and states — even when each facility individually sees only 1–2 cases.' },
  { icon: ShieldCheck, title: 'Recommends, never decides', desc: 'Every signal is a recommendation routed to a human epidemiologist. The AI proposes; trained validators dispose.' },
];

export default function SolutionAIPage() {
  return (
    <PageShell
      title="Sentinel AI — Syndromic Signal Detection"
      description="Sentinel AI reads clinical notes in English & Pidgin, clustering syndromic signals across facilities to surface outbreaks before traditional surveillance can."
    >
      {/* Hero */}
      <section className="px-3 sm:px-5 lg:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden min-h-[480px] md:min-h-[560px] bg-ink">
          <img src={heroImg} alt="Sentinel AI neural pattern" className="absolute inset-0 w-full h-full object-cover opacity-40" width={1280} height={832} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/30" />
          <div className="relative z-10 p-8 md:p-14 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/70">
              <Brain className="h-4 w-4" /> For Epidemiologists
            </span>
            <h1 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-6xl mt-4 mb-5">
              Sentinel AI — reading<br /><span className="italic font-light">between the lines.</span>
            </h1>
            <p className="text-[hsl(var(--cream))]/80 text-base md:text-lg leading-relaxed mb-7 max-w-xl">
              Health workers don't write in textbooks. They write in Pidgin, in shorthand, in the language of the patient.
              Sentinel AI is purpose-built to find disease signals where traditional surveillance can't see.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register/facility" className="pill-light">Connect your facility <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/case-studies/first-time-citizen" className="pill-dark">See it in action</Link>
            </div>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">The problem</span>
              <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3 mb-5">
                Clinical truth lives<br /><span className="italic font-light">in the narrative.</span>
              </h2>
              <p className="text-ink-soft leading-relaxed mb-4">
                Traditional surveillance relies on structured fields — ICD codes, checkboxes, dropdowns. But in a Nigerian PHC, the
                richest clinical information is in the free-text note: the parent's description, the symptom timeline, the local
                context that doesn't fit any dropdown.
              </p>
              <p className="text-ink-soft leading-relaxed">
                Sentinel AI extracts that signal — without forcing health workers to change how they document. The narrative stays
                clinically true. The surveillance gets ~40% more signal than structured fields alone.
              </p>
            </div>
            <div className="bg-ink rounded-3xl p-6 md:p-8 text-[hsl(var(--cream))] space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/50 mb-2">Live samples · last 24 hours</div>
              {samples.map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Quote className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <p className="text-sm italic text-[hsl(var(--cream))]/85 leading-snug">{s.src}</p>
                  </div>
                  <div className="mt-3 ml-7 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.tone === 'critical' ? 'bg-destructive' : 'bg-warning'}`} />
                    <span className="text-xs text-[hsl(var(--cream))]/70">→ {s.signal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-cream-deep py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Capabilities</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">What Sentinel AI does.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {capabilities.map((c) => (
              <div key={c.title} className="bg-white rounded-3xl p-7 border border-black/5">
                <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center mb-5">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-ink text-xl mb-2">{c.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative rounded-3xl overflow-hidden min-h-[420px]">
              <img src={chewPhoto} alt="CHEW capturing a clinical note" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">How it works</span>
              <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3 mb-6">From note<br /><span className="italic font-light">to national alert.</span></h2>
              <ol className="space-y-5">
                {[
                  { n: '1', t: 'CHEW captures encounter', d: 'A clinical note is written naturally — Pidgin, English, mixed.' },
                  { n: '2', t: 'AI parses in real time', d: 'Symptoms, syndromic patterns, demographic context extracted.' },
                  { n: '3', t: 'Geo-clustering', d: 'The signal is added to the LGA-level cluster map and risk score.' },
                  { n: '4', t: 'Threshold breach', d: 'When the score crosses the WHO threshold, an alert is queued.' },
                  { n: '5', t: 'Validated dispatch', d: 'LGA epidemiologist reviews; one click pushes to SORMAS & DHIS2 + WhatsApp.' },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-ink text-[hsl(var(--cream))] grid place-items-center text-xs font-bold shrink-0">{s.n}</div>
                    <div>
                      <h3 className="font-heading font-bold text-ink">{s.t}</h3>
                      <p className="text-sm text-ink-soft mt-0.5">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-3 sm:px-4 lg:px-6">
        <div className="rounded-3xl bg-ink text-[hsl(var(--cream))] p-10 md:p-16 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="editorial-display text-3xl md:text-5xl mb-4">AI-augmented,<br /><span className="italic font-light">human-validated.</span></h2>
              <p className="text-[hsl(var(--cream))]/70 max-w-md mb-6">
                Sentinel AI never publishes an alert directly to the public. Every signal is reviewed by a trained
                LGA or state epidemiologist before dispatch. The model accelerates judgement; it never replaces it.
              </p>
              <Link to="/legal/security" className="pill-light">Read our AI safety policy <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: '40%', l: 'more signal vs structured fields' },
                { v: '< 24 hr', l: 'note → cluster detection' },
                { v: '100%', l: 'alerts human-validated' },
                { v: '5', l: 'priority diseases monitored' },
              ].map((s) => (
                <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="text-3xl font-heading font-bold text-primary">{s.v}</div>
                  <div className="text-xs text-[hsl(var(--cream))]/60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
