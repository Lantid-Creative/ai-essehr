import { useState, useMemo } from 'react';
import { patients, consultations } from '@/data/mockData';
import { AlertTriangle, Search } from 'lucide-react';

const symptomGroups = [
  { category: 'Lassa Screening', symptoms: ['Fever', 'Hemorrhagic symptoms', 'Weakness', 'Muscle pain'] },
  { category: 'Cholera Screening', symptoms: ['Watery diarrhea', 'Dehydration', 'Vomiting'] },
  { category: 'Meningitis Screening', symptoms: ['Stiff neck', 'Headache', 'Photophobia', 'Fever'] },
  { category: 'Measles Screening', symptoms: ['Rash', 'Fever', 'Cough', 'Conjunctivitis'] },
  { category: 'Diphtheria Screening', symptoms: ['Sore throat', 'Neck swelling', 'Difficulty breathing'] },
  { category: 'General', symptoms: ['Cough', 'Vomiting', 'Weakness', 'Weight loss', 'Chest pain', 'Abdominal pain'] },
];

const syndromicRules: { disease: string; requiredSymptoms: string[] }[] = [
  { disease: 'Lassa Fever', requiredSymptoms: ['Fever', 'Hemorrhagic symptoms'] },
  { disease: 'Cholera', requiredSymptoms: ['Watery diarrhea', 'Dehydration'] },
  { disease: 'Meningitis', requiredSymptoms: ['Stiff neck', 'Headache', 'Fever'] },
  { disease: 'Measles', requiredSymptoms: ['Rash', 'Fever'] },
  { disease: 'Diphtheria', requiredSymptoms: ['Sore throat', 'Neck swelling'] },
];

const dispositions = ['Outpatient', 'Admitted', 'Referred', 'Discharged'] as const;

export default function ConsultationPage() {
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [chiefComplaint, setCchiefComplaint] = useState('');
  const [duration, setDuration] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', bp: '', pulse: '', respiratoryRate: '', spo2: '', weight: '' });
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [disposition, setDisposition] = useState<string>('Outpatient');
  const [showHistory, setShowHistory] = useState(true);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.patientId.includes(patientSearch)
  ).slice(0, 5);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Syndromic flag detection
  const syndromicFlags = useMemo(() => {
    return syndromicRules.filter(rule =>
      rule.requiredSymptoms.every(s => selectedSymptoms.includes(s))
    );
  }, [selectedSymptoms]);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const patientConsultations = selectedPatient
    ? consultations.filter(c => c.patientId === selectedPatient.id)
    : [];

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-heading font-medium">New Consultation</h1>

      {/* Patient Search */}
      <div className="card-ehr p-4 space-y-2">
        <label className="text-sm font-medium">Select Patient</label>
        {selectedPatient ? (
          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded">
            <img src={selectedPatient.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedPatient.name}</p>
              <p className="text-xs text-muted-foreground">{selectedPatient.age}y · {selectedPatient.sex} · {selectedPatient.patientId}</p>
            </div>
            <button onClick={() => setSelectedPatientId('')} className="text-xs text-primary hover:underline">Change</button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search patient by name or ID..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            {patientSearch && (
              <div className="border border-border rounded divide-y divide-border">
                {filteredPatients.map(p => (
                  <button key={p.id} onClick={() => { setSelectedPatientId(p.id); setPatientSearch(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 text-left">
                    <img src={p.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
                    <span className="text-sm">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{p.patientId}</span>
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

          {/* Chief Complaint */}
          <div className="card-ehr p-4 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Chief Complaint</label>
              <textarea value={chiefComplaint} onChange={e => setCchiefComplaint(e.target.value)} rows={2}
                placeholder="Describe the patient's main complaint..."
                className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            {/* Symptoms Checklist */}
            <div>
              <label className="text-sm font-medium block mb-2">Symptom Checklist</label>
              <div className="space-y-3">
                {symptomGroups.map(group => (
                  <div key={group.category}>
                    <p className="text-xs text-muted-foreground font-medium mb-1">{group.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.symptoms.map(s => (
                        <button key={s} onClick={() => toggleSymptom(s)}
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

            <div>
              <label className="text-sm font-medium block mb-1">Duration of Symptoms (days)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={1}
                className="w-32 px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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
              <label className="text-sm font-medium block mb-1">Clinical Notes / Pidgin OK</label>
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
                placeholder="Medications, dosage, frequency..."
                className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Disposition</label>
              <div className="flex flex-wrap gap-2">
                {dispositions.map(d => (
                  <button key={d} onClick={() => setDisposition(d)}
                    className={`px-4 py-1.5 rounded text-sm border transition-colors ${
                      disposition === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:border-primary/50'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button - with IDSR split if syndromic flag */}
          <div className="flex gap-0">
            {syndromicFlags.length > 0 ? (
              <div className="flex w-full max-w-md">
                <button className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-l text-sm font-medium hover:bg-primary/90">
                  Save & Notify Facility Lead
                </button>
                <button className="w-12 bg-accent text-accent-foreground rounded-r flex items-center justify-center pulse-gold text-xs font-bold hover:bg-accent/80" title="View IDSR Form">
                  IDSR
                </button>
              </div>
            ) : (
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded text-sm font-medium hover:bg-primary/90">
                Save Consultation
              </button>
            )}
          </div>

          {/* Previous Consultations */}
          {patientConsultations.length > 0 && (
            <div className="card-ehr p-4">
              <button onClick={() => setShowHistory(!showHistory)} className="font-heading font-medium text-sm w-full text-left">
                Previous Consultations ({patientConsultations.length}) {showHistory ? '▾' : '▸'}
              </button>
              {showHistory && (
                <div className="mt-3 space-y-3">
                  {patientConsultations.map(c => (
                    <div key={c.id} className="border border-border rounded p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{c.date}</span>
                        {c.syndromicFlag && <span className="badge-warning">{c.syndromicFlag}</span>}
                      </div>
                      <p className="text-muted-foreground mt-1">{c.chiefComplaint}</p>
                      <p className="mt-1">Dx: {c.provisionalDiagnosis} · Rx: {c.treatment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
