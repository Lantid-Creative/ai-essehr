import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const facilityTypes = [
  { value: 'primary', label: 'Primary Health Care' },
  { value: 'secondary', label: 'General Hospital' },
  { value: 'tertiary', label: 'Teaching Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'hospital', label: 'Hospital' },
];

export default function RegisterFacilityPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [facilityPhone, setFacilityPhone] = useState('');
  const [facilityEmail, setFacilityEmail] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: adminName },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // 2. Create the facility
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .insert({
          name: facilityName,
          facility_type: facilityType as any,
          region,
          district,
          address,
          phone: facilityPhone,
          email: facilityEmail,
          status: 'active' as any,
        })
        .select()
        .single();

      if (facilityError) throw facilityError;

      // 3. Update the profile with the facility_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          facility_id: facility.id,
          full_name: adminName,
          phone: adminPhone,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // 4. Assign facility_admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'facility_admin' as any,
          facility_id: facility.id,
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
      }

      toast({
        title: 'Facility Registered!',
        description: 'Please check your email to verify your account, then sign in.',
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-sidebar border-b border-sidebar-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-sidebar-foreground">AI-ESS EHR</span>
          <span className="text-sidebar-foreground/40 text-sm ml-auto">
            <Link to="/" className="hover:text-primary-foreground flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Register Your Facility</h1>
            <p className="text-muted-foreground text-sm">Join the health surveillance network</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-ehr p-8 space-y-6">
          <h3 className="font-heading font-semibold text-foreground">Facility Information</h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Facility Name *</Label>
              <Input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} placeholder="e.g. Central Health Clinic" className="mt-1.5" required />
            </div>
            <div>
              <Label>Facility Type *</Label>
              <Select value={facilityType} onValueChange={setFacilityType} required>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {facilityTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Region *</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region / State / Province" className="mt-1.5" required />
            </div>
            <div>
              <Label>District</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District / LGA" className="mt-1.5" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={facilityPhone} onChange={(e) => setFacilityPhone(e.target.value)} placeholder="+1 234 567 890" className="mt-1.5" />
            </div>
            <div>
              <Label>Facility Email</Label>
              <Input type="email" value={facilityEmail} onChange={(e) => setFacilityEmail(e.target.value)} placeholder="info@facility.com" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Physical address of the facility" className="mt-1.5" rows={2} />
          </div>

          <hr className="border-border" />
          <h3 className="font-heading font-semibold text-foreground">Administrator Account</h3>
          <p className="text-sm text-muted-foreground -mt-4">This person will manage the facility on the platform</p>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Full Name *</Label>
              <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Dr. Jane Smith" className="mt-1.5" required />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@facility.com" className="mt-1.5" required />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input type="tel" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="+1 234 567 890" className="mt-1.5" required />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5" required minLength={6} />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering...</> : 'Register Facility'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
