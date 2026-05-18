import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Brand } from '@/components/Brand';

export default function PublicFooter() {
  return (
    <footer className="bg-cream pt-6 pb-12 border-t border-ink/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 pt-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brand size="md" />
            </div>
            <p className="text-sm text-ink-soft leading-relaxed mb-4 max-w-sm">
              Nigeria's AI-Powered Early Warning System for disease surveillance — built on a
              unified, offline-first electronic health record connecting frontline facilities to
              national agencies.
            </p>
            <div className="space-y-2 text-xs text-editorial-muted">
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> NCDC: 6232 (toll-free)</div>
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> info@ai-pews.ng</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Abuja, Federal Capital Territory</div>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-ink mb-4 text-xs uppercase tracking-[0.2em]">Solutions</h4>
            <div className="space-y-2.5 text-sm text-ink-soft">
              <Link to="/solutions/ehr" className="block hover:text-ink">Surveillance EHR</Link>
              <Link to="/solutions/sentinel-ai" className="block hover:text-ink">Sentinel AI Engine</Link>
              <Link to="/solutions/data-chain" className="block hover:text-ink">Validated Data Chain</Link>
              <Link to="/solutions/early-warnings" className="block hover:text-ink">Early Warning Alerts</Link>
              <Link to="/features" className="block hover:text-ink">All Features</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-ink mb-4 text-xs uppercase tracking-[0.2em]">Get Started</h4>
            <div className="space-y-2.5 text-sm text-ink-soft">
              <Link to="/register/facility" className="block hover:text-ink">Register Facility</Link>
              <Link to="/login" className="block hover:text-ink">Staff Sign In</Link>
              <Link to="/register/citizen" className="block hover:text-ink">Citizen Sign Up</Link>
              <Link to="/community-report" className="block hover:text-ink">Report an Outbreak</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-ink mb-4 text-xs uppercase tracking-[0.2em]">Company</h4>
            <div className="space-y-2.5 text-sm text-ink-soft">
              <Link to="/about" className="block hover:text-ink">About</Link>
              <Link to="/case-studies/first-time-citizen" className="block hover:text-ink">Case Studies</Link>
              <Link to="/contact" className="block hover:text-ink">Contact</Link>
              <Link to="/help" className="block hover:text-ink">Help Center</Link>
              <Link to="/faq" className="block hover:text-ink">FAQs</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted">
          <span>© {new Date().getFullYear()} Lantid Creative LTD · In partnership with the Nigeria Governors' Forum</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link to="/legal/privacy" className="hover:text-ink">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-ink">Terms of Service</Link>
            <Link to="/legal/security" className="hover:text-ink">Security & Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
