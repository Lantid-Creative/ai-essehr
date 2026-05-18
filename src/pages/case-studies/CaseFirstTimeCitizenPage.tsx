import { Link } from 'react-router-dom';
import { ArrowUpRight, Quote, Heart, Bell, MapPin, MessageSquare } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import heroImg from '@/assets/case-citizen.jpg';

export default function CaseFirstTimeCitizenPage() {
  return (
    <PageShell title="First-Time Citizen — Case Study" description="What a first-time citizen experiences from learning about Integra+ to receiving their first life-saving alert.">
      <section className="px-3 sm:px-5 lg:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden min-h-[460px] md:min-h-[540px]">
          <img src={heroImg} alt="Family receiving an alert" className="absolute inset-0 w-full h-full object-cover" width={1280} height={832} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/40" />
          <div className="relative z-10 p-8 md:p-14 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/70">Case Study · 01</span>
            <h1 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-6xl mt-4 mb-5">
              Aisha's first<br /><span className="italic font-light">cholera alert.</span>
            </h1>
            <p className="text-[hsl(var(--cream))]/80 text-base md:text-lg max-w-xl leading-relaxed">
              How a market trader in Bama discovered Integra+ for the first time — and why she now believes
              every Nigerian household should have it.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 prose prose-lg">
          <p className="text-xl text-ink-soft leading-relaxed font-medium mb-8">
            Aisha Mohammed runs a small fabric stall in Bama, Borno State. She has three children under ten.
            In June 2026, she heard about Integra+ from a friend at a community meeting — a free system that
            would send her a WhatsApp message if a disease outbreak was detected near her home.
          </p>

          <div className="bg-white rounded-3xl p-8 border border-black/5 my-10">
            <Quote className="h-8 w-8 text-primary mb-4" />
            <p className="font-heading text-2xl md:text-3xl text-ink leading-snug italic mb-4">
              "I just put my phone number and my LGA. That's all. No fees, no long form. Less than one minute."
            </p>
            <div className="text-sm text-editorial-muted">— Aisha Mohammed, Bama LGA</div>
          </div>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">Step 1 — She signed up</h2>
          <p className="text-ink-soft leading-relaxed">
            Aisha visited ai-pews.ng on her Tecno phone. The citizen sign-up was three fields: full name, phone
            number, and LGA. She received an OTP, confirmed her number, and that was it. No fees. No personal
            health details. No medical jargon.
          </p>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">Step 2 — Three weeks of silence</h2>
          <p className="text-ink-soft leading-relaxed">
            For 22 days, Aisha forgot she had even signed up. There were no test messages, no marketing, no
            unnecessary alerts. Integra+ only contacts citizens when there is something they genuinely need to
            know — a discipline that earns the trust required for the alert that matters.
          </p>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">Step 3 — The alert arrived</h2>
          <p className="text-ink-soft leading-relaxed mb-6">
            On a Tuesday afternoon, her phone buzzed. A WhatsApp message from "Integra+ Borno":
          </p>

          <div className="bg-[#075e54] rounded-3xl p-3 my-8 max-w-lg">
            <div className="bg-[#dcf8c6] rounded-2xl p-5 text-sm text-ink leading-relaxed font-mono whitespace-pre-line">
{`🚨 Integra+ Health Alert
Bama LGA · Borno State

Cluster of acute watery diarrhoea reported across 3 facilities in the past 24 hours.

What this means for you:
• Drink only treated or boiled water
• Wash hands with soap before eating
• If you or anyone shows symptoms, go to the nearest health facility immediately

Nearest treatment centre: Bama PHC
NCDC line: 6232`}
              <div className="text-[10px] text-ink/50 text-right mt-3">14:02 ✓✓</div>
            </div>
          </div>

          <p className="text-ink-soft leading-relaxed">
            Three minutes later, Aisha boiled the household water. She told her stall neighbours. She kept her
            youngest at home from the riverside that evening.
          </p>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">Step 4 — She became a reporter</h2>
          <p className="text-ink-soft leading-relaxed">
            Two days later, Aisha noticed two children at the next stall showing similar symptoms. She tapped
            the link in the original alert, which opened the Community Report form. She submitted what she saw —
            no medical training required. Her report was added to the LGA-level cluster tracking, contributing
            to the next round of validated alerts.
          </p>

          <div className="grid grid-cols-3 gap-4 my-12">
            {[
              { icon: Bell, v: '< 60 sec', l: 'Sign-up time' },
              { icon: MessageSquare, v: '22 days', l: 'Until first alert' },
              { icon: Heart, v: '0', l: 'Spam messages' },
            ].map((s) => (
              <div key={s.l} className="bg-cream-deep rounded-2xl p-5 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-3" />
                <div className="font-heading font-bold text-ink text-2xl">{s.v}</div>
                <div className="text-xs text-editorial-muted">{s.l}</div>
              </div>
            ))}
          </div>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">What this case shows</h2>
          <ul className="text-ink-soft leading-relaxed space-y-3 list-disc pl-5">
            <li>Citizen sign-up has to be radically simple. Three fields, one minute, no fees.</li>
            <li>Trust is built through restraint. Integra+ does not message citizens unless it matters.</li>
            <li>Every alert is local, actionable, and ends with a clear next step.</li>
            <li>Citizens become reporters, closing the loop between detection and surveillance.</li>
          </ul>

          <div className="not-prose mt-14 bg-ink text-[hsl(var(--cream))] rounded-3xl p-8 md:p-10 text-center">
            <h3 className="editorial-display text-2xl md:text-4xl mb-3">Be the next Aisha.</h3>
            <p className="text-[hsl(var(--cream))]/70 mb-6">Free citizen sign-up. WhatsApp & SMS alerts for your LGA.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register/citizen" className="pill-light">Sign up for alerts <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/case-studies/returning-citizen" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15">Read the next case →</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
