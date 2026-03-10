import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, ArrowUpRight, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Alert = Tables<'surveillance_alerts'>;

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function SurveillancePage() {
  const { facilityId, roles } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const isEpiOrAdmin = roles.some(r => ['epidemiologist', 'dsno', 'super_admin'].includes(r));

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['surveillance', facilityId],
    queryFn: async () => {
      let query = supabase.from('surveillance_alerts').select('*').order('detected_at', { ascending: false });
      // Facility users only see their own; epi/admin see all
      if (!isEpiOrAdmin && facilityId) {
        query = query.eq('facility_id', facilityId);
      }
      const { data } = await query.limit(50);
      return (data || []).sort((a, b) =>
        (SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] ?? 3) - (SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER] ?? 3)
      );
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('surveillance-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surveillance_alerts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['surveillance'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Get encounter-based disease counts for chart
  const { data: encounterStats = [] } = useQuery({
    queryKey: ['encounter-stats', facilityId],
    queryFn: async () => {
      let query = supabase.from('encounters').select('encounter_date, syndromic_flags, is_syndromic_alert')
        .eq('is_syndromic_alert', true);
      if (!isEpiOrAdmin && facilityId) {
        query = query.eq('facility_id', facilityId);
      }
      const { data } = await query.limit(500);
      if (!data) return [];

      // Group by week
      const weekMap: Record<string, Record<string, number>> = {};
      data.forEach(e => {
        const d = new Date(e.encounter_date);
        const week = `W${Math.ceil((d.getDate()) / 7)}`;
        if (!weekMap[week]) weekMap[week] = {};
        const flags = (e.syndromic_flags as string[]) || [];
        flags.forEach(f => {
          const key = f.toLowerCase().replace(' ', '_');
          weekMap[week][key] = (weekMap[week][key] || 0) + 1;
        });
      });

      return Object.entries(weekMap).map(([week, counts]) => ({ week, ...counts }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === 'resolved') updates.resolved_at = new Date().toISOString();
      const { error } = await supabase.from('surveillance_alerts').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveillance'] });
      toast({ title: 'Alert updated' });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const alert = alerts.find(a => a.id === id);
      const existingNotes = alert?.notes || '';
      const updatedNotes = existingNotes ? `${existingNotes}\n${new Date().toLocaleString()}: ${note}` : `${new Date().toLocaleString()}: ${note}`;
      const { error } = await supabase.from('surveillance_alerts').update({ notes: updatedNotes }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['surveillance'] });
      setNoteInputs(prev => ({ ...prev, [id]: '' }));
    },
  });

  const activeAlerts = alerts.filter(a => a.status !== 'resolved' && a.status !== 'dismissed');
  const diseaseCounts = activeAlerts.reduce<Record<string, number>>((acc, a) => {
    acc[a.disease_name] = (acc[a.disease_name] || 0) + a.case_count;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Disease Surveillance & Outbreak Alerts</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Active Alerts */}
          <div className="space-y-3">
            <h2 className="font-heading font-medium text-sm">Active Alerts ({activeAlerts.length})</h2>
            {activeAlerts.length === 0 && (
              <div className="card-ehr p-8 text-center text-muted-foreground text-sm">No active alerts. Alerts are automatically created when syndromic patterns are detected during consultations.</div>
            )}
            {activeAlerts.map(a => (
              <div key={a.id} className={`card-ehr p-4 border-l-4 ${
                a.severity === 'critical' ? 'border-l-destructive' : a.severity === 'high' ? 'border-l-warning' : 'border-l-accent'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${a.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />
                      <span className="font-heading font-medium">{a.disease_name}</span>
                      <span className={a.severity === 'critical' ? 'badge-danger' : a.severity === 'high' ? 'badge-warning' : 'badge-accent'}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {a.district && `${a.district}, `}{a.region && `${a.region} · `}{a.case_count} case(s) · {new Date(a.detected_at).toLocaleDateString()}
                    </p>
                    {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">Status: <strong>{a.status}</strong></p>
                  </div>
                  {isEpiOrAdmin && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="gap-1 text-xs"
                        onClick={() => updateStatusMutation.mutate({ id: a.id, status: 'investigating' })}>
                        <ArrowUpRight className="h-3 w-3" /> Investigate
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs"
                        onClick={() => updateStatusMutation.mutate({ id: a.id, status: 'resolved' })}>
                        <CheckCircle className="h-3 w-3" /> Resolve
                      </Button>
                    </div>
                  )}
                </div>
                {/* Notes */}
                {a.notes && (
                  <div className="mt-3 space-y-1">
                    {a.notes.split('\n').map((n, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1"><MessageSquare className="h-3 w-3 mt-0.5 shrink-0" /> {n}</p>
                    ))}
                  </div>
                )}
                {isEpiOrAdmin && (
                  <div className="mt-2 flex gap-2">
                    <input type="text" placeholder="Add investigation note..." value={noteInputs[a.id] || ''}
                      onChange={e => setNoteInputs(prev => ({ ...prev, [a.id]: e.target.value }))}
                      className="flex-1 px-3 py-1.5 border border-input rounded bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                    <Button size="sm" variant="secondary"
                      onClick={() => noteInputs[a.id] && addNoteMutation.mutate({ id: a.id, note: noteInputs[a.id] })}>
                      Add Note
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Disease counts + chart */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card-ehr p-4">
              <h2 className="font-heading font-medium text-sm mb-3">Active Disease Case Counts</h2>
              {Object.keys(diseaseCounts).length === 0 ? (
                <p className="text-sm text-muted-foreground">No active cases.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(diseaseCounts).map(([disease, count]) => (
                    <div key={disease} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                      <span>{disease}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count} case(s)</span>
                        <span className={count >= 5 ? 'badge-danger' : count >= 3 ? 'badge-warning' : 'badge-success'}>
                          {count >= 5 ? 'Above Threshold' : count >= 3 ? 'Approaching' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-ehr p-4">
              <h2 className="font-heading font-medium text-sm mb-3">Syndromic Encounter Trends</h2>
              {encounterStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={encounterStats}>
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="lassa_fever" fill="hsl(4, 70%, 46%)" name="Lassa" />
                    <Bar dataKey="cholera" fill="hsl(28, 80%, 52%)" name="Cholera" />
                    <Bar dataKey="measles" fill="hsl(43, 80%, 46%)" name="Measles" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No syndromic encounter data yet. Charts will populate as consultations are recorded.</p>
              )}
            </div>
          </div>

          {/* All Alerts Log */}
          <div className="card-ehr overflow-hidden">
            <h2 className="font-heading font-medium text-sm px-4 pt-4 pb-2">Alert History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-4 py-2 font-medium">Date</th>
                    <th className="text-left px-4 py-2 font-medium">Disease</th>
                    <th className="text-left px-4 py-2 font-medium">Severity</th>
                    <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Cases</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(a => (
                    <tr key={a.id} className="border-b border-border">
                      <td className="px-4 py-2">{new Date(a.detected_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 font-medium">{a.disease_name}</td>
                      <td className="px-4 py-2">
                        <span className={a.severity === 'critical' ? 'badge-danger' : a.severity === 'high' ? 'badge-warning' : 'badge-accent'}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">{a.case_count}</td>
                      <td className="px-4 py-2 capitalize">{a.status}</td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No alerts recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
