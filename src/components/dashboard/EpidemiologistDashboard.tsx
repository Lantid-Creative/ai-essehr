import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function EpidemiologistDashboard() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['epi-alerts'],
    queryFn: async () => {
      const { data } = await supabase.from('surveillance_alerts').select('*')
        .in('status', ['pending', 'investigating', 'confirmed'])
        .order('detected_at', { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const { data: encounterStats = [] } = useQuery({
    queryKey: ['epi-encounter-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('encounters').select('encounter_date, syndromic_flags')
        .eq('is_syndromic_alert', true).limit(500);
      if (!data) return [];
      const weekMap: Record<string, Record<string, number>> = {};
      data.forEach(e => {
        const d = new Date(e.encounter_date);
        const weekNum = Math.ceil(d.getDate() / 7);
        const week = `W${weekNum}`;
        if (!weekMap[week]) weekMap[week] = {};
        const flags = (e.syndromic_flags as string[]) || [];
        flags.forEach(f => { weekMap[week][f] = (weekMap[week][f] || 0) + 1; });
      });
      return Object.entries(weekMap).map(([week, counts]) => ({ week, ...counts }));
    },
  });

  // Group alerts by region/district
  const regionCounts = alerts.reduce<Record<string, { cases: number; severity: string }>>((acc, a) => {
    const key = a.region || a.district || 'Unknown';
    if (!acc[key]) acc[key] = { cases: 0, severity: 'low' };
    acc[key].cases += a.case_count;
    if (['critical', 'high'].includes(a.severity)) acc[key].severity = a.severity;
    return acc;
  }, {});

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-heading font-medium">Epidemiologist Dashboard</h1>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Active Alerts ({alerts.length})</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
                a.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                a.severity === 'high' ? 'bg-warning/10 text-warning' :
                'bg-accent/10 text-accent'
              }`}>
                <span className="font-medium">{a.disease_name}{a.district ? ` — ${a.district}` : ''}</span>
                <span>{a.case_count} case(s) · {a.severity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Top Regions by Case Count</h2>
          {Object.keys(regionCounts).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(regionCounts).sort((a, b) => b[1].cases - a[1].cases).slice(0, 10).map(([region, data]) => (
                <div key={region} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span>{region}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.cases}</span>
                    <span className={data.severity === 'critical' || data.severity === 'high' ? 'badge-danger' : 'badge-success'}>{data.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Syndromic Trends</h2>
          {encounterStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={encounterStats}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Lassa Fever" fill="hsl(4, 70%, 46%)" name="Lassa" />
                <Bar dataKey="Cholera" fill="hsl(28, 80%, 52%)" name="Cholera" />
                <Bar dataKey="Measles" fill="hsl(43, 80%, 46%)" name="Measles" />
                <Bar dataKey="Meningitis" fill="hsl(153, 100%, 26.5%)" name="Meningitis" />
                <Bar dataKey="Diphtheria" fill="hsl(0, 0%, 40%)" name="Diphtheria" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No syndromic encounter data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
