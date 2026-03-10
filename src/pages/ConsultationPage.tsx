import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { AlertTriangle, Search, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

const symptomGroups = [
  { category: 'Lassa Screening', symptoms: ['Fever', 'Hemorrhagic symptoms', 'Weakness', 'Muscle pain'] },
  { category: 'Cholera Screening', symptoms: ['Watery diarrhea', 'Dehydration', 'Vomiting'] },
  { category: 'Meningitis Screening', symptoms: ['Stiff neck', 'Headache', 'Photophobia', 'Fever'] },
  { category: 'Measles Screening', symptoms: ['Rash', 'Fever', 'Cough', 'Conjunctivitis'] },
  { category: 'Diphtheria Screening', symptoms: ['Sore throat', 'Neck swelling', 'Difficulty breathing'] },
  { category: 'General', symptoms: ['Cough', 'Vomiting', 'Weakness', 'Weight loss', 'Chest pain', 'Abdominal pain'] },
];

const syndromicRules = [
  { disease: 'Lassa Fever', requiredSymptoms: ['Fever', 'Hemorrhagic symptoms'] },
  { disease: 'Cholera', requiredSymptoms: ['Watery diarrhea', 'Dehydration'] },
  { disease: 'Meningitis', requiredSymptoms: ['Stiff neck', 'Headache', 'Fever'] },
  { disease: 'Measles', requiredSymptoms: ['Rash', 'Fever'] },
  { disease: 'Diphtheria', requiredSymptoms: ['Sore throat', 'Neck swelling'] },
];

const dispositions = ['Outpatient', 'Admitted', 'Referred', 'Discharged'] as const;

interface Prescription {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface LabOrder {
  test_name: string;
  test_category: string;
}

const commonDrugs = ['Artemether-Lumefantrine (ACT)', 'Amoxicillin 500mg', 'Paracetamol 500mg', 'Metronidazole 400mg', 'Ciprofloxacin 500mg', 'Omeprazole 20mg', 'ORS', 'Zinc Tablets', 'Ibuprofen 400mg', 'Diclofenac 50mg'];
const commonTests = [
  { name: 'RDT Malaria', category: 'Rapid Test' },
  { name: 'Full Blood Count', category: 'Hematology' },
  { name: 'Blood Culture', category: 'Microbiology' },
  { name: 'Urinalysis', category: 'Urinalysis' },
  { name: 'Stool Microscopy', category: 'Microbiology' },
  { name: 'Lassa Screening', category: 'Virology' },
  { name: 'Cholera RDT', category: 'Rapid Test' },
  { name: 'Liver Function Test', category: 'Biochemistry' },
  { name: 'Renal Function Test', category: 'Biochemistry' },
  { name: 'Widal Test', category: 'Serology' },
];

export default function ConsultationPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', bp: '', pulse: '', respiratoryRate: '', spo2: '', weight: '' });
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [disposition, setDisposition] = useState<string>('Outpatient');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['patient-search', patientSearch, facilityId],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2 || !facilityId) return [];
      const { data } = await supabase.from('patients').select('*')
        .eq('facility_id', facilityId)
        .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,patient_code.ilike.%${patientSearch}%`)
        .limit(5);
      return data || [];
    },
    enabled: patientSearch.length >= 2 && !selectedPatient,
  });

  const { data: pastEncounters = [] } = useQuery({
    queryKey: ['encounters', selectedPatient?.id],
    queryFn: async () => {
      if (!selectedPatient) return [];
      const { data } = await supabase.from('encounters').select('*')
        .eq('patient_id', selectedPatient.id)
        .order('encounter_date', { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!selectedPatient,
  });

  const syndromicFlags = useMemo(() => {
    return syndromicRules.filter(rule =>
      rule.requiredSymptoms.every(s => selectedSymptoms.includes(s))
    );
  }, [selectedSymptoms]);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addPrescription = () => setPrescriptions([...prescriptions, { drug: '', dose: '', frequency: '', duration: '' }]);
  const removePrescription = (i: number) => setPrescriptions(prescriptions.filter((_, idx) => idx !== i));
  const updatePrescription = (i: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions];
    updated[i] = { ...updated[i], [field]: value };
    setPrescriptions(updated);
  };

  const addLabOrder = (test: typeof commonTests[0]) => {
    if (!labOrders.find(l => l.test_name === test.name)) {
      setLabOrders([...labOrders, { test_name: test.name, test_category: test.category }]);
    }
  };
  const removeLabOrder = (i: number) => setLabOrders(labOrders.filter((_, idx) => idx !== i));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPatient) throw new Error('No patient selected');
      const isSyndromic = syndromicFlags.length > 0;
      const validRx = prescriptions.filter(p => p.drug.trim());

      const { data: encounter, error } = await supabase.from('encounters').insert({
        patient_id: selectedPatient.id,
        facility_id: facilityId,
        clinician_id: user?.id,
        encounter_type: 'consultation',
        chief_complaint: chiefComplaint,
        symptoms: selectedSymptoms as any,
        vital_signs: vitals as any,
        examination_notes: clinicalNotes,
        diagnosis,
        treatment_plan: treatment,
        prescriptions: validRx.length > 0 ? validRx as any : null,
        is_syndromic_alert: isSyndromic,
        syndromic_flags: syndromicFlags.map(f => f.disease) as any,
      }).select('id').single();
      if (error) throw error;

      // Create lab orders
      if (labOrders.length > 0 && encounter) {
        const labInserts = labOrders.map(l => ({
          patient_id: selectedPatient.id,
          facility_id: facilityId,
          encounter_id: encounter.id,
          test_name: l.test_name,
          test_category: l.test_category,
          ordered_by: user?.id,
        }));
        await supabase.from('lab_results').insert(labInserts);
      }

      // Auto-create surveillance alerts
      if (isSyndromic) {
        for (const flag of syndromicFlags) {
          await supabase.from('surveillance_alerts').insert({
            disease_name: flag.disease,
            facility_id: facilityId,
            reported_by: user?.id,
            severity: syndromicFlags.length >= 2 ? 'high' : 'medium',
            description: `Syndromic alert: ${flag.disease} detected. Patient: ${selectedPatient.first_name} ${selectedPatient.last_name}. Symptoms: ${selectedSymptoms.join(', ')}`,
          });
        }
      }

      // Audit log
      if (encounter) {
        await supabase.from('audit_logs').insert({
          user_id: user!.id,
          facility_id: facilityId,
          action: 'create',
          entity_type: 'encounter',
          entity_id: encounter.id,
          details: { patient: `${selectedPatient.first_name} ${selectedPatient.last_name}`, diagnosis, syndromic: isSyndromic } as any,
        } as any);
      }
    },
    onSuccess: () => {
      const msg = syndromicFlags.length > 0
        ? `Consultation saved & ${syndromicFlags.length} alert(s) raised!`
        : labOrders.length > 0
        ? `Consultation saved & ${labOrders.length} lab order(s) created!`
        : 'Consultation saved';
      toast({ title: msg });
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      queryClient.invalidateQueries({ queryKey: ['surveillance'] });
      queryClient.invalidateQueries({ queryKey: ['lab-pending'] });
      // Reset
      setSelectedPatient(null); setSelectedSymptoms([]); setChiefComplaint('');
      setVitals({ temperature: '', bp: '', pulse: '', respiratoryRate: '', spo2: '', weight: '' });
      setClinicalNotes(''); setDiagnosis(''); setTreatment(''); setDisposition('Outpatient');
      setPrescriptions([]); setLabOrders([]);
    },
    onError: (err: any) => toast({ title: 'Error saving', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-heading font-medium">New Consultation</h1>

      {/* Patient Search */}
      <div className="card-ehr p-4 space-y-2">
        <label className="text-sm font-medium">Select Patient</label>
        {selectedPatient ? (
          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedPatient.first_name} {selectedPatient.last_name}</p>
              <p className="text-xs text-muted-foreground">{selectedPatient.gender} · {selectedPatient.patient_code}</p>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="text-xs text-primary hover:underline">Change</button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search patient by name or ID..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            {searchResults.length > 0 && (
              <div className="border border-border rounded divide-y divide-border">
                {searchResults.map(p => (
                  <button key={p.id} onClick={() => { setSelectedPatient(p); setPatientSearch(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 text-left">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                    <span className="text-sm">{p.first_name} {p.last_name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{p.patient_code}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedPatient && (
        <>
          {/* Syndromic Alert Banners */}
          {syndromicFlags.map(flag => (
            <div key={flag.disease} className="alert-banner-yellow flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="font-medium text-sm">Syndromic Alert: Possible {flag.disease}</span>
            </div>
          ))}

          {/* Chief Complaint + Symptoms */}
          <div className="card-ehr p-4 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Chief Complaint</label>
              <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} rows={2}
                placeholder="Describe the patient's main complaint..."
                className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Symptom Checklist</label>
              <div className="space-y-3">
                {symptomGroups.map(group => (
                  <div key={group.category}>
                    <p className="text-xs text-muted-foreground font-medium mb-1">{group.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.symptoms.map(s => (
                        <button key={s} type="button" onClick={() => toggleSymptom(s)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            selectedSymptoms.includes(s)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-border hover:border-primary/50'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="card-ehr p-4">
            <h2 className="font-heading font-medium text-sm mb-3">Vitals</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Temperature (°C)', key: 'temperature', placeholder: '37.0' },
                { label: 'Blood Pressure', key: 'bp', placeholder: '120/80' },
                { label: 'Pulse (bpm)', key: 'pulse', placeholder: '72' },
                { label: 'Respiratory Rate', key: 'respiratoryRate', placeholder: '18' },
                { label: 'SpO2 (%)', key: 'spo2', placeholder: '98' },
                { label: 'Weight (kg)', key: 'weight', placeholder: '70' },
              ].map(v => (
                <div key={v.key}>
                  <label className="text-xs text-muted-foreground block mb-1">{v.label}</label>
                  <input type="text" placeholder={v.placeholder}
                    value={vitals[v.key as keyof typeof vitals]}
                    onChange={e => setVitals(prev => ({ ...prev, [v.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes, Diagnosis, Treatment */}
          <div className="card-ehr p-4 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Clinical Notes</label>
              <textarea value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} rows={3}
                className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Provisional Diagnosis + ICD-10</label>
              <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Malaria (B50)"
                className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Treatment Plan</label>
              <textarea value={treatment} onChange={e => setTreatment(e.target.value)} rows={2}
                placeholder="General treatment notes..."
                className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Disposition</label>
              <div className="flex flex-wrap gap-2">
                {dispositions.map(d => (
                  <button key={d} type="button" onClick={() => setDisposition(d)}
                    className={`px-4 py-1.5 rounded text-sm border transition-colors ${
                      disposition === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:border-primary/50'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="card-ehr p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-medium text-sm">Prescriptions</h2>
              <Button size="sm" variant="outline" onClick={addPrescription} className="gap-1">
                <Plus className="h-3 w-3" /> Add Drug
              </Button>
            </div>
            {prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prescriptions added. Click "Add Drug" to prescribe medications.</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx, i) => (
                  <div key={i} className="border border-border rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Drug #{i + 1}</span>
                      <button onClick={() => removePrescription(i)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-muted-foreground">Drug Name</label>
                        <input list={`drugs-${i}`} value={rx.drug} onChange={e => updatePrescription(i, 'drug', e.target.value)}
                          placeholder="Type or select..."
                          className="w-full px-2 py-1.5 border border-input rounded bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                        <datalist id={`drugs-${i}`}>
                          {commonDrugs.map(d => <option key={d} value={d} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Dose</label>
                        <input value={rx.dose} onChange={e => updatePrescription(i, 'dose', e.target.value)}
                          placeholder="e.g. 500mg"
                          className="w-full px-2 py-1.5 border border-input rounded bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Frequency</label>
                        <input value={rx.frequency} onChange={e => updatePrescription(i, 'frequency', e.target.value)}
                          placeholder="e.g. TDS (3x daily)"
                          className="w-full px-2 py-1.5 border border-input rounded bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Duration</label>
                        <input value={rx.duration} onChange={e => updatePrescription(i, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full px-2 py-1.5 border border-input rounded bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lab Orders */}
          <div className="card-ehr p-4">
            <h2 className="font-heading font-medium text-sm mb-3">Lab Orders</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {commonTests.map(t => {
                const selected = labOrders.find(l => l.test_name === t.name);
                return (
                  <button key={t.name} type="button" onClick={() => selected ? removeLabOrder(labOrders.indexOf(selected)) : addLabOrder(t)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selected
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-background text-foreground border-border hover:border-accent/50'
                    }`}>
                    {t.name}
                  </button>
                );
              })}
            </div>
            {labOrders.length > 0 && (
              <p className="text-xs text-muted-foreground">{labOrders.length} test(s) will be ordered and appear in the Lab queue.</p>
            )}
          </div>

          {/* Save */}
          <div className="flex gap-0">
            {syndromicFlags.length > 0 ? (
              <div className="flex w-full max-w-md">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex-1 rounded-r-none">
                  {saveMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : 'Save & Notify Facility Lead'}
                </Button>
                <button className="w-12 bg-accent text-accent-foreground rounded-r flex items-center justify-center text-xs font-bold hover:bg-accent/80" title="IDSR Form">
                  IDSR
                </button>
              </div>
            ) : (
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : 'Save Consultation'}
              </Button>
            )}
          </div>

          {/* Previous Encounters */}
          {pastEncounters.length > 0 && (
            <div className="card-ehr p-4">
              <h3 className="font-heading font-medium text-sm mb-3">Previous Encounters ({pastEncounters.length})</h3>
              <div className="space-y-3">
                {pastEncounters.map(e => (
                  <div key={e.id} className="border border-border rounded p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{new Date(e.encounter_date).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground capitalize">{e.encounter_type}</span>
                      {e.is_syndromic_alert && <span className="badge-warning">⚠ Syndromic</span>}
                    </div>
                    <p className="text-muted-foreground mt-1">{e.chief_complaint}</p>
                    {e.diagnosis && <p className="mt-1">Dx: {e.diagnosis}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
