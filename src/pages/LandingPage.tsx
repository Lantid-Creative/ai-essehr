import { Link } from 'react-router-dom';
import {
  Activity, ArrowUpRight, ArrowRight, Menu, X, Stethoscope, Brain, Globe2,
  AlertTriangle, MessageSquare, Radio, ChevronRight, CheckCircle2, Star,
  Building2, Shield, Apple, Play, Quote, MapPin, Phone, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import heroHospital from '@/assets/landing-hero-hospital.jpg';
import chewPhoto from '@/assets/landing-chew.jpg';
import doctorPhoto from '@/assets/landing-doctor.jpg';
import aerialPhoto from '@/assets/landing-aerial.jpg';

const navLinks = [
  { label: 'Solutions', href: '/solutions' },
  { label: 'Features', href: '/features' },
  { label: 'Case Studies', href: '/case-studies/first-time-citizen' },
  { label: 'About', href: '/about' },
];

const heroChips = [
  { label: 'Live facilities', value: '3,142' },
  { label: 'Cases captured today', value: '8,470' },
  { label: 'Avg. alert latency', value: '< 24 hrs' },
];

const outbreaks = [
  { disease: 'Lassa Fever', status: '109 deaths · 469 confirmed · 18 states', severity: 'critical' },
  { disease: 'Cholera', status: '22,102 cases in 2025 · concurrent 2026 outbreak', severity: 'critical' },
  { disease: 'Meningitis', status: 'Active in Northern Belt — Jigawa, Yobe, Kano', severity: 'high' },
  { disease: 'Diphtheria', status: 'Highest burden in Africa · 30 states affected', severity: 'high' },
  { disease: 'Measles', status: '26,866 cases in 2025 · all 36 states + FCT', severity: 'high' },
];

const services = [
  {
    icon: Stethoscope,
    eyebrow: 'For facilities',
    title: 'Surveillance-Optimised EHR',
    desc: 'Every patient encounter captured digitally at point of care. Offline-first. Multilingual.',
    cta: 'Deploy at facility', href: '/solutions/ehr',
    tone: 'cream',
  },
  {
    icon: Brain,
    eyebrow: 'For epidemiologists',
    title: 'Sentinel AI Engine',
    desc: 'Reads English & Pidgin clinical notes. Syndromic clustering across facilities — 40% more signal.',
    cta: 'See how it works', href: '/solutions/sentinel-ai',
    tone: 'mint',
  },
  {
    icon: Globe2,
    eyebrow: 'For agencies',
    title: 'Validated Data Chain',
    desc: 'LGA validates → one-click push to SORMAS & DHIS2 simultaneously. State validates → NCDC receives.',
    cta: 'Open chain view', href: '/solutions/data-chain',
    tone: 'sand',
  },
  {
    icon: AlertTriangle,
    eyebrow: 'For citizens',
    title: 'Early Warning Alerts',
    desc: 'Autonomous alerts via WhatsApp & SMS when thresholds are crossed. No human escalation needed.',
    cta: 'Sign up for alerts', href: '/register/citizen',
    tone: 'sky',
  },
];

const modules = [
  { icon: Stethoscope, title: 'Module 1 — EHR', desc: 'Point-of-care capture with offline-first sync.' },
  { icon: Brain, title: 'Module 2 — AI Detection', desc: 'NLP across English & Pidgin clinical notes.' },
  { icon: Globe2, title: 'Module 3 — Data Chain', desc: 'Push to SORMAS & DHIS2 in one validated step.' },
  { icon: AlertTriangle, title: 'Module 4 — Early Warning', desc: 'Autonomous WhatsApp/SMS dispatch.' },
  { icon: MessageSquare, title: 'Module 5 — Community', desc: 'Citizens report unusual observations.' },
  { icon: Radio, title: 'Offline-First Core', desc: 'Full functionality without internet.' },
];

const partners = [
  { abbr: 'NGF', name: "Nigeria Governors' Forum", role: 'Lead Organisation' },
  { abbr: 'NCDC', name: 'NCDC', role: 'Surveillance Authority' },
  { abbr: 'FMOH', name: 'Federal Ministry of Health', role: 'Health Policy' },
  { abbr: 'NHED', name: 'NHED', role: 'Health Innovation' },
  { abbr: 'LCL', name: 'Lantid Creative Ltd', role: 'Technical Partner' },
];

const testimonials = [
  {
    quote: 'AI-PEWS turned 15 days of paper triage into the same-day notification. We see clusters before they spread.',
    name: 'Dr. Adaeze Okafor',
    role: 'State Epidemiologist',
    img: doctorPhoto,
  },
  {
    quote: 'For the first time, the data I record at my PHC actually reaches Abuja the same week. It feels real.',
    name: 'Mariam Bello',
    role: 'CHEW · Borno State',
    img: chewPhoto,
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream font-body text-ink">
      {/* HERO with editorial photo */}
      <section className="relative px-3 sm:px-4 lg:px-6 pt-3">
        <div className="relative rounded-[28px] overflow-hidden min-h-[680px] md:min-h-[760px] lg:min-h-[820px]">
          <img
            src={heroHospital}
            alt="Modern Nigerian teaching hospital exterior at golden hour"
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          {/* tonal overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />

          {/* Top nav */}
          <nav className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-10 pt-5">
            <Link to="/" className="flex items-center gap-2 glass-chip px-4 h-11">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-ink tracking-tight">AI-PEWS</span>
              <span className="text-[10px] text-editorial-muted font-medium">NIGERIA</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1 glass-chip px-2 h-11">
              {navLinks.map((l) => (
                <Link key={l.href} to={l.href} className="px-4 h-9 rounded-full inline-flex items-center text-sm text-ink-soft hover:bg-ink hover:text-[hsl(var(--cream))] transition">
                  {l.label}
                </Link>
              ))}
              <Link to="/community-report" className="px-4 h-9 rounded-full inline-flex items-center text-sm text-ink-soft hover:bg-ink hover:text-[hsl(var(--cream))] transition">
                Report Outbreak
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="pill-light">Staff Login</Link>
              <Link to="/register/facility" className="pill-dark">
                Register Facility <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              className="md:hidden glass-chip h-11 w-11 inline-flex items-center justify-center text-ink"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-4 right-4 z-30 glass-chip p-4 space-y-2">
              {navLinks.map((l) => (
                <Link key={l.href} to={l.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-ink-soft hover:bg-ink hover:text-[hsl(var(--cream))]">{l.label}</Link>
              ))}
              <Link to="/community-report" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-ink-soft hover:bg-ink hover:text-[hsl(var(--cream))]">Report Outbreak</Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link to="/login" className="pill-light justify-center">Staff Login</Link>
                <Link to="/register/facility" className="pill-dark justify-center">Register</Link>
              </div>
            </div>
          )}

          {/* Hero copy */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-16 md:pt-24 pb-32 md:pb-40">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 glass-chip px-4 h-8 text-xs font-medium text-ink mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                </span>
                5 active outbreaks across Nigeria · 2026
              </div>
              <h1 className="editorial-display text-white text-[44px] sm:text-6xl md:text-7xl lg:text-[88px] mb-6">
                Discover Outbreaks,<br />
                Coordinate Response,<br />
                <span className="italic font-light text-white/85">Before They Spread.</span>
              </h1>
              <p className="text-white/85 text-base md:text-lg max-w-xl leading-relaxed mb-8">
                AI-PEWS Nigeria collapses the 717 surveillance timeline — digitising recording at the point of care
                and automating reporting through a validated chain to <strong className="text-white">SORMAS</strong> and <strong className="text-white">DHIS2</strong>.
              </p>

              {/* Find action — search-bar style like Shot 1 */}
              <div className="glass-chip flex items-center gap-2 p-2 max-w-xl">
                <div className="flex items-center gap-2 px-4 flex-1">
                  <MapPin className="h-4 w-4 text-editorial-muted" />
                  <input
                    type="text"
                    placeholder="Find a facility, LGA, or outbreak…"
                    className="bg-transparent outline-none text-sm text-ink placeholder:text-editorial-muted flex-1 h-11"
                  />
                </div>
                <Link to="/register/facility" className="pill-dark whitespace-nowrap">
                  Get Started <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="text-white/60 text-xs mt-5">
                Led by the Nigeria Governors' Forum · Built by Lantid Creative Ltd · Endorsed by NCDC
              </p>
            </div>
          </div>

          {/* Floating chips: bottom-right cluster */}
          <div className="hidden md:flex absolute right-6 lg:right-10 bottom-24 z-10 flex-col gap-3 w-[260px]">
            {heroChips.map((c) => (
              <div key={c.label} className="glass-chip px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-editorial-muted">{c.label}</span>
                <span className="font-heading font-bold text-ink">{c.value}</span>
              </div>
            ))}
            <div className="glass-chip px-4 py-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-primary border-2 border-white" />
                <div className="w-7 h-7 rounded-full bg-[hsl(28,80%,52%)] border-2 border-white" />
                <div className="w-7 h-7 rounded-full bg-ink border-2 border-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-ink leading-tight">25K+ health workers</div>
                <div className="text-[10px] text-editorial-muted">trust AI-PEWS daily</div>
              </div>
            </div>
          </div>

          {/* Bottom-left download/agency pills like Shot 1 */}
          <div className="absolute left-4 sm:left-6 md:left-10 bottom-6 z-10 flex flex-wrap gap-2">
            <a href="#" className="glass-chip px-4 h-10 inline-flex items-center gap-2 text-xs text-ink">
              <Apple className="h-4 w-4" /> iOS
            </a>
            <a href="#" className="glass-chip px-4 h-10 inline-flex items-center gap-2 text-xs text-ink">
              <Play className="h-4 w-4" /> Android
            </a>
            <a href="#solution" className="glass-chip px-4 h-10 inline-flex items-center gap-2 text-xs text-ink">
              How it works <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Trusted-by partner strip */}
      <section className="bg-cream py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Trusted & endorsed by</span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {partners.map((p) => (
              <div key={p.abbr} className="bg-white/70 border border-black/5 rounded-2xl px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink text-[hsl(var(--cream))] grid place-items-center font-heading font-bold text-xs">{p.abbr}</div>
                <div className="min-w-0">
                  <div className="text-sm font-heading font-bold text-ink truncate">{p.name}</div>
                  <div className="text-[11px] text-editorial-muted">{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial intro band */}
      <section id="solution" className="bg-cream py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Let's get to know us</span>
              <h2 className="editorial-display text-ink text-4xl md:text-6xl mt-3">
                Explore options.<br />
                <span className="italic font-light">Your health, our priority.</span>
              </h2>
            </div>
            <p className="text-ink-soft md:max-w-md leading-relaxed">
              AI-PEWS is a unified surveillance and clinical platform connecting frontline facilities, validating
              authorities, and the public — built for Nigeria, ready for the next outbreak.
            </p>
          </div>

          {/* Service tiles like Shot 2 — pastel surfaces */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => {
              const tones: Record<string, string> = {
                cream: 'bg-[hsl(38,38%,92%)]',
                mint: 'bg-[hsl(153,40%,88%)]',
                sand: 'bg-[hsl(28,45%,90%)]',
                sky: 'bg-[hsl(200,40%,90%)]',
              };
              return (
                <div key={s.title} className={`${tones[s.tone]} rounded-3xl p-6 flex flex-col min-h-[260px] hover:-translate-y-1 transition-transform`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-ink-soft font-semibold">{s.eyebrow}</span>
                  </div>
                  <h3 className="font-heading font-bold text-ink text-xl mb-2 leading-tight">{s.title}</h3>
                  <p className="text-sm text-ink-soft flex-1 leading-relaxed">{s.desc}</p>
                  <Link to={s.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink group">
                    {s.cta}
                    <span className="w-7 h-7 rounded-full bg-ink text-[hsl(var(--cream))] grid place-items-center group-hover:translate-x-0.5 transition">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Crisis — outbreak ticker on dark band */}
      <section id="crisis" className="bg-ink text-[hsl(var(--cream))] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/50">The 2026 Crisis</span>
              <h2 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-5xl mt-3 mb-6">
                Five concurrent outbreaks.<br />
                <span className="italic font-light">One broken system.</span>
              </h2>
              <p className="text-[hsl(var(--cream))]/70 leading-relaxed mb-8 max-w-lg">
                The NCDC has confirmed: state ownership remains a major challenge and cases are not being properly traced.
                AI-PEWS fixes the gap between recording and reporting.
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-heading font-bold text-destructive">7</div>
                  <div className="text-[10px] text-[hsl(var(--cream))]/60 mt-1">days lab</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-heading font-bold text-warning">1</div>
                  <div className="text-[10px] text-[hsl(var(--cream))]/60 mt-1">day notify</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-heading font-bold text-destructive">7</div>
                  <div className="text-[10px] text-[hsl(var(--cream))]/60 mt-1">days respond</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-[hsl(var(--cream))]/60">
                Total: <span className="text-destructive font-semibold">15+ days</span> · AI-PEWS target: <span className="text-primary font-semibold">&lt; 24 hrs</span>
              </div>
            </div>

            <div className="space-y-3">
              {outbreaks.map((o) => (
                <div key={o.disease} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${o.severity === 'critical' ? 'bg-destructive animate-pulse' : 'bg-warning'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-heading font-bold text-[hsl(var(--cream))]">{o.disease}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.severity === 'critical' ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'}`}>
                        {o.severity}
                      </span>
                    </div>
                    <p className="text-sm text-[hsl(var(--cream))]/65 mt-0.5">{o.status}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[hsl(var(--cream))]/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules grid — light editorial */}
      <section className="bg-cream-deep py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">The Solution</span>
            <h2 className="editorial-display text-ink text-4xl md:text-6xl mt-3">
              Five modules.<br />
              <span className="italic font-light">One integrated system.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m) => (
              <div key={m.title} className="bg-white rounded-3xl p-7 border border-black/5 hover:shadow-xl transition group">
                <div className="w-12 h-12 rounded-2xl bg-cream grid place-items-center mb-5 group-hover:bg-ink group-hover:text-[hsl(var(--cream))] transition">
                  <m.icon className="h-5 w-5 text-ink group-hover:text-[hsl(var(--cream))]" />
                </div>
                <h3 className="font-heading font-bold text-ink text-lg mb-2">{m.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/features" className="pill-dark">See all features <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Editorial split — frontline image + AI explainer */}
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[420px]">
              <img src={chewPhoto} alt="Community health worker at PHC" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 glass-chip p-4">
                <div className="flex items-center gap-3">
                  <Quote className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm text-ink leading-snug">
                    “Pikin dey breathe hard, neck stiff, fever since yesterday.”
                  </p>
                </div>
                <div className="mt-2 text-xs text-editorial-muted pl-8">→ AI matches: Meningitis criteria</div>
              </div>
            </div>
            <div className="lg:col-span-7 bg-ink text-[hsl(var(--cream))] rounded-3xl p-8 md:p-12">
              <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/50">Sentinel AI</span>
              <h3 className="editorial-display text-4xl md:text-5xl mt-3 mb-6">
                Reading Nigerian<br />
                <span className="italic font-light">clinical language.</span>
              </h3>
              <p className="text-[hsl(var(--cream))]/70 leading-relaxed mb-8 max-w-lg">
                Health workers document in a mix of English, Pidgin, and local language. The AI-PEWS model extracts
                syndromic signals from this free text — adding ~40% more surveillance signal than structured fields alone.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Calculates outbreak risk score automatically',
                  'Determines geographic boundary of cluster',
                  'Drafts situation summary with case counts',
                  'Dispatches alerts via WhatsApp & SMS',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-[hsl(var(--cream))]/85">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — large editorial cards */}
      <section className="bg-cream-deep py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Voices from the field</span>
              <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">
                Built with the people<br />
                <span className="italic font-light">who use it daily.</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-ink">
              <div className="flex">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <span className="text-sm font-semibold">4.8 / 5 · 1,200+ health workers</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <article key={t.name} className="bg-white rounded-3xl p-8 md:p-10 border border-black/5 flex flex-col">
                <Quote className="h-8 w-8 text-primary mb-6" />
                <p className="text-xl md:text-2xl text-ink leading-snug font-heading font-medium mb-8">
                  “{t.quote}”
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <img src={t.img} alt={t.name} loading="lazy" className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <div className="font-heading font-bold text-ink">{t.name}</div>
                    <div className="text-sm text-editorial-muted">{t.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage — aerial photo with overlaid stats */}
      <section id="impact" className="bg-cream py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="relative rounded-3xl overflow-hidden min-h-[460px]">
            <img src={aerialPhoto} alt="Aerial of Nigerian community" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/40" />
            <div className="relative z-10 p-8 md:p-14 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/60">Measurable impact</span>
                <h2 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-5xl mt-3 mb-5">
                  From 200M people<br />
                  <span className="italic font-light">to one shared signal.</span>
                </h2>
                <p className="text-[hsl(var(--cream))]/75 max-w-md leading-relaxed mb-6">
                  Every facility, every LGA, every state — connected to a validated chain that pushes signals to SORMAS and DHIS2 in hours, not weeks.
                </p>
                <Link to="/register/facility" className="pill-light">
                  Join the network <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: '15+ → <1', l: 'Days to alert' },
                  { v: '85%+', l: 'Live EHR target' },
                  { v: '90%+', l: 'LGA validation' },
                  { v: '2,000+', l: 'Workers trained' },
                ].map((s) => (
                  <div key={s.l} className="glass-chip p-5">
                    <div className="text-3xl font-heading font-bold text-ink">{s.v}</div>
                    <div className="text-xs text-editorial-muted mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals — get started */}
      <section id="partners" className="bg-cream-deep py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Get started</span>
            <h2 className="editorial-display text-ink text-4xl md:text-5xl mt-3">
              Three doors.<br />
              <span className="italic font-light">One mission.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: 'Health Facility', desc: 'Register your PHC, deploy the EHR, contribute to the national early warning network.', href: '/register/facility', cta: 'Register Facility' },
              { icon: Shield, title: 'Health Agency', desc: 'Epidemiologists, DSNOs, NCDC officers — access real-time dashboards and alerts.', href: '/login', cta: 'Agency Login' },
              { icon: MessageSquare, title: 'Community Reporter', desc: 'Report unusual health observations in your community to strengthen the network.', href: '/community-report', cta: 'Report Now' },
            ].map((p) => (
              <div key={p.title} className="bg-white rounded-3xl p-8 border border-black/5 flex flex-col hover:-translate-y-1 transition">
                <div className="w-12 h-12 rounded-2xl bg-ink text-[hsl(var(--cream))] grid place-items-center mb-6">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-ink text-xl mb-3">{p.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed flex-1 mb-6">{p.desc}</p>
                <Link to={p.href} className="pill-dark justify-center">
                  {p.cta} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Citizen CTA */}
      <section className="bg-cream py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="rounded-3xl bg-[hsl(153,40%,88%)] p-8 md:p-12 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">For every Nigerian</span>
              <h3 className="editorial-display text-ink text-3xl md:text-4xl mt-2 mb-2">Get protected. <span className="italic font-light">In 30 seconds.</span></h3>
              <p className="text-ink-soft max-w-xl">Sign up with your phone number and LGA. Receive WhatsApp & SMS outbreak alerts. Free. Always.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register/citizen" className="pill-dark">Create citizen account <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/login" className="pill-light">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-cream pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="rounded-3xl bg-ink text-[hsl(var(--cream))] p-10 md:p-16 text-center">
            <h2 className="editorial-display text-4xl md:text-6xl mb-5">
              Nigeria's early warning system<br />
              <span className="italic font-light">starts here.</span>
            </h2>
            <p className="text-[hsl(var(--cream))]/70 max-w-2xl mx-auto mb-8">
              The EHR is built. The AI model is architected. The political authority — through the NGF — exists.
              What this funds is taking a working system national.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register/facility" className="pill-light">
                Deploy AI-PEWS <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15 transition">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid md:grid-cols-4 gap-10 pt-10 border-t border-ink/10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary grid place-items-center">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-ink">AI-PEWS Nigeria</span>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed mb-3">
                AI-Powered Early Warning System. Built on a unified EHR infrastructure.
              </p>
              <p className="text-xs text-editorial-muted">Technical Partner: Lantid Creative LTD</p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-ink mb-4 text-xs uppercase tracking-[0.2em]">Facilities</h4>
              <div className="space-y-2.5 text-sm text-ink-soft">
                <Link to="/register/facility" className="block hover:text-ink">Register Facility</Link>
                <Link to="/login" className="block hover:text-ink">Staff Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-ink mb-4 text-xs uppercase tracking-[0.2em]">Agencies</h4>
              <div className="space-y-2.5 text-sm text-ink-soft">
                <Link to="/login" className="block hover:text-ink">NCDC Dashboard</Link>
                <Link to="/login" className="block hover:text-ink">State Epidemiologist</Link>
                <Link to="/login" className="block hover:text-ink">LGA DSNO</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-ink mb-4 text-xs uppercase tracking-[0.2em]">Community</h4>
              <div className="space-y-2.5 text-sm text-ink-soft">
                <Link to="/community-report" className="block hover:text-ink">Report an Outbreak</Link>
                <Link to="/faq" className="block hover:text-ink">FAQs</Link>
                <Link to="/help" className="block hover:text-ink">Help Center</Link>
              </div>
              <div className="mt-5 space-y-2 text-xs text-editorial-muted">
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> NCDC: 6232</div>
                <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> info@ai-pews.ng</div>
              </div>
            </div>
          </div>
          <div className="border-t border-ink/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-editorial-muted">
            <span>© {new Date().getFullYear()} Nigeria Governors' Forum · Technical Partner: Lantid Creative LTD</span>
            <div className="flex gap-6 mt-3 sm:mt-0">
              <Link to="/legal/privacy" className="hover:text-ink">Privacy Policy</Link>
              <Link to="/legal/terms" className="hover:text-ink">Terms of Service</Link>
              <Link to="/legal/security" className="hover:text-ink">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
