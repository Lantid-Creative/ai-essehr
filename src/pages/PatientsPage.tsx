import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Search, UserPlus, Loader2, ArrowLeft, Stethoscope, FlaskConical, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

export default function PatientsPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [genotype, setGenotype] = useState('');
  const [allergies, setAllergies] = useState('');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', facilityId, search],
    queryFn: async () => {
      if (!facilityId) return [];
      let query = supabase.from('patients').select('*').eq('facility_id', facilityId).order('created_at', { ascending: false });
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,patient_code.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      const { data } = await query.limit(100);
      return data || [];
    },
    enabled: !!facilityId,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const code = `AIESS/${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from('patients').insert({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob || null,
        gender: gender as any || null,
        phone: phone || null,
        address: address || null,
        next_of_kin_name: nextOfKinName || null,
        next_of_kin_phone: nextOfKinPhone || null,
        blood_group: bloodGroup || null,
        genotype: genotype || null,
        allergies: allergies || null,
        facility_id: facilityId,
        registered_by: user?.id,
        patient_code: code,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Patient registered successfully' });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowNewForm(false);
      setFirstName(''); setLastName(''); setDob(''); setGender(''); setPhone('');
      setAddress(''); setNextOfKinName(''); setNextOfKinPhone('');
      setBloodGroup(''); setGenotype(''); setAllergies('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Patient detail view with encounter/lab/immunization history
  if (selectedPatient) {
    return <PatientDetail patient={selectedPatient} onBack={() => setSelectedPatient(null)} facilityId={facilityId} />;
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Patient Registry</h1>
        <Button onClick={() => setShowNewForm(!showNewForm)} className="gap-2">
          <UserPlus className="h-4 w-4" /> Register New Patient
        </Button>
      </div>

      <div className="card-ehr p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone, or Patient ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {showNewForm && (
        <form onSubmit={e => { e.preventDefault(); registerMutation.mutate(); }} className="card-ehr p-6 space-y-4">
          <h2 className="font-heading font-medium">New Patient Registration</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>First Name *</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required className="mt-1" /></div>
            <div><Label>Last Name *</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required className="mt-1" /></div>
            <div><Label>Date of Birth</Label><Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" /></div>
            <div><Label>Address</Label><Input value={address} onChange={e => setAddress(e.target.value)} className="mt-1" /></div>
            <div><Label>Blood Group</Label><Input value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} placeholder="e.g. O+" className="mt-1" /></div>
            <div><Label>Genotype</Label><Input value={genotype} onChange={e => setGenotype(e.target.value)} placeholder="e.g. AA" className="mt-1" /></div>
            <div><Label>Next of Kin Name</Label><Input value={nextOfKinName} onChange={e => setNextOfKinName(e.target.value)} className="mt-1" /></div>
            <div><Label>Next of Kin Phone</Label><Input value={nextOfKinPhone} onChange={e => setNextOfKinPhone(e.target.value)} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>Allergies</Label><Input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Comma-separated" className="mt-1" /></div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : 'Save Patient'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="card-ehr overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-2 font-medium">Patient</th>
                  <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">ID</th>
                  <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Gender</th>
                  <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <span className="font-medium">{p.first_name} {p.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell text-xs">{p.patient_code || '—'}</td>
                    <td className="px-4 py-2 hidden md:table-cell capitalize">{p.gender || '—'}</td>
                    <td className="px-4 py-2 hidden lg:table-cell text-muted-foreground">{p.phone || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={p.status === 'active' ? 'badge-success' : 'badge-warning'}>{p.status}</span>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No patients found. Register your first patient above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PatientDetail({ patient: p, onBack, facilityId }: { patient: Patient; onBack: () => void; facilityId: string | null }) {
  const { data: encounters = [] } = useQuery({
    queryKey: ['patient-encounters', p.id],
    queryFn: async () => {
      const { data } = await supabase.from('encounters').select('*').eq('patient_id', p.id).order('encounter_date', { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: labResults = [] } = useQuery({
    queryKey: ['patient-labs', p.id],
    queryFn: async () => {
      const { data } = await supabase.from('lab_results').select('*').eq('patient_id', p.id).order('ordered_at', { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: immunizations = [] } = useQuery({
    queryKey: ['patient-immunizations', p.id],
    queryFn: async () => {
      const { data } = await supabase.from('immunizations').select('*').eq('patient_id', p.id).order('administered_at', { ascending: false }).limit(20);
      return data || [];
    },
  });

  const age = p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000) : null;

  return (
    <div className="space-y-4 max-w-4xl">
      <button onClick={onBack} className="text-sm text-primary hover:underline flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back to list
      </button>

      {/* Header */}
      <div className="card-ehr p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
            {p.first_name[0]}{p.last_name[0]}
          </div>
          <div>
            <h2 className="text-xl font-heading font-medium">{p.first_name} {p.last_name}</h2>
            <p className="text-sm text-muted-foreground">
              {p.gender && <span className="capitalize">{p.gender}</span>}
              {age !== null && <> · {age} yrs</>}
              {p.date_of_birth && <> · DOB: {p.date_of_birth}</>}
              {p.patient_code && <> · ID: {p.patient_code}</>}
            </p>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="card-ehr p-4">
        <h3 className="font-heading font-medium text-sm mb-3">Demographics</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Field label="Phone" value={p.phone || '—'} />
          <Field label="Address" value={p.address || '—'} />
          <Field label="Blood Group" value={p.blood_group || '—'} />
          <Field label="Genotype" value={p.genotype || '—'} />
          <Field label="Allergies" value={p.allergies || 'None'} />
          <Field label="Next of Kin" value={p.next_of_kin_name || '—'} />
          <Field label="Next of Kin Phone" value={p.next_of_kin_phone || '—'} />
          <Field label="Status" value={p.status} />
        </div>
      </div>

      {/* Encounter History */}
      <div className="card-ehr p-4">
        <h3 className="font-heading font-medium text-sm mb-3 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" /> Encounter History ({encounters.length})
        </h3>
        {encounters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No encounters recorded.</p>
        ) : (
          <div className="space-y-3">
            {encounters.map(e => (
              <div key={e.id} className="border border-border rounded p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{new Date(e.encounter_date).toLocaleDateString()}</span>
                    <span className="ml-2 text-xs text-muted-foreground capitalize">{e.encounter_type}</span>
                  </div>
                  {e.is_syndromic_alert && <span className="badge-warning">⚠ Syndromic</span>}
                </div>
                {e.chief_complaint && <p className="text-muted-foreground mt-1">{e.chief_complaint}</p>}
                {e.diagnosis && <p className="mt-1">Dx: <strong>{e.diagnosis}</strong></p>}
                {e.treatment_plan && <p className="text-xs text-muted-foreground mt-1">Rx: {e.treatment_plan}</p>}
                {Array.isArray(e.prescriptions) && (e.prescriptions as any[]).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(e.prescriptions as any[]).map((rx: any, i: number) => (
                      <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{rx.drug} {rx.dose} {rx.frequency}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Results */}
      <div className="card-ehr p-4">
        <h3 className="font-heading font-medium text-sm mb-3 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-accent" /> Lab Results ({labResults.length})
        </h3>
        {labResults.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lab results.</p>
        ) : (
          <div className="space-y-2">
            {labResults.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <div>
                  <p className="font-medium">{l.test_name}</p>
                  <p className="text-xs text-muted-foreground">{l.test_category || 'General'} · {new Date(l.ordered_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  {l.result ? (
                    <>
                      <p className="text-sm">{l.result}</p>
                      <span className={l.is_abnormal ? 'badge-danger' : 'badge-success'}>{l.is_abnormal ? 'Abnormal' : 'Normal'}</span>
                    </>
                  ) : (
                    <span className="badge-accent">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immunizations */}
      <div className="card-ehr p-4">
        <h3 className="font-heading font-medium text-sm mb-3 flex items-center gap-2">
          <Syringe className="h-4 w-4 text-primary" /> Immunization History ({immunizations.length})
        </h3>
        {immunizations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No immunization records.</p>
        ) : (
          <div className="space-y-2">
            {immunizations.map(imm => (
              <div key={imm.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <div>
                  <p className="font-medium">{imm.vaccine_name} (Dose {imm.dose_number})</p>
                  <p className="text-xs text-muted-foreground">Batch: {imm.batch_number || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{new Date(imm.administered_at).toLocaleDateString()}</p>
                  {imm.next_dose_date && <p className="text-xs text-primary">Next: {imm.next_dose_date}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}