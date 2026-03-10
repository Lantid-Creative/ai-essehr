import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import type { UserRole } from '@/data/mockData';

const roles: UserRole[] = ['CHEW', 'Nurse', 'Doctor', 'Data Entry Clerk', 'Facility Admin', 'State Epidemiologist', 'NCDC Officer'];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentRole } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CHEW');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setCurrentRole(role);
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-sidebar">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <Activity className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-4xl font-heading font-bold text-sidebar-foreground mb-4">AI-ESS EHR</h1>
          <p className="text-sidebar-foreground/60 text-lg mb-8">
            Nigeria Governors' Forum — National Health Surveillance System
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {['Surveillance', 'Offline-Ready', 'IDSR Reports', 'Multi-Facility'].map((t) => (
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
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@facility.gov.ng" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="role">Sign in as</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/register/facility" className="text-primary hover:underline">Register your facility</Link>
            {' · '}
            <Link to="/register/patient" className="text-primary hover:underline">Patient portal</Link>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
