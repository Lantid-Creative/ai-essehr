import { staffUsers } from '@/data/mockData';
import { CheckCircle, XCircle } from 'lucide-react';

export default function StaffPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Health Worker Management</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">
          Add Staff
        </button>
      </div>

      <div className="card-ehr overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Last Login</th>
                <th className="text-left px-4 py-2 font-medium">Certified</th>
              </tr>
            </thead>
            <tbody>
              {staffUsers.map(s => (
                <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">{s.role}</td>
                  <td className="px-4 py-2 text-muted-foreground hidden md:table-cell">{s.email}</td>
                  <td className="px-4 py-2 text-muted-foreground hidden lg:table-cell">{s.lastLogin}</td>
                  <td className="px-4 py-2">
                    {s.certified
                      ? <span className="badge-success flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Certified</span>
                      : <span className="badge-warning flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Pending</span>}
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
