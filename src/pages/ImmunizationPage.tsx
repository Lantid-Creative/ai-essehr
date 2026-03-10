import { vaccinationRecords } from '@/data/mockData';

export default function ImmunizationPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Immunization</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">
          Record Vaccination
        </button>
      </div>

      <div className="card-ehr overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-medium">Patient</th>
                <th className="text-left px-4 py-2 font-medium">Vaccine</th>
                <th className="text-left px-4 py-2 font-medium">Batch</th>
                <th className="text-left px-4 py-2 font-medium">Date</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Next Due</th>
                <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Administered By</th>
              </tr>
            </thead>
            <tbody>
              {vaccinationRecords.map(v => (
                <tr key={v.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{v.patientName}</td>
                  <td className="px-4 py-2">{v.vaccine}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{v.batchNumber}</td>
                  <td className="px-4 py-2">{v.dateAdministered}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{v.nextDueDate || '—'}</td>
                  <td className="px-4 py-2 hidden lg:table-cell text-muted-foreground">{v.administeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
