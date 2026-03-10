import { labResults } from '@/data/mockData';

export default function LaboratoryPage() {
  const pending = labResults.filter(l => l.status === 'Pending');
  const completed = labResults.filter(l => l.status === 'Completed');

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Laboratory</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">
          Request Lab Test
        </button>
      </div>

      {pending.length > 0 && (
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3 text-accent">Pending Tests ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map(l => (
              <div key={l.id} className="flex items-center justify-between border border-border rounded p-3 text-sm">
                <div>
                  <p className="font-medium">{l.patientName}</p>
                  <p className="text-xs text-muted-foreground">{l.test} · Requested {l.dateRequested}</p>
                </div>
                <span className="badge-accent">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-ehr overflow-hidden">
        <h2 className="font-heading font-medium text-sm px-4 pt-4 pb-2">Completed Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-medium">Patient</th>
                <th className="text-left px-4 py-2 font-medium">Test</th>
                <th className="text-left px-4 py-2 font-medium">Result</th>
                <th className="text-left px-4 py-2 font-medium">Flag</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {completed.map(l => (
                <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{l.patientName}</td>
                  <td className="px-4 py-2">{l.test}</td>
                  <td className="px-4 py-2">{l.result}</td>
                  <td className="px-4 py-2">
                    <span className={l.normalFlag === 'Abnormal' ? 'badge-danger' : 'badge-success'}>{l.normalFlag}</span>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">{l.dateCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
