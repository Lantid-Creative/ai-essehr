import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Loader2, Shield } from 'lucide-react';

export default function AuditLogPage() {
  const { facilityId } = useAppContext();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', facilityId],
    queryFn: async () => {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (facilityId) query = query.eq('facility_id', facilityId);
      const { data } = await query;
      return data || [];
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-heading font-medium">Audit Trail</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="card-ehr overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-2 font-medium">Date/Time</th>
                  <th className="text-left px-4 py-2 font-medium">Action</th>
                  <th className="text-left px-4 py-2 font-medium">Entity</th>
                  <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 font-medium capitalize">{log.action}</td>
                    <td className="px-4 py-2 capitalize">{log.entity_type}</td>
                    <td className="px-4 py-2 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 100) : '—'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No audit logs recorded yet. Actions will be logged as you use the system.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
