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
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [facilityPhone, setFacilityPhone] = useState('');
  const [facilityEmail, setFacilityEmail] = useState('');
  const [headOfFacility, setHeadOfFacility] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminTitle, setAdminTitle] = useState('');
  const [adminLicense, setAdminLicense] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [attested, setAttested] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Block obvious free-mail domains for the facility's official email
    const freeMail = /@(gmail|yahoo|hotmail|outlook|icloud|aol|protonmail|live|msn)\./i;
    if (facilityEmail && freeMail.test(facilityEmail)) {
      toast({
        title: 'Use an official facility email',
        description: 'Please provide an institutional email address (e.g. info@yourhospital.org), not a personal Gmail/Yahoo address.',
        variant: 'destructive',
      });
      return;
    }
    if (!attested) {
      toast({
        title: 'Attestation required',
        description: 'You must confirm you are an authorized representative of a registered health facility.',
        variant: 'destructive',
      });
      return;
    }

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

      // 2. Create the facility (active immediately)
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .insert({
          name: facilityName,
          facility_type: facilityType as any,
          facility_code: registrationNumber || null,
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
          job_title: adminTitle || null,
        })
        .eq('id', authData.user.id);

      if (profileError) console.error('Profile update error:', profileError);

      // 4. Assign facility_admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'facility_admin' as any,
          facility_id: facility.id,
        });
      if (roleError) console.error('Role assignment error:', roleError);

      // 5. Audit attestation for compliance
      await supabase.from('audit_logs').insert({
        user_id: authData.user.id,
        facility_id: facility.id,
        action: 'facility_registered',
        entity_type: 'facility',
        entity_id: facility.id,
        details: {
          registration_number: registrationNumber,
          head_of_facility: headOfFacility,
          admin_license: adminLicense,
          admin_title: adminTitle,
          attested_at: new Date().toISOString(),
        },
      });

      toast({
        title: 'Facility activated',
        description: 'Verify your email, then sign in to begin using Integra+.',
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
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <Link to="/login" className="text-sm text-ink-soft hover:text-ink">Already registered? <span className="text-primary font-medium">Sign in</span></Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-ink w-11 h-11 rounded-2xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[hsl(var(--cream))]" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-editorial-muted">Facility onboarding</span>
        </div>
        <h1 className="editorial-display text-ink text-3xl sm:text-4xl mb-2">Register your facility.</h1>
        <p className="text-ink-soft mb-8 max-w-xl">Join Nigeria's national disease-surveillance network. Activation is immediate; verification follows.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 space-y-6">
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
              <Label>Facility Registration Number *</Label>
              <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. FMOH/HCF/12345 or HEFAMAA No." className="mt-1.5" required />
            </div>
            <div>
              <Label>Head of Facility / Medical Director *</Label>
              <Input value={headOfFacility} onChange={(e) => setHeadOfFacility(e.target.value)} placeholder="Dr. ..." className="mt-1.5" required />
            </div>
            <div>
              <Label>Facility Phone *</Label>
              <Input value={facilityPhone} onChange={(e) => setFacilityPhone(e.target.value)} placeholder="+234 ..." className="mt-1.5" required />
            </div>
            <div>
              <Label>Official Facility Email *</Label>
              <Input type="email" value={facilityEmail} onChange={(e) => setFacilityEmail(e.target.value)} placeholder="info@yourhospital.org (no Gmail/Yahoo)" className="mt-1.5" required />
            </div>
          </div>

          <div>
            <Label>Physical Address *</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address — used for verification" className="mt-1.5" rows={2} required />
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
              <Label>Job Title *</Label>
              <Input value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} placeholder="e.g. Medical Director, CMO, Hospital Manager" className="mt-1.5" required />
            </div>
            <div>
              <Label>Professional License No. *</Label>
              <Input value={adminLicense} onChange={(e) => setAdminLicense(e.target.value)} placeholder="MDCN / NMCN / PCN registration number" className="mt-1.5" required />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="you@yourhospital.org" className="mt-1.5" required />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input type="tel" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="+234 ..." className="mt-1.5" required />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5" required minLength={6} />
            </div>
          </div>

          <label className="flex gap-3 items-start text-sm bg-muted/50 p-4 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span className="text-muted-foreground">
              I confirm that I am an authorized representative of the registered health facility named above,
              that all information provided is accurate, and that I understand any false declaration may result
              in immediate suspension and reporting to the Federal Ministry of Health and NCDC.
            </span>
          </label>

          <Button type="submit" className="w-full h-12 text-base font-semibold rounded-full bg-ink text-[hsl(var(--cream))] hover:bg-ink/90" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Activating…</> : 'Register & activate facility'}
          </Button>

          <p className="text-center text-sm text-ink-soft">
            Already registered? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
