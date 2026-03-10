import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-sidebar">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <Activity className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-heading font-bold text-sidebar-foreground mb-4">AI-ESS EHR</h1>
          <p className="text-sidebar-foreground/60 text-lg mb-8">
            Surveillance-First Electronic Health Records Platform
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {['Real-Time Surveillance', 'Offline-Ready', 'Multi-Facility', 'AI-Powered Alerts'].map((t) => (
              <div key={t} className="bg-sidebar-accent/50 rounded-lg p-4">
                <span className="text-sm font-medium text-sidebar-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card rounded-xl p-8 shadow-lg">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-heading font-bold text-foreground">AI-ESS EHR</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@facility.com" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</> : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register/facility" className="text-primary hover:underline font-medium">Register your facility</Link>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
