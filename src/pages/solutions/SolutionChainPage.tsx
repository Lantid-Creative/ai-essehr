import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2, Globe2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import heroImg from '@/assets/solution-chain.jpg';

const tiers = [
  { tier: 'Facility', desc: 'Captures the encounter, raises the case report.', who: 'Doctor, CHEW, nurse, lab tech.' },
  { tier: 'LGA', desc: 'Reviews local cases. Validates clinical & epidemiological context.', who: 'LGA Disease Surveillance & Notification Officer (DSNO).' },
  { tier: 'State', desc: 'Aggregates LGA-validated reports. Authorises state-level dispatch.', who: 'State Epidemiologist.' },
  { tier: 'National', desc: 'Receives validated signals; coordinates response.', who: 'NCDC Surveillance Unit.' },
];

const integrations = [
  { name: 'SORMAS', desc: 'WHO-aligned outbreak case management. Auto-push of validated case reports — no double entry.' },
  { name: 'DHIS2', desc: 'National HMIS. Aggregate indicators flow continuously; case-level data on validation.' },
  { name: 'NHMIS', desc: 'HMIS 035B and 035A forms generated automatically from EHR encounters.' },
  { name: 'IDSR', desc: 'Weekly Integrated Disease Surveillance & Response rollups, ready to submit.' },
];

export default function SolutionChainPage() {
  return (
    <PageShell
      title="Validated Data Chain — From Facility to NCDC"
      description="A 4-tier validation chain: facility captures, LGA validates, state authorises, NCDC receives. One click pushes to SORMAS and DHIS2 simultaneously."
    >
      <section className="px-3 sm:px-5 lg:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden min-h-[480px] md:min-h-[560px] bg-primary">
          <img src={heroImg} alt="Validated data chain across Nigeria" className="absolute inset-0 w-full h-full object-cover opacity-50" width={1280} height={832} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/40" />
          <div className="relative z-10 p-8 md:p-14 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/70">For Agencies & Governments</span>
            <h1 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-6xl mt-4 mb-5">
              The Validated<br /><span className="italic font-light">Data Chain.</span>
            </h1>
            <p className="text-[hsl(var(--cream))]/80 text-base md:text-lg leading-relaxed mb-7 max-w-xl">
              Four tiers. One click. From a community health worker's tablet to NCDC headquarters in hours, not weeks —
              with full clinical and epidemiological validation at every step.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="pill-light">Open agency dashboard <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="pill-dark">Partner with us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* The chain */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">The four tiers</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">From bedside<br /><span className="italic font-light">to national signal.</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {tiers.map((t, i) => (
              <div key={t.tier} className="bg-white rounded-3xl p-6 border border-black/5 relative">
                <div className="text-xs font-mono text-primary mb-3">TIER {String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-heading font-bold text-ink text-2xl mb-3">{t.tier}</h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-4">{t.desc}</p>
                <div className="text-xs text-editorial-muted border-t border-ink/10 pt-3">{t.who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why validated */}
      <section className="bg-ink text-[hsl(var(--cream))] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/50">Why this matters</span>
            <h2 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-5xl mt-3 mb-5">No false alarms.<br /><span className="italic font-light">No silent outbreaks.</span></h2>
            <p className="text-[hsl(var(--cream))]/70 leading-relaxed mb-6 max-w-md">
              An AI signal alone is not enough. A WhatsApp rumour is not enough. The Validated Data Chain ensures that
              every alert reaching NCDC has been clinically reviewed at the point of care, epidemiologically validated at the LGA, and
              authorised by state-level expertise — with a full audit trail.
            </p>
            <div className="space-y-3">
              {[
                'Every action timestamped & attributed in immutable audit logs',
                'NDPR-compliant patient data handling at every tier',
                'Cryptographic chain of custody for case reports',
                'Cannot skip a tier — even by super-admin',
              ].map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-[hsl(var(--cream))]/85">{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="font-mono text-xs text-[hsl(var(--cream))]/50 mb-4">CASE REPORT TIMELINE</div>
            {[
              { t: '08:14', a: 'Encounter captured', who: 'CHEW · Bama PHC' },
              { t: '08:14', a: 'AI signal raised', who: 'Sentinel AI' },
              { t: '11:02', a: 'LGA validated', who: 'DSNO · Bama LGA' },
              { t: '13:45', a: 'State authorised', who: 'Borno State Epidemiologist' },
              { t: '13:45', a: 'Pushed to SORMAS', who: 'auto' },
              { t: '13:45', a: 'Pushed to DHIS2', who: 'auto' },
              { t: '13:46', a: 'WhatsApp dispatched', who: '12,400 recipients' },
            ].map((e, i) => (
              <div key={i} className="flex gap-4 py-2.5 border-b border-white/10 last:border-0">
                <span className="text-xs text-primary font-mono w-12 shrink-0">{e.t}</span>
                <div className="flex-1">
                  <div className="text-sm text-[hsl(var(--cream))]">{e.a}</div>
                  <div className="text-[10px] text-[hsl(var(--cream))]/50">{e.who}</div>
                </div>
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Native integrations</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">No double entry.<br /><span className="italic font-light">Ever.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((i) => (
              <div key={i.name} className="bg-white rounded-3xl p-6 border border-black/5">
                <div className="font-heading font-bold text-ink text-2xl mb-2">{i.name}</div>
                <p className="text-sm text-ink-soft leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
