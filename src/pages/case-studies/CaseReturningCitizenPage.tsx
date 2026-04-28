import { Link } from 'react-router-dom';
import { ArrowUpRight, Quote, Bell, Send, Heart, Shield } from 'lucide-react';
import PageShell from '@/components/public/PageShell';
import heroImg from '@/assets/case-returning.jpg';

export default function CaseReturningCitizenPage() {
  return (
    <PageShell title="Returning Citizen — Case Study" description="How a returning citizen uses AI-PEWS as a daily tool — managing alerts, contributing reports, and protecting their community.">
      <section className="px-3 sm:px-5 lg:px-6 mt-4">
        <div className="relative rounded-[28px] overflow-hidden min-h-[460px] md:min-h-[540px]">
          <img src={heroImg} alt="Returning citizen using AI-PEWS" className="absolute inset-0 w-full h-full object-cover" width={1280} height={832} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
          <div className="relative z-10 p-8 md:p-14 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--cream))]/70">Case Study · 02</span>
            <h1 className="editorial-display text-[hsl(var(--cream))] text-4xl md:text-6xl mt-4 mb-5">
              Aisha, six months<br /><span className="italic font-light">later.</span>
            </h1>
            <p className="text-[hsl(var(--cream))]/80 text-base md:text-lg max-w-xl leading-relaxed">
              What it looks like to use AI-PEWS as a daily companion — not just a notification service, but a
              two-way channel between Nigerian households and the national surveillance network.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 prose prose-lg">
          <p className="text-xl text-ink-soft leading-relaxed font-medium mb-8">
            Six months after her first alert, Aisha is no longer a passive recipient of AI-PEWS messages. She has
            become a node in the national early-warning network — submitting reports, sharing alerts with her
            neighbours, and using the citizen dashboard to track what's happening in her LGA.
          </p>

          <div className="bg-white rounded-3xl p-8 border border-black/5 my-10">
            <Quote className="h-8 w-8 text-primary mb-4" />
            <p className="font-heading text-2xl md:text-3xl text-ink leading-snug italic mb-4">
              "Now I am the one telling my friends to sign up. I have submitted seven reports myself. Two of them
              became confirmed clusters. I feel useful."
            </p>
            <div className="text-sm text-editorial-muted">— Aisha Mohammed, six months later</div>
          </div>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">Her dashboard</h2>
          <p className="text-ink-soft leading-relaxed">
            When Aisha signs in to ai-pews.ng now, she sees a citizen dashboard that shows: active alerts in her
            LGA, the status of every report she has submitted, the nearest treatment centre, her alert history,
            and a quick "Report something" button.
          </p>

          <div className="not-prose grid sm:grid-cols-2 gap-4 my-10">
            {[
              { icon: Bell, t: 'Active LGA alerts', d: 'Real-time list of validated outbreaks in her LGA — and one tap away, the LGAs of family members in other states.' },
              { icon: Send, t: 'My reports', d: 'Every observation she has submitted, with the LGA review status (pending → validated → cluster confirmed).' },
              { icon: Heart, t: 'Health resources', d: 'Nearest PHC, ambulance dispatch number, NCDC toll-free line — always visible, always one tap away.' },
              { icon: Shield, t: 'Privacy controls', d: 'Update alert preferences, change LGA, pause notifications, or delete account in two taps.' },
            ].map((c) => (
              <div key={c.t} className="bg-cream-deep rounded-2xl p-6">
                <c.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-heading font-bold text-ink text-base mb-1.5">{c.t}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">A typical week</h2>
          <ul className="text-ink-soft leading-relaxed space-y-3 list-disc pl-5">
            <li><b>Monday:</b> Receives a routine immunisation reminder for her youngest child — pulled from the connected facility's appointment system.</li>
            <li><b>Wednesday:</b> Notices a stall neighbour with measles-like rash. Submits a 30-second community report with location and symptoms.</li>
            <li><b>Thursday:</b> Receives a confirmation that her report is being reviewed by the Bama LGA DSNO. Gets follow-up that 4 similar reports came in from the same area.</li>
            <li><b>Friday:</b> Validated alert dispatched to the LGA: suspected measles cluster. Aisha forwards it to her family WhatsApp group.</li>
          </ul>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">From recipient to reporter</h2>
          <p className="text-ink-soft leading-relaxed">
            The citizen role in AI-PEWS evolves naturally. The platform never demands more than the user is willing
            to give. But for those who want to do more, every additional layer of engagement — from receiving alerts,
            to submitting reports, to verifying alerts on the ground — strengthens the national network.
          </p>

          <h2 className="font-heading font-bold text-ink text-3xl mt-12 mb-4">What this case shows</h2>
          <ul className="text-ink-soft leading-relaxed space-y-3 list-disc pl-5">
            <li>Returning users need a real dashboard — not a marketing page — when they sign in.</li>
            <li>Citizen reports must close the loop: every submission gets visible status updates.</li>
            <li>The same account works for receiving alerts and submitting reports — no duplicate sign-ups.</li>
            <li>Citizens become amplifiers. One trusted user reaches dozens of friends and family.</li>
          </ul>

          <div className="not-prose mt-14 bg-ink text-[hsl(var(--cream))] rounded-3xl p-8 md:p-10 text-center">
            <h3 className="editorial-display text-2xl md:text-4xl mb-3">Build your own daily rhythm.</h3>
            <p className="text-[hsl(var(--cream))]/70 mb-6">Sign in, contribute, protect your community.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/login" className="pill-light">Sign in <ArrowUpRight className="h-4 w-4" /></Link>
              <Link to="/register/citizen" className="inline-flex items-center gap-2 rounded-full bg-white/10 text-[hsl(var(--cream))] px-5 h-11 text-sm font-medium hover:bg-white/15">Create citizen account</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
