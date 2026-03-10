import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function NCDCDashboard() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['ncdc-alerts'],
    queryFn: async () => {
      const { data } = await supabase.from('surveillance_alerts').select('*')
        .order('detected_at', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ['ncdc-facilities'],
    queryFn: async () => {
      const { data } = await supabase.from('facilities').select('id, name, region, status').limit(100);
      return data || [];
    },
  });

  const { data: encounterStats = [] } = useQuery({
    queryKey: ['ncdc-encounter-stats'],
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

  const activeAlerts = alerts.filter(a => a.status !== 'resolved' && a.status !== 'dismissed');

  // Group by region
  const regionRisk = alerts.reduce<Record<string, { cases: number; severity: string }>>((acc, a) => {
    const key = a.region || 'Unknown';
    if (!acc[key]) acc[key] = { cases: 0, severity: 'low' };
    acc[key].cases += a.case_count;
    if (['critical', 'high'].includes(a.severity)) acc[key].severity = a.severity;
    return acc;
  }, {});

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-medium">National Overview</h1>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">{facilities.length} registered facilities</span>
        </div>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Real-time Alert Feed ({activeAlerts.length} active)</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activeAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active alerts across the system.</p>
          ) : (
            activeAlerts.map(a => (
              <div key={a.id} className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
                a.severity === 'critical' ? 'bg-destructive/10' : a.severity === 'high' ? 'bg-warning/10' : 'bg-accent/10'
              }`}>
                <span className="font-medium">{a.disease_name}{a.district ? ` — ${a.district}` : ''}{a.region ? `, ${a.region}` : ''}</span>
                <div className="flex items-center gap-2">
                  <span>{a.case_count} case(s)</span>
                  <span className={a.severity === 'critical' ? 'badge-danger' : a.severity === 'high' ? 'badge-warning' : 'badge-accent'}>
                    {a.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Alert Risk by Region</h2>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {Object.keys(regionRisk).length === 0 ? (
              <p className="text-sm text-muted-foreground">No regional data yet.</p>
            ) : (
              Object.entries(regionRisk).sort((a, b) => b[1].cases - a[1].cases).map(([region, data]) => (
                <div key={region} className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-muted/50 rounded">
                  <span>{region}</span>
                  <span className={data.severity === 'high' || data.severity === 'critical' ? 'badge-danger' : 'badge-success'}>{data.cases} cases</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">National Case Trends</h2>
          {encounterStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={encounterStats}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Lassa Fever" stroke="hsl(4, 70%, 46%)" strokeWidth={2} name="Lassa" />
                <Line type="monotone" dataKey="Cholera" stroke="hsl(28, 80%, 52%)" strokeWidth={2} name="Cholera" />
                <Line type="monotone" dataKey="Measles" stroke="hsl(43, 80%, 46%)" strokeWidth={2} name="Measles" />
                <Line type="monotone" dataKey="Meningitis" stroke="hsl(153, 100%, 26.5%)" strokeWidth={2} name="Meningitis" />
                <Line type="monotone" dataKey="Diphtheria" stroke="hsl(0, 0%, 40%)" strokeWidth={2} name="Diphtheria" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No syndromic data yet. Trends will appear as facilities record consultations.</p>
          )}
        </div>
      </div>
    </div>
  );
}
