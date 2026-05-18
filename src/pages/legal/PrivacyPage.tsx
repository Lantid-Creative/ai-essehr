import PageShell from '@/components/public/PageShell';
import { Lock, Eye, Shield, Database, UserCheck, Globe, Trash2, Scale } from 'lucide-react';

const sections = [
  {
    icon: Eye, title: '1. What information we collect',
    body: [
      'Citizen accounts: name, phone number, LGA of residence, alert preferences. Optionally: email address.',
      'Facility staff accounts: name, work email, role, facility affiliation, professional licence number where applicable.',
      'Patient records (entered by facility staff): demographic data, clinical history, vitals, lab results, prescriptions, billing records — only as required for care and statutory disease surveillance.',
      'Community reports: location (LGA-level only by default), description of observed health event, timestamp.',
      'Technical data: IP address, device type, app version, audit logs of every action taken inside the platform.',
    ],
  },
  {
    icon: Shield, title: '2. Lawful basis for processing',
    body: [
      'We process personal data under the Nigeria Data Protection Act (NDPA) 2023 and the Nigeria Data Protection Regulation (NDPR) 2019.',
      'For citizens: explicit, opt-in consent (you choose to sign up for alerts).',
      'For facility staff: contractual necessity (your facility employs you and needs the platform to operate).',
      'For patients: vital interests and public-health legal obligation under Nigeria\'s public health surveillance mandate (NCDC Act).',
    ],
  },
  {
    icon: Database, title: '3. How we use your information',
    body: [
      'To deliver early-warning alerts to citizens registered in affected LGAs.',
      'To enable facility staff to provide clinical care to patients.',
      'To produce de-identified, aggregate disease-surveillance signals for the NCDC, state ministries of health, and LGA disease surveillance officers.',
      'To meet statutory disease notification obligations under Nigerian public-health law.',
      'To improve the platform via aggregate, de-identified analytics. We do not sell personal data. Ever.',
    ],
  },
  {
    icon: UserCheck, title: '4. Who can see your data',
    body: [
      'Citizens see only their own account and the reports they have submitted.',
      'Facility staff see only patients within their facility, scoped further by clinical role.',
      'LGA officers see aggregate surveillance signals for their LGA.',
      'State epidemiologists see aggregate signals for their state.',
      'NCDC sees validated case reports and aggregate national signals.',
      'No third party — commercial, governmental, or otherwise — receives identifiable personal data without explicit consent or a court order.',
    ],
  },
  {
    icon: Lock, title: '5. How we protect your data',
    body: [
      'AES-256 encryption at rest. TLS 1.3 in transit.',
      'Strict role-based access control (RBAC) enforced at the database row level.',
      'Multi-factor authentication required for clinical and administrative roles.',
      'Immutable audit logs of every action taken inside the platform.',
      'Annual independent security reviews and penetration testing.',
      'Hosted in compliance with the Nigeria Data Protection Commission (NDPC) cross-border transfer rules.',
    ],
  },
  {
    icon: Globe, title: '6. Data residency & cross-border transfer',
    body: [
      'Production patient data is stored on infrastructure in compliance with NDPC residency requirements.',
      'Aggregate, de-identified statistics may be transferred internationally for the purposes of WHO surveillance and academic public-health research, under appropriate legal safeguards.',
      'No identifiable patient data is transferred outside Nigeria without an explicit lawful basis.',
    ],
  },
  {
    icon: Trash2, title: '7. Your rights',
    body: [
      'Access — request a copy of all personal data we hold about you.',
      'Correction — request correction of any inaccurate data.',
      'Deletion — request deletion of your account and personal data, subject to statutory retention obligations.',
      'Objection — object to certain processing, including marketing communications (note: we do not market to citizens).',
      'Portability — request your data in a machine-readable format.',
      'To exercise any of these rights, email privacy@ai-pews.ng. We respond within 30 days.',
    ],
  },
  {
    icon: Scale, title: '8. Complaints',
    body: [
      'You have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at info@ndpc.gov.ng if you believe we have mishandled your personal data.',
      'We encourage you to contact our Data Protection Officer first at dpo@ai-pews.ng so we can attempt to resolve your concern directly.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" description="How Integra+ Nigeria collects, uses, and protects your personal data, in compliance with the NDPA 2023 and NDPR 2019.">
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Legal · Privacy</span>
            <h1 className="editorial-display text-ink text-4xl md:text-6xl mt-3 mb-4">Privacy Policy.</h1>
            <p className="text-ink-soft leading-relaxed">
              Last updated: 28 April 2026. This policy explains, in plain English, what personal data we collect, how
              we use it, who can see it, and what your rights are. Integra+ is operated by Lantid Creative LTD on behalf of
              the Nigeria Governors' Forum.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-black/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-ink text-[hsl(var(--cream))] grid place-items-center">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-heading font-bold text-ink text-xl">{s.title}</h2>
                </div>
                <ul className="space-y-3">
                  {s.body.map((p, j) => (
                    <li key={j} className="flex gap-3 text-ink-soft text-[15px] leading-relaxed">
                      <span className="text-primary font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-cream-deep rounded-3xl p-8 text-center">
            <p className="text-sm text-ink-soft mb-1">Questions about this policy?</p>
            <a href="mailto:privacy@ai-pews.ng" className="font-heading font-bold text-ink text-lg hover:underline">privacy@ai-pews.ng</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
