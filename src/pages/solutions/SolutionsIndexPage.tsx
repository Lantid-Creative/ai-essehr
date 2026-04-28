import { Link } from 'react-router-dom';
import { ArrowUpRight, Stethoscope, Brain, Globe2, AlertTriangle } from 'lucide-react';
import PageShell from '@/components/public/PageShell';

const solutions = [
  { icon: Stethoscope, eyebrow: 'For facilities', title: 'Surveillance EHR', desc: 'Every patient encounter captured digitally at point of care. Offline-first. Multilingual.', href: '/solutions/ehr', tone: 'cream' },
  { icon: Brain, eyebrow: 'For epidemiologists', title: 'Sentinel AI Engine', desc: 'NLP reads English & Pidgin clinical notes. Syndromic clustering across facilities.', href: '/solutions/sentinel-ai', tone: 'mint' },
  { icon: Globe2, eyebrow: 'For agencies', title: 'Validated Data Chain', desc: 'LGA validates → one-click push to SORMAS & DHIS2 simultaneously.', href: '/solutions/data-chain', tone: 'sand' },
  { icon: AlertTriangle, eyebrow: 'For citizens', title: 'Early Warning Alerts', desc: 'Autonomous alerts via WhatsApp & SMS when thresholds are crossed.', href: '/solutions/early-warnings', tone: 'sky' },
];

const tones: Record<string, string> = {
  cream: 'bg-[hsl(38,38%,92%)]', mint: 'bg-[hsl(153,40%,88%)]',
  sand: 'bg-[hsl(28,45%,90%)]', sky: 'bg-[hsl(200,40%,90%)]',
};

export default function SolutionsIndexPage() {
  return (
    <PageShell title="Solutions" description="Four integrated solutions that connect frontline facilities, epidemiologists, agencies, and citizens into one early warning network.">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Solutions</span>
            <h1 className="editorial-display text-ink text-4xl md:text-6xl mt-3 mb-4">Four pillars.<br /><span className="italic font-light">One mission.</span></h1>
            <p className="text-ink-soft leading-relaxed text-lg">
              AI-PEWS is built around four interlocking solutions — each addressing a specific gap in Nigeria's
              disease surveillance value chain.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {solutions.map((s) => (
              <Link key={s.title} to={s.href} className={`${tones[s.tone]} rounded-3xl p-7 flex flex-col min-h-[280px] hover:-translate-y-1 transition-transform`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-ink-soft font-semibold">{s.eyebrow}</span>
                </div>
                <h2 className="font-heading font-bold text-ink text-2xl mb-2 leading-tight">{s.title}</h2>
                <p className="text-sm text-ink-soft flex-1 leading-relaxed">{s.desc}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  Learn more
                  <span className="w-7 h-7 rounded-full bg-ink text-[hsl(var(--cream))] grid place-items-center"><ArrowUpRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
