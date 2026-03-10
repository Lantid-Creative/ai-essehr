import { Link } from 'react-router-dom';
import { Activity, Building2, Shield, Users, Stethoscope, BarChart3, ArrowRight, CheckCircle2, Globe2, Heart, ChevronRight, Lock, Server, Eye, FileCheck, Zap, Clock, Layers, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const features = [
  {
    icon: Stethoscope,
    title: 'Clinical Encounters',
    desc: 'Syndromic surveillance built into every consultation. Auto-detect priority diseases like Lassa, Cholera, Meningitis, Measles & Diphtheria.',
  },
  {
    icon: Shield,
    title: 'Disease Surveillance',
    desc: 'Real-time outbreak alerts, IDSR-compatible reporting, and threshold-based early warning across all connected regions.',
  },
  {
    icon: Building2,
    title: 'Multi-Facility Platform',
    desc: 'Each health facility gets its own workspace. Patient records travel with them across facilities via verified identity.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Auto-generated reports, disease trend charts, facility scorecards, and national-level dashboards for health agencies.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    desc: 'Onboard healthcare workers — nurses, doctors, and data clerks. Track training, certifications, and attendance per facility.',
  },
  {
    icon: Globe2,
    title: 'Works Offline',
    desc: 'Full offline capability for remote facilities. Data syncs automatically when connectivity returns.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    desc: 'Machine learning models identify disease patterns, predict outbreak risks, and recommend resource allocation.',
  },
  {
    icon: Layers,
    title: 'Interoperable Standards',
    desc: 'Built on HL7 FHIR and IDSR frameworks for seamless integration with national and international health information systems.',
  },
];

const securityFeatures = [
  { icon: Lock, title: 'End-to-End Encryption', desc: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256). Your patient data never travels unprotected.' },
  { icon: Server, title: 'Secure Data Hosting', desc: 'All health data is hosted on secure, compliant infrastructure meeting international data protection standards.' },
  { icon: Eye, title: 'Role-Based Access', desc: 'Granular permissions ensure only authorized personnel access patient records. Every action is audit-logged.' },
  { icon: FileCheck, title: 'Compliance & Auditing', desc: 'Full audit trails for regulatory compliance. IDSR and WHO digital health standards built in.' },
];

const portalCards = [
  {
    icon: Building2,
    title: 'Health Facility',
    desc: 'Register your health facility, onboard staff, and start recording patient encounters and surveillance data.',
    cta: 'Register Facility',
    link: '/register/facility',
  },
  {
    icon: Shield,
    title: 'Health Agency',
    desc: 'Epidemiologists and surveillance officers — access dashboards and outbreak intelligence.',
    cta: 'Agency Login',
    link: '/login',
  },
  {
    icon: Heart,
    title: 'Patient Portal',
    desc: 'View your health records, vaccination history, and lab results securely from anywhere.',
    cta: 'Patient Access',
    link: '/register/patient',
  },
];

const stats = [
  { value: '500+', label: 'Facilities Connected' },
  { value: '100+', label: 'Regions Covered' },
  { value: '50,000+', label: 'Patients Registered' },
  { value: '5', label: 'Priority Diseases Tracked' },
];

const howItWorks = [
  { step: '01', title: 'Register Your Facility', desc: 'Sign up with your facility code, select your region, and create your admin account in minutes.' },
  { step: '02', title: 'Onboard Your Team', desc: 'Add healthcare workers — nurses, doctors, and data clerks. Assign roles and permissions tailored to your facility.' },
  { step: '03', title: 'Start Recording', desc: 'Begin documenting patient encounters, immunizations, and lab results — online or offline.' },
  { step: '04', title: 'Surveillance Activates', desc: 'The system automatically detects disease patterns, triggers alerts, and sends reports to regional and national dashboards.' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-sidebar-foreground/80">
            <a href="#features" className="hover:text-primary-foreground transition-colors">Features</a>
            <a href="#security" className="hover:text-primary-foreground transition-colors">Security</a>
            <a href="#how-it-works" className="hover:text-primary-foreground transition-colors">How it Works</a>
            <Link to="/faq" className="hover:text-primary-foreground transition-colors">FAQs</Link>
            <Link to="/help" className="hover:text-primary-foreground transition-colors">Help</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-accent">
                Sign In
              </Button>
            </Link>
            <Link to="/register/facility">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
          <button className="md:hidden text-sidebar-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-sidebar border-t border-sidebar-border px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm text-sidebar-foreground/80 py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#security" className="block text-sm text-sidebar-foreground/80 py-2" onClick={() => setMobileMenuOpen(false)}>Security</a>
            <a href="#how-it-works" className="block text-sm text-sidebar-foreground/80 py-2" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <Link to="/faq" className="block text-sm text-sidebar-foreground/80 py-2">FAQs</Link>
            <Link to="/help" className="block text-sm text-sidebar-foreground/80 py-2">Help</Link>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full border-sidebar-foreground/30 text-sidebar-foreground">Sign In</Button></Link>
              <Link to="/register/facility" className="flex-1"><Button className="w-full bg-primary text-primary-foreground">Get Started</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_70%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/15 text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-primary/20">
                <Shield className="h-4 w-4" />
                Surveillance-First EHR Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-sidebar-foreground leading-[1.1] mb-6">
                Smarter Health Records,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(153,100%,40%)] to-[hsl(160,80%,55%)]">
                  Real-Time Surveillance
                </span>
              </h1>
              <p className="text-lg text-sidebar-foreground/65 mb-10 max-w-xl leading-relaxed">
                AI-ESS EHR is the surveillance-first electronic health records platform built for 
                health facilities everywhere. Detect outbreaks early. Save lives faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register/facility">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-8 h-13 shadow-lg shadow-primary/25">
                    Register Your Facility
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-accent h-13 text-base px-8">
                    Sign In to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            {/* Stats Card */}
            <div className="hidden lg:block">
              <div className="bg-sidebar-accent/40 backdrop-blur-sm border border-sidebar-border rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((s) => (
                    <div key={s.label} className="bg-sidebar/60 rounded-xl p-5 border border-sidebar-border/50">
                      <div className="text-3xl font-heading font-bold text-primary-foreground">{s.value}</div>
                      <div className="text-sm text-sidebar-foreground/50 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 text-sidebar-foreground/50 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Real-time surveillance active 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Stats */}
      <section className="lg:hidden bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-heading font-bold text-primary-foreground">{s.value}</div>
                <div className="text-sm text-primary-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Platform Overview</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              A Complete Digital Health Ecosystem
            </h2>
            <p className="text-muted-foreground text-lg">
              AI-ESS EHR connects facilities, health agencies, and patients on a unified platform — 
              enabling real-time disease surveillance, clinical documentation, and data-driven health policy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {portalCards.map((card, i) => (
              <div key={card.title} className="group relative card-ehr p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                  <card.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-3">{card.title}</h3>
                <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">{card.desc}</p>
                <Link to={card.link}>
                  <Button className="w-full bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 transition-colors">
                    {card.cta}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Built for Modern Healthcare
            </h2>
            <p className="text-muted-foreground text-lg">
              Every module is designed around the IDSR framework, disease priorities, 
              and the realities of frontline health care delivery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-ehr p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-heading font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 bg-sidebar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-primary-foreground/60 font-semibold text-sm uppercase tracking-wider mb-3">Security & Compliance</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-sidebar-foreground mb-4">
              Your Data is Protected
            </h2>
            <p className="text-sidebar-foreground/60 text-lg">
              Health data security isn't optional — it's foundational. AI-ESS EHR is built with enterprise-grade 
              security and full compliance with data protection regulations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((f) => (
              <div key={f.title} className="flex gap-5 bg-sidebar-accent/40 border border-sidebar-border rounded-xl p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-sidebar-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-sidebar-foreground/60 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Getting Started</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get your facility up and running in four simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                <div className="text-6xl font-heading font-bold text-primary/10 mb-2">{step.step}</div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">About the Platform</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                A Nigeria Governors' Forum Initiative
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                AI-ESS EHR is part of the national strategy to strengthen disease surveillance 
                at the grassroots level. By digitizing health records at Primary Health Care facilities 
                and connecting them to state and national dashboards, we create an early warning system 
                that protects all Nigerians.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Developed by Lantid Creative LTD, the platform leverages artificial intelligence, 
                offline-first architecture, and the IDSR framework to ensure every facility — 
                from urban clinics to rural PHCs — contributes to a unified national health picture.
              </p>
              <div className="space-y-3">
                {[
                  'Syndromic surveillance at point of care',
                  'IDSR-compatible outbreak reporting',
                  'Works offline in rural areas',
                  'NIN-verified patient identity',
                  'Multi-facility patient records',
                  'NDPR-compliant data handling',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-sidebar rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-sidebar-foreground mb-1">AI-ESS EHR</h3>
                <p className="text-sidebar-foreground/50 text-sm">National Health Surveillance System</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: '5', label: 'Priority Diseases' },
                  { val: '24/7', label: 'Alert Monitoring' },
                  { val: '100%', label: 'Offline Ready' },
                  { val: 'IDSR', label: 'Compliant' },
                ].map((item) => (
                  <div key={item.label} className="bg-sidebar-accent/50 rounded-xl p-4 border border-sidebar-border/50">
                    <div className="text-2xl font-bold text-primary-foreground">{item.val}</div>
                    <div className="text-xs text-sidebar-foreground/50 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Digitize Your Facility?
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of Primary Health Care facilities across Nigeria already using AI-ESS EHR 
            to improve patient outcomes and strengthen disease surveillance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register/facility">
              <Button size="lg" className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 font-semibold text-base px-10 h-13">
                Register Your Facility
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/faq">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-13 text-base px-8">
                Read FAQs
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
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
              </div>
              <p className="text-sm text-sidebar-foreground/50 leading-relaxed">
                Nigeria Governors' Forum — National Health Surveillance System. Built by Lantid Creative LTD.
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
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sidebar-foreground mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <div className="space-y-2.5 text-sm text-sidebar-foreground/50">
                <Link to="/faq" className="block hover:text-sidebar-foreground transition-colors">FAQs</Link>
                <Link to="/help" className="block hover:text-sidebar-foreground transition-colors">Help Center</Link>
                <Link to="/register/patient" className="block hover:text-sidebar-foreground transition-colors">Patient Portal</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-sidebar-border mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-sidebar-foreground/30">
            <span>© {new Date().getFullYear()} Lantid Creative LTD. All rights reserved.</span>
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
