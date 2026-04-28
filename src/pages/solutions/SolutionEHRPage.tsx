import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Stethoscope, WifiOff, Languages, Shield, Zap, Database, Smartphone, Activity, Users, FileText, Pill, FlaskConical, Baby, BedDouble, Calendar } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import heroImg from '@/assets/solution-ehr.jpg';

const benefits = [
  { icon: WifiOff, title: 'Offline-first by default', desc: 'Built for unstable power and intermittent internet. Every encounter is captured locally and syncs automatically when connectivity returns. No data ever lost.' },
  { icon: Languages, title: 'Multilingual capture', desc: 'Free-text notes in English, Nigerian Pidgin, Hausa, Yoruba, and Igbo. Structured fields keep reporting consistent — narrative fields keep clinical truth intact.' },
  { icon: Shield, title: 'Privacy-grade security', desc: 'AES-256 encryption at rest and in transit. Role-based access controls. National Data Protection (NDPR) consent flows built-in.' },
  { icon: Zap, title: 'Built for speed at point of care', desc: 'Optimised for low-end Android tablets. Average encounter capture under 90 seconds. National patient lookup in 1.5 seconds via NIN verification.' },
];

const modules = [
  { icon: Users, title: 'Patient Registry', desc: 'National lookup, NIN verification, circular photo capture, allergy & history banner.' },
  { icon: Stethoscope, title: 'Consultation', desc: 'SOAP notes, real-time drug-interaction & allergy alerts, vitals with NEWS2 scoring.' },
  { icon: FlaskConical, title: 'Laboratory', desc: 'Order entry → specimen barcode → result with abnormal-flag triggers to clinician inbox.' },
  { icon: Pill, title: 'Pharmacy & Inventory', desc: 'Dispensing tied to a live drug inventory. Stock ledger, FEFO expiry tracking.' },
  { icon: Baby, title: 'Maternal & Child Health', desc: 'Longitudinal ANC visits, delivery outcomes, under-5 growth monitoring, immunisations.' },
  { icon: BedDouble, title: 'Wards & Admissions', desc: 'Grid-based bed occupancy across 6 ward types, MAR (medication administration record).' },
  { icon: Calendar, title: 'Appointments & Queuing', desc: 'Clinical triage priorities, walk-in & scheduled queues, SMS reminders.' },
  { icon: FileText, title: 'Reports & HMIS', desc: 'Automated daily summaries, printable HMIS 035B forms, IDSR weekly rollups.' },
];

const flow = [
  { step: '01', title: 'Patient arrives', desc: 'Reception searches the national registry by name, NIN, or phone number — 1.5s.' },
  { step: '02', title: 'Triage & vitals', desc: 'Nurse captures vitals; NEWS2 score is calculated automatically and routed to the right queue.' },
  { step: '03', title: 'Clinician encounter', desc: 'Doctor or CHEW writes free-text notes in any language. Drug interactions and allergies are surfaced live.' },
  { step: '04', title: 'Orders & dispensing', desc: 'Lab tests & prescriptions flow to dept queues. Pharmacy dispenses against live inventory.' },
  { step: '05', title: 'Auto-surveillance', desc: 'Notes are scanned for syndromic signals. If a cluster forms, alerts dispatch to LGA & state.' },
];

export default function SolutionEHRPage() {
  return (
    <PageShell
      title="Surveillance EHR for Nigerian Facilities"
      description="A surveillance-optimised electronic health record for Nigerian PHCs, secondary, and tertiary facilities. Offline-first, multilingual, privacy-grade."
    >
      {/* Hero */}
      <section className="px-3 sm:px-5 lg:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden min-h-[480px] md:min-h-[560px]">
          <img src={heroImg} alt="Nigerian doctor using EHR on tablet" className="absolute inset-0 w-full h-full object-cover" width={1280} height={832} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/40" />
          <div className="relative z-10 p-8 md:p-14 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/70">For Health Facilities</span>
            <h1 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-6xl mt-4 mb-5">
              An EHR built for<br /><span className="italic font-light">Nigerian reality.</span>
            </h1>
            <p className="text-[hsl(var(--cream))]/80 text-base md:text-lg leading-relaxed mb-7 max-w-xl">
              Every patient encounter, captured digitally at the point of care — even when the power is out and the internet is gone.
              Designed with frontline workers, deployed in real PHCs.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register/facility" className="pill-light">Deploy at your facility <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="pill-dark">Talk to our team</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Why it works</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">
              Designed for the realities<br /><span className="italic font-light">of Nigerian healthcare.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-3xl p-7 border border-black/5">
                <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center mb-5">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-ink text-xl mb-2">{b.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-cream-deep py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">What's inside</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">Eight clinical modules.<br /><span className="italic font-light">One unified record.</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((m) => (
              <div key={m.title} className="bg-white rounded-3xl p-6 border border-black/5 hover:shadow-lg transition">
                <div className="w-10 h-10 rounded-xl bg-cream grid place-items-center mb-4">
                  <m.icon className="h-5 w-5 text-ink" />
                </div>
                <h3 className="font-heading font-bold text-ink text-base mb-1.5">{m.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:underline">
              See all 25+ modules <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">A typical encounter</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">From arrival<br /><span className="italic font-light">to surveillance signal.</span></h2>
          </div>
          <ol className="grid md:grid-cols-5 gap-4">
            {flow.map((f) => (
              <li key={f.step} className="bg-white rounded-3xl p-6 border border-black/5">
                <div className="text-xs font-mono text-primary mb-3">{f.step}</div>
                <h3 className="font-heading font-bold text-ink text-base mb-1.5">{f.title}</h3>
                <p className="text-xs text-ink-soft leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="px-3 sm:px-4 lg:px-6">
        <div className="rounded-3xl bg-ink text-[hsl(var(--cream))] p-10 md:p-16 max-w-7xl mx-auto text-center">
          <h2 className="editorial-display text-3xl md:text-5xl mb-4">Ready to deploy at your facility?</h2>
          <p className="text-[hsl(var(--cream))]/70 max-w-xl mx-auto mb-7">Free to register. Free to deploy. Self-service onboarding for facility administrators.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/facility" className="pill-light">Register Facility <ArrowUpRight className="h-4 w-4" /></Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15">Speak to a specialist</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
