import { ReactNode, useEffect } from 'react';
import PublicNav from './PublicNav';
import PublicFooter from './PublicFooter';

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function PageShell({ title, description, children }: PageShellProps) {
  useEffect(() => {
    document.title = `${title} · Integra+ Nigeria`;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description.slice(0, 160));
    }
    window.scrollTo(0, 0);
  }, [title, description]);

  return (
    <div className="min-h-screen bg-cream font-body text-ink">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 pt-3">
        <PublicNav />
      </div>
      {children}
      <PublicFooter />
    </div>
  );
}
