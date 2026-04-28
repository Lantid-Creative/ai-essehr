import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShieldCheck, Search, FileText, Building2, User, Calendar, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';

type AuditRow = {
  id: string;
  user_id: string;
  facility_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
};

type FacilityRow = {
  id: string;
  name: string;
  facility_code: string | null;
  facility_type: string;
  status: string;
  region: string | null;
  district: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
};

export default function FacilityAuditTrailPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{
    log: AuditRow;
    facility?: FacilityRow;
    registrar?: ProfileRow;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['facility-registration-audit'],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action', 'facility_registered')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;

      const facilityIds = Array.from(new Set((logs ?? []).map(l => l.facility_id).filter(Boolean))) as string[];
      const userIds = Array.from(new Set((logs ?? []).map(l => l.user_id).filter(Boolean))) as string[];

      const [facilitiesRes, profilesRes] = await Promise.all([
        facilityIds.length
          ? supabase.from('facilities').select('id,name,facility_code,facility_type,status,region,district,address,email,phone,created_at').in('id', facilityIds)
          : Promise.resolve({ data: [], error: null } as any),
        userIds.length
          ? supabase.from('profiles').select('id,full_name,email,phone,job_title').in('id', userIds)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      const facilityMap = new Map<string, FacilityRow>((facilitiesRes.data ?? []).map((f: any) => [f.id, f]));
      const profileMap = new Map<string, ProfileRow>((profilesRes.data ?? []).map((p: any) => [p.id, p]));

      return (logs ?? []).map(l => ({
        log: l as AuditRow,
        facility: l.facility_id ? facilityMap.get(l.facility_id) : undefined,
        registrar: profileMap.get(l.user_id),
      }));
    },
  });

  const filtered = (data ?? []).filter(({ facility, registrar, log }) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      facility?.name?.toLowerCase().includes(q) ||
      facility?.facility_code?.toLowerCase().includes(q) ||
      facility?.region?.toLowerCase().includes(q) ||
      registrar?.full_name?.toLowerCase().includes(q) ||
      registrar?.email?.toLowerCase().includes(q) ||
      log.details?.registration_number?.toLowerCase?.().includes(q) ||
      log.details?.admin_license?.toLowerCase?.().includes(q)
    );
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Facility Registration Audit Trail
          </h1>
          <p className="text-muted-foreground mt-1">
            Compliance log of every hospital onboarded, the registrar, and their attested verification credentials.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filtered.length} record{filtered.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by facility, registrar, license, or registration number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Loading audit trail…</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No facility registrations found.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => {
            const { log, facility, registrar } = row;
            const d = log.details ?? {};
            return (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold truncate">{facility?.name ?? '(facility deleted)'}</span>
                        {facility?.status && (
                          <Badge variant={facility.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                            {facility.status}
                          </Badge>
                        )}
                        {facility?.facility_type && (
                          <Badge variant="outline" className="capitalize">{facility.facility_type}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{registrar?.full_name ?? 'Unknown'}</span>
                        <span>{registrar?.email}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(log.created_at), 'PPp')}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                        {d.registration_number && <span><strong>Reg #:</strong> {d.registration_number}</span>}
                        {d.admin_license && <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-primary" /><strong>License:</strong> {d.admin_license}</span>}
                        {d.admin_title && <span><strong>Title:</strong> {d.admin_title}</span>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                      <FileText className="w-4 h-4 mr-1" /> Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Audit Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">Facility</h3>
                <dl className="grid grid-cols-3 gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">Name</dt><dd className="col-span-2">{selected.facility?.name ?? '—'}</dd>
                  <dt className="text-muted-foreground">Code</dt><dd className="col-span-2">{selected.facility?.facility_code ?? '—'}</dd>
                  <dt className="text-muted-foreground">Type</dt><dd className="col-span-2 capitalize">{selected.facility?.facility_type ?? '—'}</dd>
                  <dt className="text-muted-foreground">Status</dt><dd className="col-span-2 capitalize">{selected.facility?.status ?? '—'}</dd>
                  <dt className="text-muted-foreground">Region</dt><dd className="col-span-2">{selected.facility?.region ?? '—'}</dd>
                  <dt className="text-muted-foreground">District</dt><dd className="col-span-2">{selected.facility?.district ?? '—'}</dd>
                  <dt className="text-muted-foreground">Address</dt><dd className="col-span-2">{selected.facility?.address ?? '—'}</dd>
                  <dt className="text-muted-foreground">Email</dt><dd className="col-span-2">{selected.facility?.email ?? '—'}</dd>
                  <dt className="text-muted-foreground">Phone</dt><dd className="col-span-2">{selected.facility?.phone ?? '—'}</dd>
                </dl>
              </section>

              <section>
                <h3 className="font-semibold mb-2">Registered By</h3>
                <dl className="grid grid-cols-3 gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">Full name</dt><dd className="col-span-2">{selected.registrar?.full_name ?? '—'}</dd>
                  <dt className="text-muted-foreground">Email</dt><dd className="col-span-2">{selected.registrar?.email ?? '—'}</dd>
                  <dt className="text-muted-foreground">Phone</dt><dd className="col-span-2">{selected.registrar?.phone ?? '—'}</dd>
                  <dt className="text-muted-foreground">Job title</dt><dd className="col-span-2">{selected.registrar?.job_title ?? '—'}</dd>
                  <dt className="text-muted-foreground">User ID</dt><dd className="col-span-2 font-mono text-xs">{selected.log.user_id}</dd>
                </dl>
              </section>

              <section>
                <h3 className="font-semibold mb-2 flex items-center gap-1"><BadgeCheck className="w-4 h-4 text-primary" />Attestation & Verification</h3>
                <dl className="grid grid-cols-3 gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">Registration #</dt><dd className="col-span-2">{selected.log.details?.registration_number ?? '—'}</dd>
                  <dt className="text-muted-foreground">Head of facility</dt><dd className="col-span-2">{selected.log.details?.head_of_facility ?? '—'}</dd>
                  <dt className="text-muted-foreground">Admin license</dt><dd className="col-span-2">{selected.log.details?.admin_license ?? '—'}</dd>
                  <dt className="text-muted-foreground">Admin title</dt><dd className="col-span-2">{selected.log.details?.admin_title ?? '—'}</dd>
                  <dt className="text-muted-foreground">Attested at</dt><dd className="col-span-2">{selected.log.details?.attested_at ? format(new Date(selected.log.details.attested_at), 'PPpp') : '—'}</dd>
                  <dt className="text-muted-foreground">Logged at</dt><dd className="col-span-2">{format(new Date(selected.log.created_at), 'PPpp')}</dd>
                </dl>
              </section>

              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Raw audit payload</summary>
                <pre className="mt-2 p-3 bg-muted rounded overflow-auto max-h-60">{JSON.stringify(selected.log.details, null, 2)}</pre>
              </details>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
