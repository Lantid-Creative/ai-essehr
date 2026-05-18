import PageShell from '@/components/public/PageShell';
import { Lock, Server, Eye, Brain, KeyRound, FileSearch, AlertCircle, CheckCircle2 } from 'lucide-react';

const controls = [
  { icon: Lock, title: 'Encryption', desc: 'AES-256 at rest. TLS 1.3 in transit. Field-level encryption for sensitive PII (NIN, phone numbers, clinical notes).' },
  { icon: KeyRound, title: 'Authentication', desc: 'Multi-factor authentication mandatory for all clinical and administrative roles. WebAuthn supported. Password policies aligned to NIST 800-63B.' },
  { icon: Eye, title: 'Authorisation', desc: 'Role-based access enforced at the database row level. A nurse cannot read another facility\'s patients — even via API misuse.' },
  { icon: FileSearch, title: 'Audit trail', desc: 'Every clinical and administrative action is logged immutably. Logs retained for 7 years per NCDC requirements.' },
  { icon: Server, title: 'Hosting & residency', desc: 'Production data hosted in compliance with Nigeria Data Protection Commission (NDPC) cross-border transfer rules.' },
  { icon: Brain, title: 'AI safety', desc: 'No AI signal is dispatched as an alert without human epidemiologist validation. Models are continuously evaluated for bias and accuracy.' },
];

const standards = [
  { name: 'NDPA 2023', desc: 'Nigeria Data Protection Act compliance baseline.' },
  { name: 'NDPR 2019', desc: 'Nigeria Data Protection Regulation procedural compliance.' },
  { name: 'NCDC IDSR', desc: 'Aligned to Integrated Disease Surveillance & Response framework.' },
  { name: 'WHO IHR (2005)', desc: 'International Health Regulations notification standards.' },
  { name: 'HL7 FHIR R4', desc: 'Open clinical data standard for interoperability.' },
];

export default function SecurityPage() {
  return (
    <PageShell title="Security & Compliance" description="How Integra+ Nigeria secures patient data, complies with Nigerian and international standards, and approaches AI safety.">
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Legal · Security</span>
            <h1 className="editorial-display text-ink text-4xl md:text-6xl mt-3 mb-4">Security & Compliance.</h1>
            <p className="text-ink-soft leading-relaxed text-lg">
              National disease surveillance demands national-grade security. Here is how we protect every patient
              record, every clinical note, every citizen alert.
            </p>
          </div>

          <h2 className="editorial-display text-ink text-3xl md:text-4xl mb-6">Technical controls.</h2>
          <div className="grid md:grid-cols-2 gap-5 mb-16">
            {controls.map((c) => (
              <div key={c.title} className="bg-white rounded-3xl p-7 border border-black/5">
                <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center mb-5">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-ink text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="editorial-display text-ink text-3xl md:text-4xl mb-6">Standards & alignment.</h2>
          <div className="bg-white rounded-3xl p-8 border border-black/5 mb-16">
            <div className="space-y-4">
              {standards.map((s) => (
                <div key={s.name} className="flex items-start gap-4 py-3 border-b border-ink/10 last:border-0">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-heading font-bold text-ink">{s.name}</div>
                    <div className="text-sm text-ink-soft">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ink text-[hsl(var(--cream))] rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/60">Responsible disclosure</span>
            </div>
            <h2 className="editorial-display text-3xl md:text-4xl mb-4">Found a vulnerability?</h2>
            <p className="text-[hsl(var(--cream))]/70 leading-relaxed mb-5 max-w-2xl">
              We welcome reports from security researchers. Please email <a href="mailto:security@ai-pews.ng" className="text-primary hover:underline">security@ai-pews.ng</a> with details.
              We commit to acknowledging your report within 48 hours and will not pursue legal action against
              good-faith researchers acting within our responsible disclosure policy.
            </p>
            <a href="mailto:security@ai-pews.ng" className="pill-light">security@ai-pews.ng</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
