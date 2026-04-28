import { Link } from 'react-router-dom';
import { ArrowUpRight, Target, Users, Heart, Compass, Building2, ShieldCheck } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import aerial from '@/assets/landing-aerial.jpg';

const principles = [
  { icon: Target, title: 'Built for Nigerian reality', desc: 'Designed in Nigeria, by Nigerian engineers and clinicians, for the actual conditions of Nigerian PHCs — not adapted from Western templates.' },
  { icon: Users, title: 'Frontline-first', desc: 'Every feature is co-designed with the CHEWs, nurses, and doctors who use it daily. Their constraints shape our roadmap.' },
  { icon: Heart, title: 'Free at the point of use', desc: 'AI-PEWS is free for facilities to register and free for citizens. Sustainable through institutional funding, never user fees.' },
  { icon: Compass, title: 'Open to integration', desc: 'Built on open standards (FHIR, ICD-11, HL7). Native integrations with SORMAS, DHIS2, and NHMIS — never proprietary lock-in.' },
];

const partners = [
  { name: "Nigeria Governors' Forum (NGF)", role: 'Lead Organisation · Political Authority' },
  { name: 'Nigeria Centre for Disease Control (NCDC)', role: 'Surveillance Authority · Endorsement' },
  { name: 'Federal Ministry of Health', role: 'Health Policy · Strategic Alignment' },
  { name: 'NHEAD', role: 'Health Innovation Partner' },
  { name: 'Lantid Creative LTD', role: 'Technical Partner · Build & Operations' },
];

export default function AboutPage() {
  return (
    <PageShell title="About" description="AI-PEWS Nigeria is a national early warning system co-designed with frontline workers and endorsed by the NCDC.">
      <section className="px-3 sm:px-5 lg:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden min-h-[440px]">
          <img src={aerial} alt="Aerial of Nigerian community" className="absolute inset-0 w-full h-full object-cover" width={1280} height={832} />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/85" />
          <div className="relative z-10 p-8 md:p-14 max-w-3xl text-center mx-auto">
            <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/70">About AI-PEWS</span>
            <h1 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-6xl mt-4">
              A national surveillance system,<br /><span className="italic font-light">built from the ground up.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
          <p className="text-xl text-ink-soft leading-relaxed mb-6">
            AI-PEWS Nigeria — the AI-Powered Early Warning System — collapses the gap between when a disease appears
            in a Nigerian community and when the country's surveillance authorities can act on it.
          </p>
          <p className="text-ink-soft leading-relaxed mb-6">
            The current national average is 15+ days from clinical recording to actionable alert at the Nigeria Centre
            for Disease Control. Our target is under 24 hours. Not by replacing what exists — but by building the
            unified, offline-first electronic health record and validated data chain that the existing system has
            always lacked.
          </p>
          <p className="text-ink-soft leading-relaxed">
            We do this in partnership with the Nigeria Governors' Forum, the NCDC, and the Federal Ministry of Health.
            We do this with frontline health workers, not at them. And we do this in the open: every clinical
            workflow is co-designed, every algorithm is human-validated, every data movement is auditable.
          </p>
        </div>
      </section>

      <section className="bg-cream-deep py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Our principles</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">Four commitments<br /><span className="italic font-light">that shape every decision.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {principles.map((p) => (
              <div key={p.title} className="bg-white rounded-3xl p-7 border border-black/5">
                <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center mb-5">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-ink text-xl mb-2">{p.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Partners & endorsement</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">Built with Nigeria's<br /><span className="italic font-light">health authorities.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {partners.map((p) => (
              <div key={p.name} className="bg-white rounded-2xl p-6 border border-black/5 flex items-start gap-4">
                <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-ink">{p.name}</h3>
                  <p className="text-sm text-editorial-muted mt-0.5">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 sm:px-4 lg:px-6">
        <div className="rounded-3xl bg-ink text-[hsl(var(--cream))] p-10 md:p-16 max-w-7xl mx-auto text-center">
          <h2 className="editorial-display text-3xl md:text-5xl mb-4">Join the network.</h2>
          <p className="text-[hsl(var(--cream))]/70 max-w-xl mx-auto mb-7">Whether you run a facility, an agency, or simply want to protect your family — there's a door for you.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/facility" className="pill-light">Register a facility <ArrowUpRight className="h-4 w-4" /></Link>
            <Link to="/register/citizen" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15">Citizen sign up</Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15">Partner with us</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
