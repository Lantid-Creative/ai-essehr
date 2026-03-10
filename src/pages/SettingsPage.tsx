import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Loader2, Save, User, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  facility_admin: 'Facility Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  chew: 'CHEW',
  lab_tech: 'Lab Technician',
  pharmacist: 'Pharmacist',
  data_clerk: 'Data Clerk',
  epidemiologist: 'Epidemiologist',
  dsno: 'DSNO',
};

export default function SettingsPage() {
  const { user, profile, roles, facilityId, refreshProfile } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [jobTitle, setJobTitle] = useState(profile?.job_title || '');

  const { data: facility, isLoading: facilityLoading } = useQuery({
    queryKey: ['my-facility', facilityId],
    queryFn: async () => {
      if (!facilityId) return null;
      const { data } = await supabase.from('facilities').select('*').eq('id', facilityId).single();
      return data;
    },
    enabled: !!facilityId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('profiles').update({
        full_name: fullName,
        phone: phone || null,
        job_title: jobTitle || null,
      }).eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: 'Profile updated' });
      await refreshProfile();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const isFacilityAdmin = roles.includes('facility_admin') || roles.includes('super_admin');

  // Facility update state
  const [facName, setFacName] = useState('');
  const [facPhone, setFacPhone] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facAddress, setFacAddress] = useState('');

  // Initialize facility form when data loads
  const initFacility = () => {
    if (facility && !facName) {
      setFacName(facility.name);
      setFacPhone(facility.phone || '');
      setFacEmail(facility.email || '');
      setFacAddress(facility.address || '');
    }
  };
  if (facility && !facName) initFacility();

  const updateFacilityMutation = useMutation({
    mutationFn: async () => {
      if (!facilityId) throw new Error('No facility');
      const { error } = await supabase.from('facilities').update({
        name: facName,
        phone: facPhone || null,
        email: facEmail || null,
        address: facAddress || null,
      }).eq('id', facilityId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Facility updated' });
      queryClient.invalidateQueries({ queryKey: ['my-facility'] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-heading font-medium">Settings</h1>

      {/* Profile Section */}
      <div className="card-ehr p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-medium text-sm">My Profile</h2>
        </div>
        <form onSubmit={e => { e.preventDefault(); updateProfileMutation.mutate(); }} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email || ''} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Job Title</Label>
              <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button type="submit" disabled={updateProfileMutation.isPending} className="gap-2">
            {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </Button>
        </form>
      </div>

      {/* Roles */}
      <div className="card-ehr p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-accent" />
          <h2 className="font-heading font-medium text-sm">My Roles & Permissions</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <span key={r} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
              {ROLE_LABELS[r] || r}
            </span>
          ))}
          {roles.length === 0 && <p className="text-sm text-muted-foreground">No roles assigned.</p>}
        </div>
      </div>

      {/* Facility Section */}
      {facilityId && (
        <div className="card-ehr p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-medium text-sm">Facility Information</h2>
          </div>
          {facilityLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : facility ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Field label="Facility Type" value={facility.facility_type} />
                <Field label="Status" value={facility.status} />
                <Field label="Region" value={facility.region || '—'} />
                <Field label="District" value={facility.district || '—'} />
                <Field label="Facility Code" value={facility.facility_code || '—'} />
                <Field label="Bed Count" value={String(facility.bed_count || 0)} />
              </div>

              {isFacilityAdmin && (
                <form onSubmit={e => { e.preventDefault(); updateFacilityMutation.mutate(); }} className="space-y-4 border-t border-border pt-4 mt-4">
                  <p className="text-xs text-muted-foreground">As admin, you can update the following:</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Facility Name</Label><Input value={facName} onChange={e => setFacName(e.target.value)} className="mt-1" /></div>
                    <div><Label>Phone</Label><Input value={facPhone} onChange={e => setFacPhone(e.target.value)} className="mt-1" /></div>
                    <div><Label>Email</Label><Input value={facEmail} onChange={e => setFacEmail(e.target.value)} className="mt-1" /></div>
                    <div><Label>Address</Label><Input value={facAddress} onChange={e => setFacAddress(e.target.value)} className="mt-1" /></div>
                  </div>
                  <Button type="submit" disabled={updateFacilityMutation.isPending} className="gap-2">
                    {updateFacilityMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Update Facility
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No facility data found.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}
