import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const primaryLinks = [
  { label: 'Solutions', href: '/solutions' },
  { label: 'Features', href: '/features' },
  { label: 'Case Studies', href: '/case-studies/first-time-citizen' },
  { label: 'About', href: '/about' },
];

interface PublicNavProps {
  variant?: 'glass' | 'solid';
}

export default function PublicNav({ variant = 'solid' }: PublicNavProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const wrapperClass = variant === 'glass'
    ? 'glass-chip'
    : 'bg-white/95 backdrop-blur border border-black/5 shadow-sm rounded-2xl';

  return (
    <>
      <nav className={`relative z-30 flex items-center justify-between px-3 sm:px-5 ${wrapperClass} h-14`}>
        <Link to="/" className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-ink tracking-tight text-sm sm:text-base">AI-PEWS</span>
          <span className="hidden sm:inline text-[10px] text-editorial-muted font-medium">NIGERIA</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {primaryLinks.map((l) => {
            const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                to={l.href}
                className={`px-4 h-9 rounded-full inline-flex items-center text-sm transition ${
                  active ? 'bg-ink text-[hsl(var(--cream))]' : 'text-ink-soft hover:bg-ink/5'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link to="/community-report" className="px-4 h-9 rounded-full inline-flex items-center text-sm text-ink-soft hover:bg-ink/5">
            Report Outbreak
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="pill-light">Sign In</Link>
          <Link to="/register/facility" className="pill-dark">
            Get Started <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          className="lg:hidden md:hidden h-10 w-10 inline-flex items-center justify-center text-ink rounded-full hover:bg-ink/5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <button
          className="hidden md:inline-flex lg:hidden h-10 w-10 items-center justify-center text-ink rounded-full hover:bg-ink/5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden mt-2 glass-chip p-4 space-y-1 z-30 relative">
          {primaryLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-xl text-ink-soft hover:bg-ink hover:text-[hsl(var(--cream))]"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/community-report" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-ink-soft hover:bg-ink hover:text-[hsl(var(--cream))]">
            Report Outbreak
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link to="/login" onClick={() => setOpen(false)} className="pill-light justify-center">Sign In</Link>
            <Link to="/register/facility" onClick={() => setOpen(false)} className="pill-dark justify-center">Register</Link>
          </div>
        </div>
      )}
    </>
  );
}
