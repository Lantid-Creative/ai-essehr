import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Printer, Download, FileText, AlertTriangle } from 'lucide-react';
import { format, startOfISOWeek, endOfISOWeek, getISOWeek, getISOWeekYear, addWeeks, subWeeks } from 'date-fns';

// NCDC IDSR Priority diseases (subset most actionable in our schema)
const IDSR_DISEASES = [
  { name: 'Lassa Fever', synonyms: ['lassa', 'lassa fever'], threshold: 1 },
  { name: 'Cholera', synonyms: ['cholera', 'acute watery diarrhea', 'awd'], threshold: 1 },
  { name: 'Cerebrospinal Meningitis (CSM)', synonyms: ['meningitis', 'csm'], threshold: 1 },
  { name: 'Measles', synonyms: ['measles'], threshold: 1 },
  { name: 'Diphtheria', synonyms: ['diphtheria'], threshold: 1 },
  { name: 'Yellow Fever', synonyms: ['yellow fever'], threshold: 1 },
  { name: 'Monkeypox / Mpox', synonyms: ['monkeypox', 'mpox'], threshold: 1 },
  { name: 'COVID-19', synonyms: ['covid', 'covid-19', 'sars-cov-2'], threshold: 1 },
  { name: 'AFP (Polio)', synonyms: ['afp', 'acute flaccid paralysis', 'polio'], threshold: 1 },
  { name: 'Maternal Death', synonyms: ['maternal death'], threshold: 1 },
];

type AgeBand = '<5' | '5-14' | '15-44' | '45+' | 'unknown';

function ageBand(dob: string | null): AgeBand {
  if (!dob) return 'unknown';
  const years = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years < 5) return '<5';
  if (years < 15) return '5-14';
  if (years < 45) return '15-44';
  return '45+';
}

function matchDisease(text: string): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  for (const d of IDSR_DISEASES) {
    if (d.synonyms.some(s => t.includes(s))) return d.name;
  }
  return null;
}

