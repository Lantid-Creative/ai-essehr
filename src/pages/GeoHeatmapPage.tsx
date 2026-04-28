import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Activity, AlertTriangle, Users } from 'lucide-react';
import { subDays, startOfDay } from 'date-fns';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

const DISEASES = [
  { name: 'All Priority Diseases', synonyms: [] as string[], color: '#0f766e' },
  { name: 'Lassa Fever', synonyms: ['lassa'], color: '#b91c1c' },
  { name: 'Cholera', synonyms: ['cholera', 'awd', 'acute watery diarrhea'], color: '#0369a1' },
  { name: 'Meningitis (CSM)', synonyms: ['meningitis', 'csm'], color: '#7c3aed' },
  { name: 'Measles', synonyms: ['measles'], color: '#ea580c' },
  { name: 'Diphtheria', synonyms: ['diphtheria'], color: '#be123c' },
  { name: 'Yellow Fever', synonyms: ['yellow fever'], color: '#a16207' },
  { name: 'Mpox', synonyms: ['monkeypox', 'mpox'], color: '#9333ea' },
];

const ALL_PRIORITY = ['lassa', 'cholera', 'awd', 'meningitis', 'csm', 'measles', 'diphtheria', 'yellow fever', 'monkeypox', 'mpox'];

function matchAny(text: string, syns: string[]): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return syns.some(s => t.includes(s));
}

// Heat layer overlay (Leaflet plugin, not in react-leaflet)
function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    if (points.length > 0) {
      layerRef.current = (L as any).heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 10,
        max: Math.max(...points.map(p => p[2])) || 1,
        gradient: { 0.2: '#16a34a', 0.4: '#facc15', 0.6: '#f97316', 0.8: '#dc2626', 1.0: '#7f1d1d' },
      }).addTo(map);
    }
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [points, map]);

  return null;
}

