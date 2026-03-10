import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPatientPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Account Created!', description: 'You can now log in to access your health records.' });
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-sidebar border-b border-sidebar-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-3">
          <Activity className="h-6 w-6 text-accent" />
          <span className="font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
          <span className="text-sidebar-foreground/40 text-sm ml-auto">
            <Link to="/" className="hover:text-accent flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-success w-12 h-12 rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-success-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Patient Portal</h1>
            <p className="text-muted-foreground text-sm">Access your health records and book appointments</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-ehr p-8 space-y-5">
          <div>
            <Label>NIN (National Identification Number) *</Label>
            <Input placeholder="11-digit NIN" maxLength={11} className="mt-1.5" required />
            <p className="text-xs text-muted-foreground mt-1">Your NIN will be used to verify your identity and link your records</p>
          </div>
          <div>
            <Label>Full Name *</Label>
            <Input placeholder="As on your NIN" className="mt-1.5" required />
          </div>
          <div>
            <Label>Phone Number *</Label>
            <Input type="tel" placeholder="+234 800 000 0000" className="mt-1.5" required />
          </div>
          <div>
            <Label>Email (optional)</Label>
            <Input type="email" placeholder="your@email.com" className="mt-1.5" />
          </div>
          <div>
            <Label>Create Password *</Label>
            <Input type="password" placeholder="Min 8 characters" className="mt-1.5" required minLength={8} />
          </div>

          <Button type="submit" className="w-full bg-success text-success-foreground hover:bg-success/90 h-11 font-semibold" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Patient Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
