import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Loader2, Shield, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const ACTION_COLORS: Record<string, string> = {
  create: 'badge-success',
  update: 'badge-accent',
  dispense: 'badge-warning',
  delete: 'badge-danger',
};

export default function AuditLogPage() {
  const { facilityId } = useAppContext();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', facilityId],
    queryFn: async () => {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
      if (facilityId) query = query.eq('facility_id', facilityId);
      const { data } = await query;
      return data || [];
    },
  });

  const filteredLogs = logs.filter((log: any) => {
    if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      const detailStr = JSON.stringify(log.details || {}).toLowerCase();
      if (!log.entity_type.toLowerCase().includes(searchLower) && !log.action.toLowerCase().includes(searchLower) && !detailStr.includes(searchLower)) return false;
    }
    return true;
  });

  const entityTypes = [...new Set(logs.map((l: any) => l.entity_type))];
  const actionTypes = [...new Set(logs.map((l: any) => l.action))];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-heading font-medium">Audit Trail</h1>
        <span className="text-xs text-muted-foreground ml-2">({filteredLogs.length} entries)</span>
      </div>

      {/* Filters */}
      <div className="card-ehr p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search audit logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Entity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityTypes.map(t => (
                <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap text-xs">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={ACTION_COLORS[log.action] || 'badge-accent'}>{log.action}</span>
                    </td>
                    <td className="px-4 py-2 capitalize font-medium">{log.entity_type.replace('_', ' ')}</td>
                    <td className="px-4 py-2 text-muted-foreground hidden md:table-cell max-w-xs">
                      {log.details ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(log.details as Record<string, any>).slice(0, 3).map(([k, v]) => (
                            <span key={k} className="text-xs bg-muted px-1.5 py-0.5 rounded">{k}: {String(v).slice(0, 30)}</span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No audit logs found matching your filters.
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
