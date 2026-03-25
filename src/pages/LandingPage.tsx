import { Link } from 'react-router-dom';
import { Activity, Building2, Shield, Users, Stethoscope, BarChart3, ArrowRight, CheckCircle2, Globe2, Heart, ChevronRight, Lock, Server, Eye, FileCheck, Zap, Clock, AlertTriangle, Menu, X, Brain, Radio, Layers, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const crisisStats = [
  { value: '15 Days', label: 'Current 717 detection', sub: 'Too slow to save lives' },
  { value: '<24 Hrs', label: 'AI-PEWS target speed', sub: '90%+ faster response' },
  { value: '23.2%', label: 'Lassa fever CFR 2026', sub: 'Rising — higher than 2025' },
  { value: '200M+', label: 'Nigerians protected', sub: 'National scale coverage' },
];

const outbreaks = [
  { disease: 'Lassa Fever', status: '109 deaths, 469 confirmed across 18 states', severity: 'critical' },
  { disease: 'Meningitis', status: 'Active in Northern Belt — Jigawa, Yobe, Kano', severity: 'high' },
  { disease: 'Diphtheria', status: 'Highest burden in Africa — 30 states affected', severity: 'high' },
  { disease: 'Cholera', status: '22,102 cases in 2025 — concurrent 2026 outbreak', severity: 'critical' },
  { disease: 'Measles', status: '26,866 cases in 2025 — all 36 states + FCT', severity: 'high' },
];

const modules = [
  {
    icon: Stethoscope,
    title: 'Module 1: Surveillance-Optimised EHR',
    desc: 'Every patient encounter captured digitally at point of care. Offline-first. Multilingual. Nothing lost in transit.',
  },
  {
    icon: Brain,
    title: 'Module 2: AI Detection Engine',
    desc: 'NLP reads Pidgin clinical notes. Syndromic pattern clustering across facilities. 40% more signal than structured fields alone.',
  },
  {
    icon: Globe2,
    title: 'Module 3: Validated Data Chain',
    desc: 'LGA validates → one-click push to SORMAS & DHIS2 simultaneously. State validates → NCDC receives. Every step timestamped.',
  },
  {
    icon: AlertTriangle,
    title: 'Module 4: Early Warning Alerts',
    desc: 'Autonomous alerts via WhatsApp & SMS when thresholds are crossed. No human escalation decision required.',
  },
  {
    icon: MessageSquare,
    title: 'Module 5: Community Reporting',
    desc: 'Citizens report unusual health observations via browser. Community signals increase cluster confidence scores.',
  },
  {
    icon: Radio,
    title: 'Offline-First Architecture',
    desc: 'Full functionality without internet. Syndromic data syncs automatically when connectivity returns.',
  },
];

const partners = [
  { name: 'Nigeria Governors\' Forum', role: 'Lead Organisation', abbr: 'NGF' },
  { name: 'Lantid Creative Ltd', role: 'Technical Partner', abbr: 'LCL' },
  { name: 'NCDC', role: 'Surveillance Authority', abbr: 'NCDC' },
  { name: 'NHEAD', role: 'Health Innovation', abbr: 'NHEAD' },
  { name: 'Federal Ministry of Health', role: 'Health Policy', abbr: 'FMOH' },
];

const timeline = [
  { phase: 'Phase 1', period: 'Months 1–10', title: 'Foundation & Pilot', desc: 'Deploy to 2 pilot states (one north, one south). Train 2,000 health workers. SORMAS & DHIS2 push validated. Community portal live.' },
  { phase: 'Phase 2', period: 'Months 11–24', title: 'Validation & Scale', desc: 'Rollout to all 36 states and FCT. 3,000+ facilities. National NCDC dashboard. Zero-rating finalised.' },
  { phase: 'Phase 3', period: 'Months 25–36', title: 'Institutionalisation', desc: 'Full transition to government ownership. Open-source publication. No external dependency by Month 36.' },
];

const impactMetrics = [
  { indicator: 'Days from first case to alert', baseline: '15+ days', target: '<1 day' },
  { indicator: 'Facilities with live EHR', baseline: '<10%', target: '85%+' },
  { indicator: 'LGA validation compliance', baseline: 'None', target: '90%+' },
  { indicator: 'AI model sensitivity', baseline: 'N/A', target: '>80%' },
  { indicator: 'Health workers trained', baseline: '0', target: '2,000+' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-heading font-bold text-sidebar-foreground">AI-PEWS</span>
              <span className="text-[10px] text-sidebar-foreground/50 block leading-tight">Nigeria</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-sidebar-foreground/80">
            <a href="#crisis" className="hover:text-primary-foreground transition-colors">The Crisis</a>
            <a href="#solution" className="hover:text-primary-foreground transition-colors">Solution</a>
            <a href="#partners" className="hover:text-primary-foreground transition-colors">Partners</a>
            <a href="#impact" className="hover:text-primary-foreground transition-colors">Impact</a>
            <Link to="/community-report" className="hover:text-primary-foreground transition-colors">Report Outbreak</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-accent">
                Staff Login
              </Button>
            </Link>
            <Link to="/register/facility">
              <Button className="gradient-primary text-primary-foreground hover:opacity-90 font-semibold shadow-lg">
                Register Facility
              </Button>
            </Link>
          </div>
          <button className="md:hidden text-sidebar-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-sidebar border-t border-sidebar-border px-4 py-4 space-y-3">
            <a href="#crisis" className="block text-sm text-sidebar-foreground/80 py-2" onClick={() => setMobileMenuOpen(false)}>The Crisis</a>
            <a href="#solution" className="block text-sm text-sidebar-foreground/80 py-2" onClick={() => setMobileMenuOpen(false)}>Solution</a>
            <a href="#partners" className="block text-sm text-sidebar-foreground/80 py-2" onClick={() => setMobileMenuOpen(false)}>Partners</a>
            <Link to="/community-report" className="block text-sm text-sidebar-foreground/80 py-2">Report Outbreak</Link>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full border-sidebar-foreground/30 text-sidebar-foreground">Staff Login</Button></Link>
              <Link to="/register/facility" className="flex-1"><Button className="w-full gradient-primary text-primary-foreground">Register</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-destructive/20 text-destructive-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-destructive/30 pulse-alert">
                <AlertTriangle className="h-4 w-4" />
                Active Outbreaks in 2026 — 5 Priority Diseases
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-extrabold text-sidebar-foreground leading-[1.08] mb-6">
                From{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-[hsl(28,80%,52%)]">
                  15 Days
                </span>{' '}
                to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(153,100%,40%)] to-[hsl(160,80%,55%)]">
                  Under 24 Hours
                </span>
              </h1>
              <p className="text-lg text-sidebar-foreground/70 mb-4 max-w-xl leading-relaxed">
                <strong className="text-sidebar-foreground">AI-PEWS Nigeria</strong> is the AI-Powered Early Warning System that collapses the 717 surveillance timeline — digitising recording at the point of care and automating reporting through a validated chain to SORMAS and DHIS2.
              </p>
              <p className="text-sm text-sidebar-foreground/50 mb-8 max-w-xl">
                Led by the Nigeria Governors' Forum. Built by Lantid Creative Ltd. Endorsed by NCDC.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register/facility">
                  <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 font-semibold text-base px-10 h-14 shadow-xl">
                    Deploy at Your Facility
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/community-report">
                  <Button size="lg" className="bg-sidebar-foreground/10 text-sidebar-foreground border border-sidebar-foreground/20 font-semibold text-base px-10 h-14 hover:bg-sidebar-foreground/15">
                    Report an Outbreak
                  </Button>
                </Link>
              </div>
            </div>
            {/* Crisis Stats */}
            <div className="hidden lg:block">
              <div className="bg-sidebar-accent/30 backdrop-blur-sm border border-sidebar-border rounded-2xl p-8 shadow-2xl">
                <h3 className="text-sm font-heading font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-6">The Core Commitment</h3>
                <div className="grid grid-cols-2 gap-4">
                  {crisisStats.map((s) => (
                    <div key={s.label} className="bg-sidebar/60 rounded-xl p-5 border border-sidebar-border/50">
                      <div className={`text-2xl font-heading font-bold ${s.value === '23.2%' || s.value === '15 Days' ? 'text-destructive-foreground' : 'text-primary-foreground'}`}>{s.value}</div>
                      <div className="text-xs text-sidebar-foreground/60 mt-1 font-medium">{s.label}</div>
                      <div className="text-[10px] text-sidebar-foreground/40 mt-0.5">{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-xs text-sidebar-foreground/40 italic">
                  Source: NCDC Epidemiological Week 9, 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Stats */}
      <section className="lg:hidden bg-sidebar py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 text-center">
            {crisisStats.map((s) => (
              <div key={s.label} className="bg-sidebar-accent/40 rounded-xl p-4 border border-sidebar-border/50">
                <div className="text-xl font-heading font-bold text-primary-foreground">{s.value}</div>
                <div className="text-xs text-sidebar-foreground/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Outbreaks Banner */}
      <section id="crisis" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-destructive font-semibold text-sm uppercase tracking-wider mb-3">2026 Crisis</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Five Concurrent Outbreaks. One Broken System.
            </h2>
            <p className="text-muted-foreground text-lg">
              The NCDC Director General has confirmed: <em>"State ownership is still a major challenge. Cases are not being properly traced."</em> AI-PEWS fixes the data gap between recording and reporting.
            </p>
          </div>
          <div className="space-y-3 max-w-4xl mx-auto">
            {outbreaks.map((o) => (
              <div key={o.disease} className="card-ehr p-5 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full shrink-0 ${o.severity === 'critical' ? 'bg-destructive pulse-alert' : 'bg-warning'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-heading font-bold text-foreground">{o.disease}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.severity === 'critical' ? 'badge-critical' : 'badge-warning'}`}>
                      {o.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{o.status}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 717 Explainer */}
          <div className="mt-12 max-w-4xl mx-auto bg-sidebar rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-heading font-bold text-sidebar-foreground mb-6">The 717 Timeline — Why People Die</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-sidebar-accent/50 rounded-xl p-5 border border-sidebar-border/50 text-center">
                <div className="text-3xl font-heading font-bold text-destructive-foreground">7</div>
                <div className="text-xs text-sidebar-foreground/60 mt-1">Days for lab detection</div>
              </div>
              <div className="bg-sidebar-accent/50 rounded-xl p-5 border border-sidebar-border/50 text-center">
                <div className="text-3xl font-heading font-bold text-warning">1</div>
                <div className="text-xs text-sidebar-foreground/60 mt-1">Day for notification</div>
              </div>
              <div className="bg-sidebar-accent/50 rounded-xl p-5 border border-sidebar-border/50 text-center">
                <div className="text-3xl font-heading font-bold text-destructive-foreground">7</div>
                <div className="text-xs text-sidebar-foreground/60 mt-1">Days for response</div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-sidebar-accent/30 rounded-lg px-5 py-3 border border-sidebar-border/30">
              <span className="text-sidebar-foreground/60 text-sm">Total: <strong className="text-destructive-foreground">15+ days</strong> from patient presentation to government action</span>
              <ArrowRight className="h-4 w-4 text-sidebar-foreground/40 hidden sm:block" />
              <span className="text-sm font-bold text-primary-foreground hidden sm:block">AI-PEWS: &lt;24 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Modules */}
      <section id="solution" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">The Solution</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Five Modules. One Integrated System.
            </h2>
            <p className="text-muted-foreground text-lg">
              AI-PEWS digitises the point of recording and automates the point of reporting — collapsing the 717 timeline to under 24 hours.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => (
              <div key={m.title} className="card-ehr p-6 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <m.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-heading font-bold text-foreground mb-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-20 bg-sidebar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-primary-foreground/50 font-semibold text-sm uppercase tracking-wider mb-3">Generative AI</p>
              <h2 className="text-3xl font-heading font-bold text-sidebar-foreground mb-6">
                Reading Nigerian Clinical Language
              </h2>
              <p className="text-sidebar-foreground/65 mb-6 leading-relaxed">
                Health workers document in a mix of English, Pidgin, and local language. The AI-PEWS language model extracts syndromic signals from this free text — adding approximately <strong className="text-sidebar-foreground">40% more surveillance signal</strong> than structured fields alone.
              </p>
              <div className="space-y-4">
                <div className="bg-sidebar-accent/40 rounded-xl p-4 border border-sidebar-border/50">
                  <p className="text-sm text-sidebar-foreground/80 italic mb-2">"patient dey complain of watery stool and body hot since three days"</p>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary-foreground">→ Cholera syndromic profile</span>
                  </div>
                </div>
                <div className="bg-sidebar-accent/40 rounded-xl p-4 border border-sidebar-border/50">
                  <p className="text-sm text-sidebar-foreground/80 italic mb-2">"pikin dey breathe hard, neck stiff, fever since yesterday"</p>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary-foreground">→ Meningitis criteria</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-primary-foreground/50 font-semibold text-sm uppercase tracking-wider mb-3">Agentic AI</p>
              <h2 className="text-3xl font-heading font-bold text-sidebar-foreground mb-6">
                Acting Without Waiting
              </h2>
              <p className="text-sidebar-foreground/65 mb-6 leading-relaxed">
                Every existing surveillance system in Nigeria is <strong className="text-sidebar-foreground">passive</strong> — a human must query the data, recognise a pattern, and decide to escalate. AI-PEWS replaces that dependency with autonomous action.
              </p>
              <div className="space-y-3">
                {[
                  'Calculates outbreak risk score automatically',
                  'Determines geographic boundary of cluster',
                  'Selects communication channel per stakeholder tier',
                  'Drafts situation summary with case counts',
                  'Dispatches alerts via WhatsApp & SMS',
                  'Schedules follow-up updates — no human instruction needed',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-sidebar-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Partnership Structure</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Government-Led. Technically Grounded.
            </h2>
            <p className="text-muted-foreground text-lg">
              This is not a technology project searching for a government partner. The Nigeria Governors' Forum <strong className="text-foreground">is</strong> the government.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {partners.map((p) => (
              <div key={p.abbr} className="card-ehr p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-heading font-bold text-primary">{p.abbr}</span>
                </div>
                <h3 className="text-sm font-heading font-bold text-foreground mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Timeline */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">36-Month Deployment</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Three Phases to National Scale
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {timeline.map((t, i) => (
              <div key={t.phase} className="relative">
                <div className="card-ehr p-8">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {t.phase} · {t.period}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                </div>
                {i < timeline.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 translate-x-0">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Measurable Impact</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Impact & Measurement
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="card-ehr overflow-hidden">
              <div className="grid grid-cols-3 bg-primary text-primary-foreground text-sm font-heading font-semibold">
                <div className="px-6 py-3">Indicator</div>
                <div className="px-6 py-3">Baseline</div>
                <div className="px-6 py-3">Target</div>
              </div>
              {impactMetrics.map((m, i) => (
                <div key={m.indicator} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/50'}`}>
                  <div className="px-6 py-4 font-medium text-foreground">{m.indicator}</div>
                  <div className="px-6 py-4 text-destructive font-medium">{m.baseline}</div>
                  <div className="px-6 py-4 text-success font-bold">{m.target}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Access Points</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Get Started with AI-PEWS
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-ehr p-8 flex flex-col hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">Health Facility</h3>
              <p className="text-muted-foreground mb-6 flex-1">Register your PHC, deploy the EHR, and start contributing to the national early warning network.</p>
              <Link to="/register/facility">
                <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90">
                  Register Facility <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="card-ehr p-8 flex flex-col hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">Health Agency</h3>
              <p className="text-muted-foreground mb-6 flex-1">Epidemiologists, DSNOs, and NCDC officers — access real-time surveillance dashboards and early warning alerts.</p>
              <Link to="/login">
                <Button className="w-full bg-sidebar text-sidebar-foreground hover:bg-sidebar/90">
                  Agency Login <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="card-ehr p-8 flex flex-col hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">Community Reporter</h3>
              <p className="text-muted-foreground mb-6 flex-1">Report unusual health observations in your community. Your report strengthens the early warning network.</p>
              <Link to="/community-report">
                <Button className="w-full bg-warning text-warning-foreground hover:bg-warning/90">
                  Report Now <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Nigeria's Early Warning System Starts Here
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            The EHR is built. The AI model is architected. The political authority — through the NGF — exists. 
            What this project funds is taking a working system national.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register/facility">
              <Button size="lg" className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 font-semibold text-base px-10 h-14">
                Deploy AI-PEWS <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/faq">
              <Button size="lg" className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-semibold text-base px-10 h-14 hover:bg-primary-foreground/15">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar py-14 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-heading font-bold text-sidebar-foreground">AI-PEWS Nigeria</span>
                </div>
              </div>
              <p className="text-sm text-sidebar-foreground/50 leading-relaxed mb-3">
                AI-Powered Early Warning System. Built on a unified EHR infrastructure.
              </p>
              <p className="text-xs text-sidebar-foreground/30">
                Technical Partner: Lantid Creative LTD
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sidebar-foreground mb-4 text-sm uppercase tracking-wider">For Facilities</h4>
              <div className="space-y-2.5 text-sm text-sidebar-foreground/50">
                <Link to="/register/facility" className="block hover:text-sidebar-foreground transition-colors">Register Facility</Link>
                <Link to="/login" className="block hover:text-sidebar-foreground transition-colors">Staff Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sidebar-foreground mb-4 text-sm uppercase tracking-wider">For Agencies</h4>
              <div className="space-y-2.5 text-sm text-sidebar-foreground/50">
                <Link to="/login" className="block hover:text-sidebar-foreground transition-colors">NCDC Dashboard</Link>
                <Link to="/login" className="block hover:text-sidebar-foreground transition-colors">State Epidemiologist</Link>
                <Link to="/login" className="block hover:text-sidebar-foreground transition-colors">LGA DSNO</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sidebar-foreground mb-4 text-sm uppercase tracking-wider">Community</h4>
              <div className="space-y-2.5 text-sm text-sidebar-foreground/50">
                <Link to="/community-report" className="block hover:text-sidebar-foreground transition-colors">Report an Outbreak</Link>
                <Link to="/faq" className="block hover:text-sidebar-foreground transition-colors">FAQs</Link>
                <Link to="/help" className="block hover:text-sidebar-foreground transition-colors">Help Center</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-sidebar-border mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-sidebar-foreground/30">
            <span>© {new Date().getFullYear()} Nigeria Governors' Forum · Technical Partner: Lantid Creative LTD</span>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-sidebar-foreground/60 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-sidebar-foreground/60 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