export default function GeoHeatmapPage() {
  const [days, setDays] = useState(30);
  const [diseaseIdx, setDiseaseIdx] = useState(0);

  const since = useMemo(() => startOfDay(subDays(new Date(), days)), [days]);
  const disease = DISEASES[diseaseIdx];
  const activeSyns = disease.synonyms.length === 0 ? ALL_PRIORITY : disease.synonyms;

  const { data, isLoading } = useQuery({
    queryKey: ['geo-heatmap', days],
    queryFn: async () => {
      // Pull encounters + facility coords in parallel
      const [encRes, facRes] = await Promise.all([
        supabase
          .from('encounters')
          .select('id, encounter_date, diagnosis, chief_complaint, symptoms, facility_id, is_syndromic_alert')
          .gte('encounter_date', since.toISOString())
          .limit(5000),
        supabase
          .from('facilities')
          .select('id, name, region, district, latitude, longitude'),
      ]);
      return { encounters: encRes.data ?? [], facilities: facRes.data ?? [] };
    },
  });

  // Aggregate by LGA (district). Each LGA → { lat, lng, total, byDisease, facilities }
  const aggregated = useMemo(() => {
    if (!data) return [];
    const facMap = new Map<string, any>();
    data.facilities.forEach(f => facMap.set(f.id, f));

    const lgaMap = new Map<string, {
      lga: string; region: string; lat: number; lng: number;
      total: number; matched: number; alerts: number; facilities: Set<string>;
      diseaseCounts: Record<string, number>;
    }>();

    for (const enc of data.encounters as any[]) {
      const f = facMap.get(enc.facility_id);
      if (!f || f.latitude == null || f.longitude == null) continue;
      const lga = f.district || 'Unknown LGA';
      const key = `${f.region}::${lga}`;

      const haystack = [
        enc.diagnosis ?? '',
        enc.chief_complaint ?? '',
        Array.isArray(enc.symptoms) ? enc.symptoms.join(' ') : '',
      ].join(' ').toLowerCase();

      const isMatch = matchAny(haystack, activeSyns);
      // Slight jitter so multiple facilities in same LGA don't fully overlap
      const lat = Number(f.latitude);
      const lng = Number(f.longitude);

      let bucket = lgaMap.get(key);
      if (!bucket) {
        bucket = { lga, region: f.region ?? '—', lat, lng, total: 0, matched: 0, alerts: 0, facilities: new Set(), diseaseCounts: {} };
        lgaMap.set(key, bucket);
      }
      bucket.facilities.add(f.name);
      bucket.total += 1;
      if (enc.is_syndromic_alert) bucket.alerts += 1;
      if (isMatch) {
        bucket.matched += 1;
        // categorise per individual disease (excluding "all" entry)
        for (const d of DISEASES.slice(1)) {
          if (matchAny(haystack, d.synonyms)) {
            bucket.diseaseCounts[d.name] = (bucket.diseaseCounts[d.name] ?? 0) + 1;
          }
        }
      }
    }
    return Array.from(lgaMap.values());
  }, [data, activeSyns]);

  const heatPoints: [number, number, number][] = useMemo(
    () => aggregated.filter(a => a.matched > 0).map(a => [a.lat, a.lng, a.matched]),
    [aggregated]
  );

  const sortedLeaderboard = useMemo(
    () => [...aggregated].filter(a => a.matched > 0).sort((a, b) => b.matched - a.matched).slice(0, 10),
    [aggregated]
  );

  const totals = useMemo(() => ({
    cases: aggregated.reduce((s, a) => s + a.matched, 0),
    lgas: aggregated.filter(a => a.matched > 0).length,
    facilities: new Set(aggregated.flatMap(a => Array.from(a.facilities))).size,
    alerts: aggregated.reduce((s, a) => s + a.alerts, 0),
  }), [aggregated]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary" />
            Disease Geo-Heatmap
          </h1>
          <p className="text-muted-foreground mt-1">
            Cases mapped by Local Government Area using facility coordinates and clinical encounters.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={String(diseaseIdx)} onValueChange={(v) => setDiseaseIdx(Number(v))}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DISEASES.map((d, i) => <SelectItem key={d.name} value={String(i)}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-muted-foreground text-sm"><Activity className="w-4 h-4" />Cases</div><div className="text-2xl font-bold mt-1">{totals.cases}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-muted-foreground text-sm"><MapPin className="w-4 h-4" />LGAs affected</div><div className="text-2xl font-bold mt-1">{totals.lgas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-muted-foreground text-sm"><Users className="w-4 h-4" />Facilities reporting</div><div className="text-2xl font-bold mt-1">{totals.facilities}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-muted-foreground text-sm"><AlertTriangle className="w-4 h-4" />Syndromic alerts</div><div className="text-2xl font-bold mt-1 text-destructive">{totals.alerts}</div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{disease.name} — Last {days} days</span>
              {isLoading && <Badge variant="outline">Loading…</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[520px] w-full">
              <MapContainer
                center={[9.082, 8.6753]} // Nigeria centroid
                zoom={6}
                scrollWheelZoom
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <HeatLayer points={heatPoints} />
                {aggregated.filter(a => a.matched > 0).map((a, i) => {
                  const radius = Math.min(30, 6 + Math.sqrt(a.matched) * 3);
                  return (
                    <CircleMarker
                      key={i}
                      center={[a.lat, a.lng]}
                      radius={radius}
                      pathOptions={{
                        color: disease.color,
                        fillColor: disease.color,
                        fillOpacity: 0.55,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="space-y-1 min-w-[180px]">
                          <div className="font-semibold text-sm">{a.lga}</div>
                          <div className="text-xs text-muted-foreground">{a.region}</div>
                          <hr className="my-1" />
                          <div className="text-xs"><strong>{a.matched}</strong> matching case{a.matched === 1 ? '' : 's'}</div>
                          <div className="text-xs">{a.total} total encounters · {a.alerts} syndromic alert{a.alerts === 1 ? '' : 's'}</div>
                          {Object.keys(a.diseaseCounts).length > 0 && (
                            <>
                              <hr className="my-1" />
                              <div className="text-xs font-medium">By disease:</div>
                              <ul className="text-xs">
                                {Object.entries(a.diseaseCounts).sort((x, y) => y[1] - x[1]).map(([k, v]) => (
                                  <li key={k}>• {k}: <strong>{v}</strong></li>
                                ))}
                              </ul>
                            </>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {a.facilities.size} facility{a.facilities.size === 1 ? '' : 'ies'}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top affected LGAs</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedLeaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No matching cases in this window.</p>
            ) : (
              <ol className="space-y-2">
                {sortedLeaderboard.map((a, i) => (
                  <li key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{a.lga}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.region}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <Badge variant={i === 0 ? 'destructive' : 'secondary'}>{a.matched}</Badge>
                      {a.alerts > 0 && <div className="text-xs text-destructive mt-0.5">{a.alerts} alert{a.alerts === 1 ? '' : 's'}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-1">
              <div className="font-semibold">Heat scale</div>
              <div className="flex h-2 rounded overflow-hidden">
                <div style={{ background: '#16a34a', flex: 1 }} />
                <div style={{ background: '#facc15', flex: 1 }} />
                <div style={{ background: '#f97316', flex: 1 }} />
                <div style={{ background: '#dc2626', flex: 1 }} />
                <div style={{ background: '#7f1d1d', flex: 1 }} />
              </div>
              <div className="flex justify-between"><span>Low</span><span>High</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Data: clinical encounters mapped to facility geo-coordinates. Facilities without lat/lng are excluded.
        Disease attribution derives from diagnosis, chief complaint and symptom text matching.
      </p>
    </div>
  );
}
