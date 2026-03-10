import { drugInventory } from '@/data/mockData';
import { AlertTriangle } from 'lucide-react';

export default function PharmacyPage() {
  const lowStock = drugInventory.filter(d => d.belowReorder);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Pharmacy & Medication</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">
          Dispense Medication
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="alert-banner-yellow flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium text-sm">{lowStock.length} item(s) below reorder level: {lowStock.map(d => d.name).join(', ')}</span>
        </div>
      )}

      <div className="card-ehr overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-medium">Drug Name</th>
                <th className="text-left px-4 py-2 font-medium">Category</th>
                <th className="text-left px-4 py-2 font-medium">Stock</th>
                <th className="text-left px-4 py-2 font-medium">Reorder Level</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Expiry</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {drugInventory.map(d => (
                <tr key={d.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{d.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{d.category}</td>
                  <td className="px-4 py-2">{d.quantityInStock}</td>
                  <td className="px-4 py-2">{d.reorderLevel}</td>
                  <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">{d.expiryDate}</td>
                  <td className="px-4 py-2">
                    {d.belowReorder ? <span className="badge-warning">Low Stock</span> : <span className="badge-success">In Stock</span>}
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
