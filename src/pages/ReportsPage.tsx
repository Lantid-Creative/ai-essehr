import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

const COLORS = ['hsl(153, 100%, 26.5%)', 'hsl(28, 80%, 52%)', 'hsl(4, 70%, 46%)', 'hsl(43, 80%, 46%)', 'hsl(160, 30%, 22%)'];

export default function ReportsPage() {
  const { facilityId, roles } = useAppContext();
  const isNational = roles.some(r => ['super_admin', 'epidemiologist', 'dsno'].includes(r));

  const { data: stats, isLoading } = useQuery({
    queryKey: ['report-stats', facilityId, isNational],
    queryFn: async () => {
      const baseQuery = isNational ? supabase : supabase;
      const facilityFilter = !isNational && facilityId;

      const queries = [
        facilityFilter
          ? supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId)
          : supabase.from('patients').select('id', { count: 'exact', head: true }),
        facilityFilter
          ? supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId)
          : supabase.from('encounters').select('id', { count: 'exact', head: true }),
        facilityFilter
          ? supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).eq('is_syndromic_alert', true)
          : supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('is_syndromic_alert', true),
        facilityFilter
          ? supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId)
          : supabase.from('lab_results').select('id', { count: 'exact', head: true }),
      ];

      const [pRes, eRes, sRes, lRes] = await Promise.all(queries);
      return {
        patients: pRes.count || 0,
        encounters: eRes.count || 0,
        syndromic: sRes.count || 0,
        labs: lRes.count || 0,
      };
    },
  });

  // Encounter type distribution
  const { data: encounterTypes = [] } = useQuery({
    queryKey: ['report-encounter-types', facilityId, isNational],
    queryFn: async () => {
      let query = supabase.from('encounters').select('encounter_type');
      if (!isNational && facilityId) query = query.eq('facility_id', facilityId);
      const { data } = await query.limit(500);
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach(e => { counts[e.encounter_type] = (counts[e.encounter_type] || 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  // Encounter trend by date
  const { data: encounterTrend = [] } = useQuery({
    queryKey: ['report-encounter-trend', facilityId, isNational],
    queryFn: async () => {
      let query = supabase.from('encounters').select('encounter_date');
      if (!isNational && facilityId) query = query.eq('facility_id', facilityId);
      const { data } = await query.order('encounter_date', { ascending: true }).limit(500);
      if (!data) return [];
      const dayMap: Record<string, number> = {};
      data.forEach(e => {
        const day = new Date(e.encounter_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Reports & Analytics</h1>

      {/* Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{stats?.encounters || 0}</p><p className="text-xs text-muted-foreground">Total Consultations</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{stats?.patients || 0}</p><p className="text-xs text-muted-foreground">Registered Patients</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-warning">{stats?.syndromic || 0}</p><p className="text-xs text-muted-foreground">Syndromic Flags</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-primary">{stats?.labs || 0}</p><p className="text-xs text-muted-foreground">Lab Tests</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Encounter Trend */}
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Encounter Trend</h2>
          {encounterTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={encounterTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(153, 100%, 26.5%)" strokeWidth={2} name="Encounters" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No encounter data yet.</p>
          )}
        </div>

        {/* Encounter Type Distribution */}
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Encounter Types</h2>
          {encounterTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={encounterTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {encounterTypes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet.</p>
          )}
        </div>
      </div>

      {/* Available Reports */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Available Reports</h2>
        <div className="space-y-2">
          {['Daily Summary Report', 'Weekly HMIS 035B Report', 'Monthly Facility Report', 'Outbreak Situation Report', 'Disease-Specific Report', 'Facility Performance Scorecard'].map(r => (
            <div key={r} className="flex items-center justify-between border border-border rounded p-3 text-sm hover:bg-muted/30">
              <span>{r}</span>
              <button className="text-primary text-xs hover:underline">Generate</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}