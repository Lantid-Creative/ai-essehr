import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { Loader2, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = ['hsl(153, 100%, 26.5%)', 'hsl(28, 80%, 52%)', 'hsl(4, 70%, 46%)', 'hsl(43, 80%, 46%)', 'hsl(160, 30%, 22%)', 'hsl(200, 60%, 50%)'];

interface ReportType {
  name: string;
  description: string;
  generator: () => void;
}

export default function ReportsPage() {
  const { facilityId, roles } = useAppContext();
  const isNational = roles.some(r => ['super_admin', 'epidemiologist', 'dsno'].includes(r));
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['report-stats', facilityId, isNational],
    queryFn: async () => {
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
        facilityFilter
          ? supabase.from('immunizations').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId)
          : supabase.from('immunizations').select('id', { count: 'exact', head: true }),
      ];
      const [pRes, eRes, sRes, lRes, iRes] = await Promise.all(queries);
      return {
        patients: pRes.count || 0,
        encounters: eRes.count || 0,
        syndromic: sRes.count || 0,
        labs: lRes.count || 0,
        immunizations: iRes.count || 0,
      };
    },
  });

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

  // Gender distribution
  const { data: genderData = [] } = useQuery({
    queryKey: ['report-gender', facilityId, isNational],
    queryFn: async () => {
      let query = supabase.from('patients').select('gender');
      if (!isNational && facilityId) query = query.eq('facility_id', facilityId);
      const { data } = await query.limit(500);
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach(p => { const g = p.gender || 'unknown'; counts[g] = (counts[g] || 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    },
  });

  // Lab test distribution
  const { data: labDistribution = [] } = useQuery({
    queryKey: ['report-lab-dist', facilityId, isNational],
    queryFn: async () => {
      let query = supabase.from('lab_results').select('test_category');
      if (!isNational && facilityId) query = query.eq('facility_id', facilityId);
      const { data } = await query.limit(500);
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach(l => { const cat = l.test_category || 'Other'; counts[cat] = (counts[cat] || 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  const generatePrintableReport = (reportName: string) => {
    setGeneratingReport(reportName);
    setTimeout(() => {
      const win = window.open('', '_blank');
      if (!win) { setGeneratingReport(null); return; }

      const today = new Date().toLocaleDateString();
      win.document.write(`
        <html><head><title>${reportName} - ${today}</title>
        <style>
          body{font-family:'Source Sans 3',sans-serif;padding:30px;font-size:14px;color:#1a1a1a}
          h1{font-size:22px;color:#006B3C;border-bottom:2px solid #006B3C;padding-bottom:8px}
          h2{font-size:16px;margin-top:24px;color:#2D4A3E}
          .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
          .stat{display:inline-block;padding:12px 20px;background:#f5f5f5;border-radius:6px;margin:4px;text-align:center}
          .stat .value{font-size:24px;font-weight:700;color:#006B3C}
          .stat .label{font-size:11px;color:#666}
          table{width:100%;border-collapse:collapse;margin-top:12px}
          td,th{border:1px solid #ddd;padding:8px;text-align:left}
          th{background:#006B3C;color:white;font-size:12px}
          .footer{margin-top:40px;border-top:1px solid #ddd;padding-top:12px;font-size:11px;color:#999}
          @media print{body{padding:15px}}
        </style></head><body>
        <div class="header">
          <div>
            <h1>AI-ESS EHR — ${reportName}</h1>
            <p style="color:#666">Generated: ${new Date().toLocaleString()}</p>
          </div>
        </div>
        <div>
          <div class="stat"><div class="value">${stats?.patients || 0}</div><div class="label">Total Patients</div></div>
          <div class="stat"><div class="value">${stats?.encounters || 0}</div><div class="label">Total Encounters</div></div>
          <div class="stat"><div class="value">${stats?.syndromic || 0}</div><div class="label">Syndromic Flags</div></div>
          <div class="stat"><div class="value">${stats?.labs || 0}</div><div class="label">Lab Tests</div></div>
          <div class="stat"><div class="value">${stats?.immunizations || 0}</div><div class="label">Immunizations</div></div>
        </div>

        <h2>Encounter Type Distribution</h2>
        <table>
          <tr><th>Type</th><th>Count</th><th>%</th></tr>
          ${encounterTypes.map(e => `<tr><td style="text-transform:capitalize">${e.name}</td><td>${e.value}</td><td>${stats?.encounters ? ((e.value / stats.encounters) * 100).toFixed(1) : 0}%</td></tr>`).join('')}
        </table>

        <h2>Patient Gender Distribution</h2>
        <table>
          <tr><th>Gender</th><th>Count</th></tr>
          ${genderData.map(g => `<tr><td>${g.name}</td><td>${g.value}</td></tr>`).join('')}
        </table>

        <h2>Laboratory Test Categories</h2>
        <table>
          <tr><th>Category</th><th>Count</th></tr>
          ${labDistribution.map(l => `<tr><td>${l.name}</td><td>${l.value}</td></tr>`).join('')}
        </table>

        <div class="footer">
          <p>This report was auto-generated by AI-ESS EHR Platform. Data is accurate as of ${new Date().toLocaleString()}.</p>
          <p>Confidential — For authorized personnel only.</p>
        </div>
        </body></html>
      `);
      win.document.close();
      win.print();
      setGeneratingReport(null);
    }, 500);
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const reports: ReportType[] = [
    { name: 'Daily Summary Report', description: 'Patient visits, diagnoses, and key metrics for today', generator: () => generatePrintableReport('Daily Summary Report') },
    { name: 'Weekly HMIS 035B Report', description: 'IDSR weekly epidemiological report', generator: () => generatePrintableReport('Weekly HMIS 035B Report') },
    { name: 'Monthly Facility Report', description: 'Comprehensive monthly facility performance data', generator: () => generatePrintableReport('Monthly Facility Report') },
    { name: 'Outbreak Situation Report', description: 'Syndromic surveillance and outbreak status', generator: () => generatePrintableReport('Outbreak Situation Report') },
    { name: 'Disease-Specific Report', description: 'Case counts and trends for notifiable diseases', generator: () => generatePrintableReport('Disease-Specific Report') },
    { name: 'Facility Performance Scorecard', description: 'KPIs and service delivery metrics', generator: () => generatePrintableReport('Facility Performance Scorecard') },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Reports & Analytics</h1>

      {/* Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{stats?.encounters || 0}</p><p className="text-xs text-muted-foreground">Consultations</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{stats?.patients || 0}</p><p className="text-xs text-muted-foreground">Patients</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-warning">{stats?.syndromic || 0}</p><p className="text-xs text-muted-foreground">Syndromic Flags</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-primary">{stats?.labs || 0}</p><p className="text-xs text-muted-foreground">Lab Tests</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-accent">{stats?.immunizations || 0}</p><p className="text-xs text-muted-foreground">Immunizations</p></div>
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

        {/* Gender Distribution */}
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Patient Gender Distribution</h2>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet.</p>
          )}
        </div>

        {/* Lab Test Categories */}
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Lab Test Categories</h2>
          {labDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={labDistribution}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(160, 30%, 22%)" name="Tests" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No lab data yet.</p>
          )}
        </div>
      </div>

      {/* Available Reports */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Generate Reports</h2>
        <div className="space-y-2">
          {reports.map(r => (
            <div key={r.name} className="flex items-center justify-between border border-border rounded p-3 text-sm hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={r.generator} disabled={generatingReport === r.name} className="gap-1">
                {generatingReport === r.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />}
                Generate
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
