import { Link } from 'react-router-dom';
import { Activity, Building2, Shield, Users, Stethoscope, BarChart3, ArrowRight, CheckCircle2, Globe2, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Stethoscope,
    title: 'Clinical Encounters',
    desc: 'Syndromic surveillance built into every consultation. Auto-detect Lassa, Cholera, Meningitis, Measles & Diphtheria.',
  },
  {
    icon: Shield,
    title: 'Disease Surveillance',
    desc: 'Real-time outbreak alerts, IDSR-compatible reporting, and threshold-based early warning across all 36 states + FCT.',
  },
  {
    icon: Building2,
    title: 'Multi-Facility Platform',
    desc: 'Each health facility gets its own workspace. Patient records travel with them across facilities via NIN verification.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'HMIS 035B auto-generation, disease trend charts, facility scorecards, and national-level dashboards for NCDC.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    desc: 'Onboard CHEWs, Nurses, Doctors, and Data Clerks. Track training, certifications, and attendance per facility.',
  },
  {
    icon: Globe2,
    title: 'Works Offline',
    desc: 'Full offline capability for rural PHCs. Data syncs automatically when connectivity returns.',
  },
];

const portalCards = [
  {
    icon: Building2,
    title: 'Health Facility',
    desc: 'Register your Primary Health Care centre and onboard your staff to start recording patient encounters and surveillance data.',
    cta: 'Register Facility',
    link: '/register/facility',
    color: 'bg-primary',
  },
  {
    icon: Shield,
    title: 'Health Agency',
    desc: 'NCDC, State Epidemiologists, and LGA Focal Persons — access your surveillance dashboards and outbreak intelligence.',
    cta: 'Agency Login',
    link: '/login',
    color: 'bg-accent',
  },
  {
    icon: Heart,
    title: 'Patient Portal',
    desc: 'View your health records, vaccination history, lab results, and book appointments at any registered facility.',
    cta: 'Patient Access',
    link: '/register/patient',
    color: 'bg-success',
  },
];

const stats = [
  { value: '774+', label: 'LGAs Covered' },
  { value: '36 + FCT', label: 'States Connected' },
  { value: '50,000+', label: 'Patients Registered' },
  { value: '5', label: 'Priority Diseases Tracked' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Activity className="h-7 w-7 text-accent" />
            <div>
              <span className="text-lg font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
              <span className="hidden sm:inline text-xs text-sidebar-foreground/60 ml-2">Nigeria Governors' Forum</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-sidebar-foreground/80">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <a href="#portals" className="hover:text-accent transition-colors">Get Started</a>
            <a href="#about" className="hover:text-accent transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sidebar-foreground hover:text-accent hover:bg-sidebar-accent">
                Sign In
              </Button>
            </Link>
            <Link to="/register/facility">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                Register Facility
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-sidebar-accent/50 text-accent text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Shield className="h-4 w-4" />
              National Health Surveillance System
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-sidebar-foreground leading-tight mb-6">
              Protecting Nigeria's Health,{' '}
              <span className="text-accent">One Facility at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-sidebar-foreground/70 mb-10 max-w-2xl">
              AI-ESS EHR is the surveillance-first electronic health records platform deployed across 
              Primary Health Care facilities in all 36 Nigerian states and the FCT. Detect outbreaks early. 
              Save lives faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register/facility">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8 h-12">
                  Register Your Facility
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-sidebar-foreground/30 text-sidebar-foreground hover:bg-sidebar-accent h-12 text-base px-8">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground">{s.value}</div>
                <div className="text-sm text-primary-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Where Do You Need to Go?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you're a facility administrator, health agency officer, or a patient — 
              AI-ESS EHR has a dedicated portal for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {portalCards.map((card) => (
              <div key={card.title} className="card-ehr p-8 flex flex-col hover:shadow-lg transition-shadow">
                <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}>
                  <card.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-3">{card.title}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{card.desc}</p>
                <Link to={card.link}>
                  <Button className="w-full bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent">
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
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Built for Nigeria's Health System
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every module is designed around the IDSR framework, Nigeria's disease priorities, 
              and the realities of Primary Health Care delivery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="card-ehr p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                A Nigeria Governors' Forum Initiative
              </h2>
              <p className="text-muted-foreground mb-6">
                AI-ESS EHR is part of the national strategy to strengthen disease surveillance 
                at the grassroots level. By digitizing health records at Primary Health Care facilities 
                and connecting them to state and national dashboards, we create an early warning system 
                that protects all Nigerians.
              </p>
              <div className="space-y-3">
                {[
                  'Syndromic surveillance at point of care',
                  'IDSR-compatible outbreak reporting',
                  'Works offline in rural areas',
                  'NIN-verified patient identity',
                  'Multi-facility patient records',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-sidebar rounded-xl p-8 text-center">
              <Activity className="h-20 w-20 text-accent mx-auto mb-6" />
              <h3 className="text-2xl font-heading font-bold text-sidebar-foreground mb-2">AI-ESS EHR</h3>
              <p className="text-sidebar-foreground/60 text-sm">
                National Health Surveillance System
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                <div className="bg-sidebar-accent/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent">5</div>
                  <div className="text-xs text-sidebar-foreground/70">Priority Diseases</div>
                </div>
                <div className="bg-sidebar-accent/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent">24/7</div>
                  <div className="text-xs text-sidebar-foreground/70">Alert Monitoring</div>
                </div>
                <div className="bg-sidebar-accent/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent">100%</div>
                  <div className="text-xs text-sidebar-foreground/70">Offline Ready</div>
                </div>
                <div className="bg-sidebar-accent/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent">IDSR</div>
                  <div className="text-xs text-sidebar-foreground/70">Compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar py-12 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-accent" />
                <span className="font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
              </div>
              <p className="text-sm text-sidebar-foreground/60">
                Nigeria Governors' Forum — National Health Surveillance System
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sidebar-foreground mb-3">For Facilities</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/60">
                <Link to="/register/facility" className="block hover:text-accent">Register Facility</Link>
                <Link to="/login" className="block hover:text-accent">Staff Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sidebar-foreground mb-3">For Agencies</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/60">
                <Link to="/login" className="block hover:text-accent">NCDC Dashboard</Link>
                <Link to="/login" className="block hover:text-accent">State Epidemiologist</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sidebar-foreground mb-3">For Patients</h4>
              <div className="space-y-2 text-sm text-sidebar-foreground/60">
                <Link to="/register/patient" className="block hover:text-accent">Access Records</Link>
                <Link to="/register/patient" className="block hover:text-accent">Book Appointment</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-sidebar-border mt-8 pt-8 text-center text-sm text-sidebar-foreground/40">
            © {new Date().getFullYear()} Lantid Creative LTD. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
