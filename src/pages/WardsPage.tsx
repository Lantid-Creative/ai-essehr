import { wardBeds } from '@/data/mockData';

const wardNames = ['Male Ward', 'Female Ward', "Children's Ward", 'Isolation Ward', 'Maternity Ward', 'Emergency'];

export default function WardsPage() {
  const wardGroups = wardNames.map(ward => ({
    name: ward,
    beds: wardBeds.filter(b => b.ward === ward),
  }));

  const totalBeds = wardBeds.length;
  const occupied = wardBeds.filter(b => b.status === 'Occupied').length;
  const available = wardBeds.filter(b => b.status === 'Available').length;
  const reserved = wardBeds.filter(b => b.status === 'Reserved').length;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Ward Management</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{totalBeds}</p><p className="text-xs text-muted-foreground">Total Beds</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-destructive">{occupied}</p><p className="text-xs text-muted-foreground">Occupied</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-success">{available}</p><p className="text-xs text-muted-foreground">Available</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-accent">{reserved}</p><p className="text-xs text-muted-foreground">Reserved</p></div>
      </div>

      {/* Ward Grids */}
      {wardGroups.map(ward => (
        <div key={ward.name} className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">{ward.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {ward.beds.map(bed => (
              <div key={bed.id} className={`rounded p-3 text-center text-xs border ${
                bed.status === 'Occupied' ? 'bg-destructive/10 border-destructive/30' :
                bed.status === 'Reserved' ? 'bg-accent/10 border-accent/30' :
                'bg-success/10 border-success/30'
              }`}>
                <p className="font-bold">{bed.bedNumber}</p>
                <p className={`mt-0.5 ${
                  bed.status === 'Occupied' ? 'text-destructive' : bed.status === 'Reserved' ? 'text-accent' : 'text-success'
                }`}>{bed.status}</p>
                {bed.patientName && <p className="text-muted-foreground mt-1 truncate">{bed.patientName}</p>}
                {bed.isolationFlag && <span className="badge-danger mt-1 inline-block">⚠ Isolation</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
