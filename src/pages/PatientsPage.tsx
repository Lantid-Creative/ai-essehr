import { useState } from 'react';
import { patients } from '@/data/mockData';
import type { Patient } from '@/data/mockData';
import { Search, UserPlus, CheckCircle, MapPin } from 'lucide-react';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [ninLookup, setNinLookup] = useState('');
  const [ninLoading, setNinLoading] = useState(false);
  const [ninVerified, setNinVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('demographics');

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId.toLowerCase().includes(search.toLowerCase()) ||
    p.nin.includes(search) ||
    p.phone.includes(search)
  );

  const handleNinLookup = () => {
    if (!ninLookup || ninLookup.length !== 11) return;
    setNinLoading(true);
    setTimeout(() => {
      setNinLoading(false);
      setNinVerified(true);
    }, 1500);
  };

  if (selectedPatient) {
    const p = selectedPatient;
    const tabs = ['Demographics', 'Visit History', 'Vaccinations', 'Lab Results', 'Medications', 'Alerts'];
    return (
      <div className="space-y-4 max-w-4xl">
        <button onClick={() => setSelectedPatient(null)} className="text-sm text-primary hover:underline">&larr; Back to list</button>
        {/* Patient Card */}
        <div className="card-ehr p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <img src={p.avatarUrl} alt={p.name} className="w-20 h-20 rounded-full border-2 border-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-heading font-medium">{p.name}</h2>
                {p.ninVerified && <span className="badge-success flex items-center gap-1"><CheckCircle className="h-3 w-3" /> NIN Verified</span>}
                {p.multiFacility && <span className="badge-accent flex items-center gap-1"><MapPin className="h-3 w-3" /> Multi-Facility</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {p.age}y · {p.sex} · NIN: ***-***-{p.nin.slice(-4)} · ID: {p.patientId}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.facilityRegistered} · {p.lgaOfResidence}, {p.stateOfOrigin}</p>
              <div className="flex gap-4 mt-2 text-xs">
                <span>Visits: <strong>{p.totalVisits}</strong></span>
                <span>Last: <strong>{p.lastVisitDate}</strong></span>
                <span>Alerts: <strong className={p.activeAlerts > 0 ? 'text-destructive' : ''}>{p.activeAlerts}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t.toLowerCase().replace(' ',''))}
              className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.toLowerCase().replace(' ','') ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="card-ehr p-4">
          {activeTab === 'demographics' && (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Full Name" value={p.name} />
              <Field label="Date of Birth" value={p.dob} />
              <Field label="Sex" value={p.sex} />
              <Field label="Phone" value={p.phone} />
              <Field label="State of Origin" value={p.stateOfOrigin} />
              <Field label="LGA of Residence" value={p.lgaOfResidence} />
              <Field label="Ward" value={p.ward} />
              <Field label="Village" value={p.village} />
              <Field label="Occupation" value={p.occupation} />
              <Field label="Religion" value={p.religion} />
              <Field label="Next of Kin" value={`${p.nextOfKin} (${p.nextOfKinRelation})`} />
              <Field label="Next of Kin Phone" value={p.nextOfKinPhone} />
              <Field label="Allergies" value={p.allergies.length > 0 ? p.allergies.join(', ') : 'None'} />
              <Field label="Chronic Conditions" value={p.chronicConditions.length > 0 ? p.chronicConditions.join(', ') : 'None'} />
              <div className="sm:col-span-2">
                <Field label="Facilities Visited" value={p.facilitiesVisited.join(', ')} />
              </div>
            </div>
          )}
          {activeTab === 'visithistory' && <p className="text-sm text-muted-foreground">Visit history records displayed here.</p>}
          {activeTab === 'vaccinations' && <p className="text-sm text-muted-foreground">Vaccination records: {p.vaccinations.join(', ')}</p>}
          {activeTab === 'labresults' && <p className="text-sm text-muted-foreground">Lab results linked to this patient.</p>}
          {activeTab === 'medications' && <p className="text-sm text-muted-foreground">Medication history.</p>}
          {activeTab === 'alerts' && <p className="text-sm text-muted-foreground">{p.activeAlerts} active alerts.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Patient Registry</h1>
        <button onClick={() => setShowNewForm(!showNewForm)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">
          <UserPlus className="h-4 w-4" /> Register New Patient
        </button>
      </div>

      {/* Search */}
      <div className="card-ehr p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, NIN, phone, or Patient ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* New Patient Form */}
      {showNewForm && (
        <div className="card-ehr p-6 space-y-4">
          <h2 className="font-heading font-medium">New Patient Registration</h2>
          {/* NIN Lookup */}
          <div>
            <label className="text-sm font-medium block mb-1">NIN (National Identification Number)</label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={11}
                placeholder="Enter 11-digit NIN"
                value={ninLookup}
                onChange={e => { setNinLookup(e.target.value.replace(/\D/g, '')); setNinVerified(false); }}
                className="flex-1 px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={handleNinLookup} disabled={ninLoading || ninLookup.length !== 11} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
                {ninLoading ? 'Verifying...' : 'Verify NIN'}
              </button>
            </div>
            {ninLoading && <p className="text-xs text-accent mt-1 pulse-gold">Connecting to NIMC database...</p>}
            {ninVerified && <p className="text-xs text-success mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> NIN Verified — Fields auto-populated</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name" defaultValue={ninVerified ? 'Abubakar Sani' : ''} locked={ninVerified} />
            <FormField label="Date of Birth" defaultValue={ninVerified ? '1990-05-15' : ''} locked={ninVerified} />
            <FormField label="Sex" defaultValue={ninVerified ? 'Male' : ''} locked={ninVerified} />
            <FormField label="State of Origin" defaultValue={ninVerified ? 'Kano' : ''} locked={ninVerified} />
            <FormField label="Phone Number" />
            <FormField label="LGA of Residence" />
            <FormField label="Ward" />
            <FormField label="Village / Community" />
            <FormField label="Next of Kin Name" />
            <FormField label="Next of Kin Phone" />
            <FormField label="Occupation" />
            <FormField label="Religion (optional)" />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Photo</label>
            <div className="flex gap-2">
              <button className="bg-secondary text-secondary-foreground border border-border px-3 py-2 rounded text-sm hover:bg-muted">📷 Take Photo</button>
              <button className="bg-secondary text-secondary-foreground border border-border px-3 py-2 rounded text-sm hover:bg-muted">📁 Upload</button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-medium hover:bg-primary/90">Save Patient</button>
            <button onClick={() => setShowNewForm(false)} className="bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {/* Patient List */}
      <div className="card-ehr overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-medium">Patient</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">ID</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Age/Sex</th>
                <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">LGA</th>
                <th className="text-left px-4 py-2 font-medium">Last Visit</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <img src={p.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell text-xs">{p.patientId}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{p.age}y / {p.sex.charAt(0)}</td>
                  <td className="px-4 py-2 hidden lg:table-cell text-muted-foreground">{p.lgaOfResidence}</td>
                  <td className="px-4 py-2 text-xs">{p.lastVisitDate}</td>
                  <td className="px-4 py-2">
                    {p.activeAlerts > 0 ? <span className="badge-danger">Alert</span> :
                     p.multiFacility ? <span className="badge-accent">Multi-Facility</span> :
                     <span className="badge-success">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

function FormField({ label, defaultValue = '', locked = false }: { label: string; defaultValue?: string; locked?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        disabled={locked}
        className={`w-full px-3 py-2 border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring ${locked ? 'bg-muted text-muted-foreground' : 'bg-background'}`}
      />
    </div>
  );
}
