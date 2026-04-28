import PageShell from '@/components/public/PageShell';
import { FileText, Users, AlertTriangle, Ban, Scale, Heart, ShieldOff, RefreshCw } from 'lucide-react';

const sections = [
  { icon: FileText, title: '1. Acceptance of these terms', body: ['By creating an account, deploying AI-PEWS at a facility, or using any part of the platform, you agree to these Terms of Service. If you do not agree, do not use the platform.'] },
  { icon: Users, title: '2. Eligibility & accounts', body: [
    'Citizen accounts: open to anyone resident in Nigeria with a valid mobile number. Minimum age 18, or 13+ with parental consent.',
    'Facility accounts: open to licensed health facilities recognised by the Federal Ministry of Health, the relevant State Ministry of Health, or the National Primary Health Care Development Agency.',
    'Agency accounts: open to designated officers of NCDC, state ministries of health, LGA disease-surveillance units, and accredited international health partners.',
    'You are responsible for maintaining the security of your account credentials and for all activities under your account.',
  ] },
  { icon: Heart, title: '3. Acceptable use', body: [
    'Use AI-PEWS solely for its intended purpose: clinical care, disease surveillance, public health response.',
    'Comply with all applicable laws — including the Nigeria Data Protection Act, the National Health Act, and the NCDC Act.',
    'Do not falsify community reports. False or malicious reports may be subject to criminal prosecution under Nigerian law.',
    'Do not attempt to access patient data outside the scope of your role.',
    'Do not attempt to interfere with, reverse-engineer, or otherwise compromise the integrity of the platform.',
  ] },
  { icon: Ban, title: '4. Prohibited conduct', body: [
    'Sharing accounts between users.',
    'Submitting reports knowingly false or designed to cause public alarm.',
    'Exporting bulk patient data outside the platform without explicit, documented authorisation.',
    'Using the platform for any commercial purpose unrelated to clinical care or public health.',
    'Attempting to circumvent the validated data chain (e.g. publishing alerts without state-level validation).',
  ] },
  { icon: AlertTriangle, title: '5. Clinical disclaimer', body: [
    'AI-PEWS supports clinical and surveillance decisions; it does not replace clinical judgement.',
    'AI-generated signals (e.g. drug-interaction alerts, syndromic clusters) are advisory. Final clinical decisions remain the responsibility of the licensed clinician.',
    'In any conflict between an AI recommendation and a clinician\'s professional judgement, the clinician\'s judgement takes precedence.',
  ] },
  { icon: ShieldOff, title: '6. Liability & warranties', body: [
    'AI-PEWS is provided "as is". We make every reasonable effort to ensure accuracy, availability, and security.',
    'We are not liable for losses arising from: (a) interruptions in connectivity outside our control, (b) errors in third-party integrations (SORMAS, DHIS2), (c) misuse of the platform by users, (d) clinical decisions made by licensed practitioners.',
    'Our maximum aggregate liability for any claim is limited to the fees paid (if any) by the relevant party in the prior 12 months. For citizens, who pay no fees, liability is limited to demonstrable direct loss.',
  ] },
  { icon: Scale, title: '7. Governing law', body: [
    'These terms are governed by the laws of the Federal Republic of Nigeria.',
    'Any disputes shall first be submitted to good-faith mediation, and failing resolution, to the competent Nigerian courts.',
  ] },
  { icon: RefreshCw, title: '8. Changes & termination', body: [
    'We may update these terms from time to time. Material changes will be notified to users via email or in-app notification at least 30 days before they take effect.',
    'You may close your account at any time. We may suspend or terminate accounts that violate these terms, with notice where reasonable.',
  ] },
];

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service" description="The terms governing use of AI-PEWS Nigeria for citizens, facilities, and agencies.">
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Legal · Terms</span>
            <h1 className="editorial-display text-ink text-4xl md:text-6xl mt-3 mb-4">Terms of Service.</h1>
            <p className="text-ink-soft leading-relaxed">Last updated: 28 April 2026. These terms govern your use of AI-PEWS Nigeria — for citizens, facility staff, and agency users alike.</p>
          </div>
          <div className="space-y-10">
            {sections.map((s, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-black/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-ink text-[hsl(var(--cream))] grid place-items-center"><s.icon className="h-4 w-4" /></div>
                  <h2 className="font-heading font-bold text-ink text-xl">{s.title}</h2>
                </div>
                <ul className="space-y-3">
                  {s.body.map((p, j) => (
                    <li key={j} className="flex gap-3 text-ink-soft text-[15px] leading-relaxed">
                      <span className="text-primary font-bold">•</span><span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-cream-deep rounded-3xl p-8 text-center">
            <p className="text-sm text-ink-soft mb-1">Legal questions?</p>
            <a href="mailto:legal@ai-pews.ng" className="font-heading font-bold text-ink text-lg hover:underline">legal@ai-pews.ng</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
