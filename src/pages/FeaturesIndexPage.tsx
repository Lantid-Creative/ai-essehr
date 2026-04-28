import { Link } from 'react-router-dom';
import {
  Stethoscope, Brain, Globe2, AlertTriangle, MessageSquare, Radio,
  Users, FlaskConical, Pill, Baby, BedDouble, Calendar, FileText, Truck,
  Phone, ShieldCheck, Activity, ClipboardCheck, Wallet, Receipt, BellRing,
  Heart, Database, Lock, Map, Syringe, ArrowUpRight,
} from 'lucide-react';
import PageShell from '@/components/public/PageShell';

const groups = [
  {
    name: 'Clinical Care',
    items: [
      { icon: Users, title: 'Patient Registry', desc: 'National patient lookup with NIN verification (~1.5s).' },
      { icon: Stethoscope, title: 'Consultation', desc: 'SOAP notes with live drug-interaction & allergy alerts.' },
      { icon: Activity, title: 'Vitals & NEWS2', desc: 'Vital signs capture with automatic deterioration scoring.' },
      { icon: FlaskConical, title: 'Laboratory', desc: 'Order entry, specimen barcoding, abnormal-flag triggers.' },
      { icon: Pill, title: 'Pharmacy & Inventory', desc: 'Live drug stock, FEFO expiry, integrated dispensing.' },
      { icon: Baby, title: 'Maternal & Child Health', desc: 'ANC, deliveries, under-5 growth, immunisations.' },
      { icon: Syringe, title: 'Immunisation', desc: 'Schedule tracking, dose history, defaulter lists.' },
      { icon: BedDouble, title: 'Wards & Admissions', desc: 'Bed grid across 6 ward types, MAR, nursing tasks.' },
      { icon: Calendar, title: 'Appointments & Queues', desc: 'Triage priorities, walk-in & scheduled queues.' },
      { icon: ClipboardCheck, title: 'Clinical Tasks', desc: 'Assignment inbox, abnormal-result acknowledgement.' },
      { icon: Heart, title: 'Consent Forms', desc: 'NDPR-compliant electronic consent capture.' },
    ],
  },
  {
    name: 'Surveillance & AI',
    items: [
      { icon: Brain, title: 'Sentinel AI', desc: 'Syndromic NLP across English, Pidgin, local languages.' },
      { icon: AlertTriangle, title: 'Early Warning Alerts', desc: 'Autonomous risk score, WhatsApp/SMS dispatch.' },
      { icon: Globe2, title: 'Validated Data Chain', desc: '4-tier validation; one-click SORMAS & DHIS2 push.' },
      { icon: Map, title: 'Geo Heatmap', desc: 'LGA-level case clustering visualisation.' },
      { icon: BellRing, title: 'AI Anomaly Detection', desc: 'Unusual pattern flags across 5 priority diseases.' },
      { icon: FileText, title: 'IDSR Weekly Reports', desc: 'Automated weekly disease surveillance rollups.' },
    ],
  },
  {
    name: 'Emergency Response',
    items: [
      { icon: Phone, title: 'Rescue Tap', desc: 'One-tap emergency from any phone — auto-locates nearest hospital.' },
      { icon: Truck, title: 'Ambulance Portal', desc: 'Live dispatch tracking, en-route care log, ETA to ER.' },
      { icon: Truck, title: 'Fleet Management', desc: 'Multi-ambulance tracking, crew scheduling, maintenance logs.' },
      { icon: Activity, title: 'ER Inbound Queue', desc: 'Pre-arrival patient briefs sent to receiving hospital.' },
      { icon: Globe2, title: 'Patient Referrals', desc: 'Inter-facility referrals with auto-task creation.' },
    ],
  },
  {
    name: 'Operations & Finance',
    items: [
      { icon: Wallet, title: 'Cashier Shifts', desc: 'Drawer reconciliation, shift open/close, movement audit.' },
      { icon: Receipt, title: 'Billing & Invoicing', desc: 'Multi-payer billing, printable professional invoices.' },
      { icon: ShieldCheck, title: 'Insurance Claims', desc: 'NHIA, HMOs, corporate, CBHIS — pre-auth & co-pay logic.' },
      { icon: Database, title: 'Drug Inventory', desc: 'Stock ledger, FEFO, low-stock alerts, supplier tracking.' },
      { icon: Users, title: 'Staff Management', desc: 'Provisioning, certification tracking, role assignment.' },
      { icon: Lock, title: 'Audit Trail', desc: 'Immutable log of every clinical & administrative action.' },
    ],
  },
  {
    name: 'Citizen & Community',
    items: [
      { icon: MessageSquare, title: 'Community Report Portal', desc: 'Public submission of unusual health observations.' },
      { icon: BellRing, title: 'Citizen Alert Subscription', desc: 'WhatsApp & SMS alerts by LGA — free.' },
      { icon: Heart, title: 'Patient Portal', desc: 'Visits, labs, vaccines, appointments, messaging.' },
      { icon: Radio, title: 'Offline-First Core', desc: 'Full functionality without internet, background sync.' },
    ],
  },
];

export default function FeaturesIndexPage() {
  return (
    <PageShell title="All Features" description="A complete index of every module in AI-PEWS Nigeria — clinical, surveillance, emergency, operations, and community.">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">All features</span>
            <h1 className="editorial-display text-ink text-4xl md:text-6xl mt-3 mb-4">Everything inside.<br /><span className="italic font-light">All in one platform.</span></h1>
            <p className="text-ink-soft leading-relaxed text-lg">
              AI-PEWS is more than surveillance. It's a complete, integrated platform covering clinical care, AI detection,
              emergency response, hospital operations, and citizen engagement.
            </p>
          </div>

          <div className="space-y-16">
            {groups.map((g) => (
              <div key={g.name}>
                <div className="flex items-end justify-between mb-6 border-b border-ink/10 pb-3">
                  <h2 className="editorial-display text-ink text-2xl md:text-3xl">{g.name}</h2>
                  <span className="text-xs text-editorial-muted">{g.items.length} modules</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.items.map((it) => (
                    <div key={it.title} className="bg-white rounded-2xl p-5 border border-black/5 flex gap-4 hover:shadow-md transition">
                      <div className="w-10 h-10 rounded-xl bg-cream grid place-items-center shrink-0">
                        <it.icon className="h-4 w-4 text-ink" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-ink text-sm mb-1">{it.title}</h3>
                        <p className="text-xs text-ink-soft leading-relaxed">{it.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 rounded-3xl bg-ink text-[hsl(var(--cream))] p-10 md:p-12 text-center">
            <h2 className="editorial-display text-3xl md:text-4xl mb-3">More than 30 integrated modules.</h2>
            <p className="text-[hsl(var(--cream))]/70 max-w-xl mx-auto mb-6">Designed to work together. Deployed as one platform. Free to register, free to deploy.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register/facility" className="pill-light">Deploy at facility <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15">Request a demo</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
