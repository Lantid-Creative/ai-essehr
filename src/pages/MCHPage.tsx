import { ancPatients } from '@/data/mockData';
import { useState } from 'react';

export default function MCHPage() {
  const [selectedAnc, setSelectedAnc] = useState<string | null>(null);
  const selected = ancPatients.find(a => a.id === selectedAnc);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Maternal & Child Health</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">
          Register ANC Patient
        </button>
      </div>

      {/* ANC Patient List */}
      <div className="card-ehr overflow-hidden">
        <h2 className="font-heading font-medium text-sm px-4 pt-4 pb-2">Antenatal Care Patients</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-medium">Patient</th>
                <th className="text-left px-4 py-2 font-medium">GA (weeks)</th>
                <th className="text-left px-4 py-2 font-medium">EDD</th>
                <th className="text-left px-4 py-2 font-medium">Visits</th>
                <th className="text-left px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {ancPatients.map(a => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{a.patientName}</td>
                  <td className="px-4 py-2">{a.gestationalAge}</td>
                  <td className="px-4 py-2">{a.edd}</td>
                  <td className="px-4 py-2">{a.visits.length}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => setSelectedAnc(selectedAnc === a.id ? null : a.id)} className="text-primary text-xs hover:underline">
                      {selectedAnc === a.id ? 'Hide' : 'View'} History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANC Visit History */}
      {selected && (
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">ANC Visit History — {selected.patientName}</h2>
          <div className="space-y-3">
            {selected.visits.map((v, i) => (
              <div key={i} className="border border-border rounded p-3 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{v.date}</span>
                  <span>GA: {v.gestationalAge} weeks</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-muted-foreground">BP:</span> {v.bp}</div>
                  <div><span className="text-muted-foreground">Fundal:</span> {v.fundalHeight}cm</div>
                  <div><span className="text-muted-foreground">FHR:</span> {v.fetalHeartRate}bpm</div>
                  <div><span className="text-muted-foreground">Urine:</span> {v.urineResult}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{v.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
