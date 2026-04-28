import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp, TrendingDown, Users, Activity, BedDouble, Pill, FlaskConical, ArrowRightLeft,
  Clock, AlertCircle, Heart, DollarSign, Syringe, Stethoscope
} from 'lucide-react';
import { startOfDay, subDays, format, differenceInMinutes, differenceInDays } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

type Range = 7 | 30 | 90;

function KPI({ icon: Icon, label, value, sublabel, trend, target, color = 'primary' }: {
  icon: any; label: string; value: string | number; sublabel?: string;
  trend?: { dir: 'up' | 'down' | 'flat'; pct: number; good: 'up' | 'down' };
  target?: string; color?: 'primary' | 'success' | 'warning' | 'destructive';
}) {
  const trendIsGood = trend && (trend.dir === 'flat' || trend.dir === trend.good);
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className={`p-2 rounded-lg bg-${color}/10`}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
          {trend && (
            <Badge variant={trendIsGood ? 'default' : 'destructive'} className="text-xs gap-1">
              {trend.dir === 'up' ? <TrendingUp className="w-3 h-3" /> : trend.dir === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
              {trend.pct.toFixed(0)}%
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
          {sublabel && <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>}
          {target && <div className="text-xs text-primary mt-1">Target: {target}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FacilityKPIPage() {
  const { facilityId } = useAppContext();
  const [range, setRange] = useState<Range>(30);

  const since = useMemo(() => startOfDay(subDays(new Date(), range)), [range]);
  const sincePrev = useMemo(() => startOfDay(subDays(new Date(), range * 2)), [range]);

  const { data, isLoading } = useQuery({
    queryKey: ['facility-kpis', facilityId, range],
    enabled: !!facilityId,
    queryFn: async () => {
      const sinceISO = since.toISOString();
      const prevISO = sincePrev.toISOString();

      const [encs, encsPrev, patients, appts, beds, labs, invs, refs, drugs, immun] = await Promise.all([
        supabase.from('encounters').select('id, encounter_date, chief_complaint, diagnosis, is_syndromic_alert, patient_id, dispensed_at, created_at').eq('facility_id', facilityId!).gte('encounter_date', sinceISO),
        supabase.from('encounters').select('id, encounter_date').eq('facility_id', facilityId!).gte('encounter_date', prevISO).lt('encounter_date', sinceISO),
        supabase.from('patients').select('id, created_at').eq('facility_id', facilityId!).gte('created_at', sinceISO),
        supabase.from('appointments').select('id, status, checked_in_at, appointment_date, triage_priority').eq('facility_id', facilityId!).gte('appointment_date', format(since, 'yyyy-MM-dd')),
        supabase.from('ward_beds').select('id, status, admission_date, discharge_date').eq('facility_id', facilityId!),
        supabase.from('lab_results').select('id, ordered_at, resulted_at, is_abnormal').eq('facility_id', facilityId!).gte('ordered_at', sinceISO),
        supabase.from('invoices').select('id, total, status, paid_at, created_at').eq('facility_id', facilityId!).gte('created_at', sinceISO),
        supabase.from('patient_referrals').select('id, status, created_at').or(`referring_facility_id.eq.${facilityId},receiving_facility_id.eq.${facilityId}`).gte('created_at', sinceISO),
        supabase.from('drug_inventory').select('id, drug_name, quantity_in_stock, reorder_level, expiry_date').eq('facility_id', facilityId!),
        supabase.from('immunizations').select('id, administered_at').eq('facility_id', facilityId!).gte('administered_at', sinceISO),
      ]);

      return {
        encounters: encs.data ?? [],
        encountersPrev: encsPrev.data ?? [],
        patients: patients.data ?? [],
        appointments: appts.data ?? [],
        beds: beds.data ?? [],
        labs: labs.data ?? [],
        invoices: invs.data ?? [],
        referrals: refs.data ?? [],
        drugs: drugs.data ?? [],
        immunizations: immun.data ?? [],
      };
    },
  });

  const kpis = useMemo(() => {
    if (!data) return null;
    const { encounters, encountersPrev, patients, appointments, beds, labs, invoices, referrals, drugs, immunizations } = data;

    // 1. Total encounters + trend
    const encTrend = encountersPrev.length === 0 ? 0 : ((encounters.length - encountersPrev.length) / encountersPrev.length) * 100;

    // 2. New patients
    const newPatients = patients.length;

    // 3. Avg consultation turnaround (created_at → dispensed_at)
    const dispensed = encounters.filter((e: any) => e.dispensed_at);
    const avgConsultMin = dispensed.length
      ? dispensed.reduce((sum: number, e: any) => sum + differenceInMinutes(new Date(e.dispensed_at), new Date(e.created_at)), 0) / dispensed.length
      : 0;

    // 4. Bed occupancy
    const totalBeds = beds.length;
    const occupied = beds.filter((b: any) => b.status === 'occupied').length;
    const occupancyPct = totalBeds ? (occupied / totalBeds) * 100 : 0;

    // 5. Avg length of stay (discharged beds in window)
    const dischargedRecent = beds.filter((b: any) => b.discharge_date && new Date(b.discharge_date) >= since && b.admission_date);
    const avgLOS = dischargedRecent.length
      ? dischargedRecent.reduce((s: number, b: any) => s + differenceInDays(new Date(b.discharge_date), new Date(b.admission_date)), 0) / dischargedRecent.length
      : 0;

    // 6. Lab turnaround time (ordered → resulted)
    const resulted = labs.filter((l: any) => l.resulted_at);
    const avgLabMin = resulted.length
      ? resulted.reduce((s: number, l: any) => s + differenceInMinutes(new Date(l.resulted_at), new Date(l.ordered_at)), 0) / resulted.length
      : 0;
    const labCompletionPct = labs.length ? (resulted.length / labs.length) * 100 : 0;

    // 7. Referral acceptance rate (referrals we sent)
    const sent = referrals.filter((r: any) => r.status !== 'pending');
    const accepted = referrals.filter((r: any) => r.status === 'accepted' || r.status === 'completed').length;
    const referralAcceptPct = sent.length ? (accepted / sent.length) * 100 : 0;

    // 8. Appointment no-show rate
    const past = appointments.filter((a: any) => a.appointment_date < format(new Date(), 'yyyy-MM-dd') || a.status !== 'scheduled');
    const noShows = appointments.filter((a: any) => a.status === 'no_show').length;
    const noShowPct = past.length ? (noShows / past.length) * 100 : 0;

    // 9. Triage volume
    const emergencies = appointments.filter((a: any) => a.triage_priority === 'emergency' || a.triage_priority === 'urgent').length;

    // 10. Drug stockouts + expiring
    const stockouts = drugs.filter((d: any) => d.quantity_in_stock <= 0).length;
    const lowStock = drugs.filter((d: any) => d.quantity_in_stock > 0 && d.quantity_in_stock <= d.reorder_level).length;
    const expiringSoon = drugs.filter((d: any) => d.expiry_date && differenceInDays(new Date(d.expiry_date), new Date()) <= 30 && differenceInDays(new Date(d.expiry_date), new Date()) >= 0).length;

    // 11. Revenue + collection rate
    const revenue = invoices.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0);
    const paid = invoices.filter((i: any) => i.status === 'paid');
    const paidAmt = paid.reduce((s: number, i: any) => s + Number(i.total ?? 0), 0);
    const collectionPct = revenue ? (paidAmt / revenue) * 100 : 0;

    // 12. Syndromic alerts + immunizations administered
    const syndromicAlerts = encounters.filter((e: any) => e.is_syndromic_alert).length;
    const vaccinesGiven = immunizations.length;

    // Daily encounter trendline
    const dailyMap = new Map<string, number>();
    for (let i = range - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'MMM dd');
      dailyMap.set(d, 0);
    }
    encounters.forEach((e: any) => {
      const k = format(new Date(e.encounter_date), 'MMM dd');
      if (dailyMap.has(k)) dailyMap.set(k, (dailyMap.get(k) ?? 0) + 1);
    });
    const trendData = Array.from(dailyMap, ([day, count]) => ({ day, count }));

    return {
      encCount: encounters.length, encTrend, newPatients, avgConsultMin, occupancyPct, totalBeds, occupied,
      avgLOS, avgLabMin, labCompletionPct, referralAcceptPct, sentRefs: sent.length, noShowPct, emergencies,
      stockouts, lowStock, expiringSoon, totalDrugs: drugs.length, revenue, collectionPct,
      syndromicAlerts, vaccinesGiven, trendData,
    };
  }, [data, range, since]);

  if (isLoading || !kpis) {
    return <div className="p-6 text-center text-muted-foreground">Computing facility KPIs…</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            Facility Performance KPIs
          </h1>
          <p className="text-muted-foreground mt-1">12 standard indicators tracking clinical, operational and financial health.</p>
        </div>
        <Select value={String(range)} onValueChange={(v) => setRange(Number(v) as Range)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top row: 4 headline KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Stethoscope} label="Total Encounters" value={kpis.encCount}
          trend={{ dir: kpis.encTrend > 1 ? 'up' : kpis.encTrend < -1 ? 'down' : 'flat', pct: Math.abs(kpis.encTrend), good: 'up' }}
          sublabel={`vs prior ${range}d`} />
        <KPI icon={Users} label="New Patients" value={kpis.newPatients} sublabel="registered this period" color="success" />
        <KPI icon={Heart} label="Vaccines Administered" value={kpis.vaccinesGiven} sublabel="all schedules" color="success" />
        <KPI icon={AlertCircle} label="Syndromic Alerts" value={kpis.syndromicAlerts} sublabel="auto-flagged cases"
          color={kpis.syndromicAlerts > 0 ? 'destructive' : 'primary'} />
      </div>

      {/* Operational KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Operational</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={Clock} label="Avg Consult Time" value={`${kpis.avgConsultMin.toFixed(0)} min`} target="≤ 45 min"
            color={kpis.avgConsultMin <= 45 ? 'success' : 'warning'} />
          <KPI icon={BedDouble} label="Bed Occupancy" value={`${kpis.occupancyPct.toFixed(0)}%`}
            sublabel={`${kpis.occupied} / ${kpis.totalBeds} beds`} target="65–85%"
            color={kpis.occupancyPct > 85 ? 'destructive' : kpis.occupancyPct < 50 ? 'warning' : 'success'} />
          <KPI icon={BedDouble} label="Avg Length of Stay" value={`${kpis.avgLOS.toFixed(1)} days`} sublabel="discharged inpatients" />
          <KPI icon={Users} label="Appointment No-shows" value={`${kpis.noShowPct.toFixed(0)}%`} target="≤ 15%"
            color={kpis.noShowPct > 15 ? 'warning' : 'success'} />
        </div>
      </div>

      {/* Clinical workflow KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Clinical Workflow</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={FlaskConical} label="Lab Turnaround" value={`${kpis.avgLabMin.toFixed(0)} min`}
            sublabel={`${kpis.labCompletionPct.toFixed(0)}% completed`} target="≤ 120 min"
            color={kpis.avgLabMin <= 120 ? 'success' : 'warning'} />
          <KPI icon={ArrowRightLeft} label="Referral Acceptance" value={`${kpis.referralAcceptPct.toFixed(0)}%`}
            sublabel={`${kpis.sentRefs} referrals sent`} target="≥ 80%"
            color={kpis.referralAcceptPct >= 80 ? 'success' : 'warning'} />
          <KPI icon={AlertCircle} label="Emergency / Urgent" value={kpis.emergencies}
            sublabel="triaged cases" color={kpis.emergencies > 10 ? 'destructive' : 'primary'} />
          <KPI icon={Syringe} label="Vaccine Coverage" value={kpis.vaccinesGiven}
            sublabel={`${(kpis.vaccinesGiven / Math.max(kpis.newPatients, 1)).toFixed(1)} per new patient`} />
        </div>
      </div>

      {/* Pharmacy + Financial */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pharmacy & Financial</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={Pill} label="Drug Stockouts" value={kpis.stockouts}
            sublabel={`of ${kpis.totalDrugs} items`} target="0"
            color={kpis.stockouts > 0 ? 'destructive' : 'success'} />
          <KPI icon={Pill} label="Low Stock" value={kpis.lowStock} sublabel="below reorder level"
            color={kpis.lowStock > 0 ? 'warning' : 'success'} />
          <KPI icon={Pill} label="Expiring < 30 days" value={kpis.expiringSoon}
            color={kpis.expiringSoon > 0 ? 'warning' : 'success'} />
          <KPI icon={DollarSign} label="Collection Rate" value={`${kpis.collectionPct.toFixed(0)}%`}
            sublabel={`₦${kpis.revenue.toLocaleString()} billed`} target="≥ 90%"
            color={kpis.collectionPct >= 90 ? 'success' : 'warning'} />
        </div>
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Daily Encounters Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={kpis.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