export default function IDSRWeeklyReportPage() {
  const { facilityId, profile } = useAppContext();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week

  const reference = useMemo(() => {
    const base = weekOffset >= 0 ? addWeeks(new Date(), weekOffset) : subWeeks(new Date(), Math.abs(weekOffset));
    return {
      start: startOfISOWeek(base),
      end: endOfISOWeek(base),
      epiWeek: getISOWeek(base),
      epiYear: getISOWeekYear(base),
    };
  }, [weekOffset]);

  const { data: facility } = useQuery({
    queryKey: ['facility-info', facilityId],
    enabled: !!facilityId,
    queryFn: async () => {
      const { data } = await supabase.from('facilities').select('*').eq('id', facilityId!).maybeSingle();
      return data;
    },
  });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['idsr-week', facilityId, reference.epiYear, reference.epiWeek],
    enabled: !!facilityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('encounters')
        .select('id, encounter_date, diagnosis, chief_complaint, symptoms, syndromic_flags, is_syndromic_alert, patient_id, patients!inner(date_of_birth, gender)')
        .eq('facility_id', facilityId!)
        .gte('encounter_date', reference.start.toISOString())
        .lte('encounter_date', reference.end.toISOString());
      if (error) throw error;
      return data ?? [];
    },
  });

  // Aggregate by disease + age/sex/outcome
  const aggregated = useMemo(() => {
    const map = new Map<string, { cases: number; deaths: number; ageBands: Record<AgeBand, number>; male: number; female: number }>();

    for (const d of IDSR_DISEASES) {
      map.set(d.name, { cases: 0, deaths: 0, ageBands: { '<5': 0, '5-14': 0, '15-44': 0, '45+': 0, unknown: 0 }, male: 0, female: 0 });
    }

    for (const enc of rows as any[]) {
      const haystack = [
        enc.diagnosis ?? '',
        enc.chief_complaint ?? '',
        Array.isArray(enc.symptoms) ? enc.symptoms.join(' ') : '',
        Array.isArray(enc.syndromic_flags) ? enc.syndromic_flags.join(' ') : '',
      ].join(' ');
      const match = matchDisease(haystack);
      if (!match) continue;
      const bucket = map.get(match)!;
      bucket.cases += 1;
      const band = ageBand(enc.patients?.date_of_birth);
      bucket.ageBands[band] += 1;
      const g = (enc.patients?.gender ?? '').toLowerCase();
      if (g === 'male') bucket.male += 1;
      else if (g === 'female') bucket.female += 1;
      if (/death|deceased|died/i.test(haystack)) bucket.deaths += 1;
    }
    return map;
  }, [rows]);

  const totals = useMemo(() => {
    let cases = 0, deaths = 0, alerts = 0;
    aggregated.forEach(v => { cases += v.cases; deaths += v.deaths; });
    alerts = (rows as any[]).filter(r => r.is_syndromic_alert).length;
    return { cases, deaths, alerts, cfr: cases ? ((deaths / cases) * 100).toFixed(1) : '0.0' };
  }, [aggregated, rows]);

  const printReport = () => window.print();

  const exportCSV = () => {
    const lines = ['Disease,Cases,Deaths,CFR%,<5,5-14,15-44,45+,Unknown,Male,Female,Threshold,Alert'];
    aggregated.forEach((v, k) => {
      const t = IDSR_DISEASES.find(d => d.name === k)!;
      const cfr = v.cases ? ((v.deaths / v.cases) * 100).toFixed(1) : '0.0';
      const alert = v.cases >= t.threshold ? 'YES' : 'NO';
      lines.push([k, v.cases, v.deaths, cfr, v.ageBands['<5'], v.ageBands['5-14'], v.ageBands['15-44'], v.ageBands['45+'], v.ageBands.unknown, v.male, v.female, t.threshold, alert].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IDSR_Week${reference.epiWeek}_${reference.epiYear}_${facility?.facility_code ?? 'facility'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 print:p-0">
      {/* Toolbar (hidden in print) */}
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            IDSR Weekly Report
          </h1>
          <p className="text-muted-foreground mt-1">
            NCDC-aligned Integrated Disease Surveillance & Response — submitted weekly by facilities to LGA/State.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={String(weekOffset)} onValueChange={(v) => setWeekOffset(Number(v))}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">This week (current)</SelectItem>
              <SelectItem value="-1">Last week</SelectItem>
              <SelectItem value="-2">2 weeks ago</SelectItem>
              <SelectItem value="-3">3 weeks ago</SelectItem>
              <SelectItem value="-4">4 weeks ago</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          <Button onClick={printReport}><Printer className="w-4 h-4 mr-1" />Print / PDF</Button>
        </div>
      </div>

      {/* Printable report */}
      <div className="space-y-4 print:space-y-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>IDSR Form 002 — Weekly Epidemiological Report</span>
              <Badge variant="outline">Epi Week {reference.epiWeek} / {reference.epiYear}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><div className="text-muted-foreground">Facility</div><div className="font-semibold">{facility?.name ?? '—'}</div></div>
              <div><div className="text-muted-foreground">Facility code</div><div className="font-semibold">{facility?.facility_code ?? '—'}</div></div>
              <div><div className="text-muted-foreground">Region / LGA</div><div className="font-semibold">{facility?.region ?? '—'} / {facility?.district ?? '—'}</div></div>
              <div><div className="text-muted-foreground">Reporting period</div><div className="font-semibold">{format(reference.start, 'dd MMM')} – {format(reference.end, 'dd MMM yyyy')}</div></div>
              <div><div className="text-muted-foreground">Reported by</div><div className="font-semibold">{profile?.full_name ?? '—'}</div></div>
              <div><div className="text-muted-foreground">Submission date</div><div className="font-semibold">{format(new Date(), 'dd MMM yyyy')}</div></div>
              <div><div className="text-muted-foreground">Total cases</div><div className="font-semibold text-primary">{totals.cases}</div></div>
              <div><div className="text-muted-foreground">Total deaths (CFR)</div><div className="font-semibold text-destructive">{totals.deaths} ({totals.cfr}%)</div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Priority diseases under surveillance</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading encounters…</div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-semibold">Disease / Condition</th>
                    <th className="text-center p-2">&lt;5</th>
                    <th className="text-center p-2">5–14</th>
                    <th className="text-center p-2">15–44</th>
                    <th className="text-center p-2">45+</th>
                    <th className="text-center p-2">M</th>
                    <th className="text-center p-2">F</th>
                    <th className="text-center p-2 font-bold">Cases</th>
                    <th className="text-center p-2 font-bold">Deaths</th>
                    <th className="text-center p-2">CFR%</th>
                    <th className="text-center p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {IDSR_DISEASES.map(d => {
                    const v = aggregated.get(d.name)!;
                    const cfr = v.cases ? ((v.deaths / v.cases) * 100).toFixed(1) : '0.0';
                    const alert = v.cases >= d.threshold;
                    return (
                      <tr key={d.name} className={`border-b ${alert ? 'bg-destructive/5' : ''}`}>
                        <td className="p-2 font-medium">{d.name}</td>
                        <td className="text-center p-2">{v.ageBands['<5']}</td>
                        <td className="text-center p-2">{v.ageBands['5-14']}</td>
                        <td className="text-center p-2">{v.ageBands['15-44']}</td>
                        <td className="text-center p-2">{v.ageBands['45+']}</td>
                        <td className="text-center p-2">{v.male}</td>
                        <td className="text-center p-2">{v.female}</td>
                        <td className="text-center p-2 font-bold">{v.cases}</td>
                        <td className="text-center p-2 font-bold text-destructive">{v.deaths}</td>
                        <td className="text-center p-2">{cfr}%</td>
                        <td className="text-center p-2">
                          {alert ? (
                            <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Notify LGA</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Monitor</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/30">
                    <td className="p-2">TOTAL</td>
                    <td colSpan={6}></td>
                    <td className="text-center p-2">{totals.cases}</td>
                    <td className="text-center p-2 text-destructive">{totals.deaths}</td>
                    <td className="text-center p-2">{totals.cfr}%</td>
                    <td className="text-center p-2">{totals.alerts} syndromic</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1"><FileText className="w-3 h-3" />This report follows NCDC IDSR Technical Guidelines (3rd edition). Any disease meeting its alert threshold must be reported to the LGA DSNO within 24 hours.</p>
            <p>Data source: Integra+ clinical encounters · facility {facility?.facility_code ?? '—'} · generated {format(new Date(), 'PPpp')}</p>
            <div className="grid grid-cols-2 gap-8 mt-6 print:mt-12">
              <div>
                <div className="border-t pt-1 mt-8">Reported by (DSNO / Records Officer)</div>
                <div className="text-xs">Name & signature</div>
              </div>
              <div>
                <div className="border-t pt-1 mt-8">LGA / State received by</div>
                <div className="text-xs">Name, signature, date</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          aside, header, nav { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
