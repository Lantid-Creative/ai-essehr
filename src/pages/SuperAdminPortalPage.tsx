import { useEffect, useMemo, useState } from 'react';
import { useAppContext, AppRole } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Users, Building2, Activity, Megaphone, Settings as SettingsIcon,
  Loader2, ShieldOff, ShieldCheck, AlertTriangle, RefreshCw, Plug,
} from 'lucide-react';

const ALL_ROLES: AppRole[] = [
  'super_admin', 'facility_admin', 'doctor', 'nurse', 'chew',
  'lab_tech', 'pharmacist', 'data_clerk', 'epidemiologist', 'dsno', 'paramedic',
];

type ProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
  facility_id: string | null;
  is_active: boolean;
  is_suspended: boolean;
  created_at: string;
};

type FacilityRow = {
  id: string;
  name: string;
  facility_type: string;
  status: string;
  state_code: string | null;
  lga_code: string | null;
  dhis2_orgunit_id: string | null;
  sormas_facility_uuid: string | null;
};

type SettingRow = { key: string; value: any; description: string | null };

export default function SuperAdminPortalPage() {
  const { roles } = useAppContext();
  const { toast } = useToast();
  const isSuper = roles.includes('super_admin');

  if (!isSuper) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>
            The Super Admin Portal is restricted to platform owners.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /> Super Admin Portal
          </h1>
          <p className="text-muted-foreground">
            Platform-wide governance: users, facilities, integrations, broadcasts, and system health.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users & Roles</TabsTrigger>
          <TabsTrigger value="facilities"><Building2 className="h-4 w-4 mr-1" /> Facilities</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="h-4 w-4 mr-1" /> Integrations</TabsTrigger>
          <TabsTrigger value="broadcast"><Megaphone className="h-4 w-4 mr-1" /> Broadcast</TabsTrigger>
          <TabsTrigger value="health"><Activity className="h-4 w-4 mr-1" /> System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="facilities" className="mt-4"><FacilitiesTab /></TabsContent>
        <TabsContent value="integrations" className="mt-4"><IntegrationsTab /></TabsContent>
        <TabsContent value="broadcast" className="mt-4"><BroadcastTab /></TabsContent>
        <TabsContent value="health" className="mt-4"><HealthTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- USERS TAB ---------------- */
function UsersTab() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, AppRole[]>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: ur }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, facility_id, is_active, is_suspended, created_at').order('created_at', { ascending: false }).limit(500),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    setProfiles((profs as any) || []);
    const map: Record<string, AppRole[]> = {};
    (ur || []).forEach((r: any) => {
      map[r.user_id] = [...(map[r.user_id] || []), r.role];
    });
    setRolesByUser(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(p =>
      p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
    );
  }, [search, profiles]);

  const grantRole = async (userId: string, role: AppRole) => {
    setBusy(userId);
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: role as any });
    setBusy(null);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Role granted', description: `${role} added.` });
    load();
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    setBusy(userId);
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role as any);
    setBusy(null);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Role revoked' });
    load();
  };

  const toggleSuspend = async (p: ProfileRow) => {
    setBusy(p.id);
    if (p.is_suspended) {
      const { error } = await supabase
        .from('user_suspensions')
        .update({ lifted_at: new Date().toISOString() })
        .eq('user_id', p.id)
        .is('lifted_at', null);
      if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      else toast({ title: 'User reinstated' });
    } else {
      const reason = window.prompt('Reason for suspension:');
      if (!reason) { setBusy(null); return; }
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('user_suspensions').insert({
        user_id: p.id, reason, suspended_by: user!.id,
      });
      if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
      else toast({ title: 'User suspended' });
    }
    setBusy(null);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Users & Roles</CardTitle>
            <CardDescription>Grant or revoke platform roles, suspend or reinstate users.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
        </div>
        <div className="mt-3">
          <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const userRoles = rolesByUser[p.id] || [];
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.full_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userRoles.length === 0 && <span className="text-xs text-muted-foreground">none</span>}
                        {userRoles.map(r => (
                          <Badge key={r} variant="secondary" className="cursor-pointer" onClick={() => revokeRole(p.id, r)} title="Click to revoke">
                            {r} ✕
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.is_suspended
                        ? <Badge variant="destructive">Suspended</Badge>
                        : <Badge variant="outline" className="border-primary/50 text-primary">Active</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={busy === p.id}>Grant role</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Grant role to {p.full_name}</DialogTitle></DialogHeader>
                          <div className="grid grid-cols-2 gap-2">
                            {ALL_ROLES.filter(r => !userRoles.includes(r)).map(r => (
                              <Button key={r} variant="outline" size="sm" onClick={() => grantRole(p.id, r)}>{r}</Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant={p.is_suspended ? 'default' : 'destructive'} disabled={busy === p.id} onClick={() => toggleSuspend(p)}>
                        {p.is_suspended ? <><ShieldCheck className="h-3 w-3 mr-1"/>Reinstate</> : <><ShieldOff className="h-3 w-3 mr-1"/>Suspend</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- FACILITIES TAB ---------------- */
function FacilitiesTab() {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FacilityRow | null>(null);
  const [form, setForm] = useState<Partial<FacilityRow>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('facilities')
      .select('id, name, facility_type, status, state_code, lga_code, dhis2_orgunit_id, sormas_facility_uuid')
      .order('name');
    setFacilities((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (f: FacilityRow) => { setEditing(f); setForm(f); };

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from('facilities').update({
      state_code: form.state_code || null,
      lga_code: form.lga_code || null,
      dhis2_orgunit_id: form.dhis2_orgunit_id || null,
      sormas_facility_uuid: form.sormas_facility_uuid || null,
      status: form.status as any,
    }).eq('id', editing.id);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Facility updated' });
    setEditing(null);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facilities</CardTitle>
        <CardDescription>Manage status, jurisdiction codes, and external system mappings (SORMAS / DHIS2).</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>State / LGA</TableHead>
                <TableHead>DHIS2</TableHead>
                <TableHead>SORMAS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell><Badge variant="outline">{f.facility_type}</Badge></TableCell>
                  <TableCell className="text-xs">{f.state_code || '—'} / {f.lga_code || '—'}</TableCell>
                  <TableCell className="text-xs font-mono">{f.dhis2_orgunit_id ? '✓' : '—'}</TableCell>
                  <TableCell className="text-xs font-mono">{f.sormas_facility_uuid ? '✓' : '—'}</TableCell>
                  <TableCell><Badge variant={f.status === 'active' ? 'default' : 'secondary'}>{f.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => openEdit(f)}>Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>State code</Label><Input value={form.state_code || ''} onChange={e => setForm({ ...form, state_code: e.target.value })} /></div>
              <div><Label>LGA code</Label><Input value={form.lga_code || ''} onChange={e => setForm({ ...form, lga_code: e.target.value })} /></div>
            </div>
            <div><Label>DHIS2 Org Unit ID</Label><Input value={form.dhis2_orgunit_id || ''} onChange={e => setForm({ ...form, dhis2_orgunit_id: e.target.value })} /></div>
            <div><Label>SORMAS Facility UUID</Label><Input value={form.sormas_facility_uuid || ''} onChange={e => setForm({ ...form, sormas_facility_uuid: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="suspended">suspended</SelectItem>
                  <SelectItem value="rejected">rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ---------------- INTEGRATIONS TAB ---------------- */
function IntegrationsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('platform_settings').select('key, value, description').order('key');
    setSettings((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (key: string) => {
    let parsed: any;
    try { parsed = JSON.parse(drafts[key]); }
    catch { toast({ title: 'Invalid JSON', variant: 'destructive' }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('platform_settings').update({
      value: parsed, updated_by: user!.id,
    }).eq('key', key);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Saved', description: key });
    setDrafts(d => { const n = { ...d }; delete n[key]; return n; });
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations & Feature Flags</CardTitle>
        <CardDescription>
          Manage SORMAS, DHIS2, Twilio, and Paystack platform configuration. Sensitive secrets (API keys) live in encrypted backend secrets — these are only non-secret config values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {settings.map(s => {
              const draft = drafts[s.key] ?? JSON.stringify(s.value, null, 2);
              const dirty = drafts[s.key] !== undefined;
              return (
                <div key={s.key} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-mono text-sm font-medium">{s.key}</div>
                      {s.description && <div className="text-xs text-muted-foreground">{s.description}</div>}
                    </div>
                    {s.value?.configured && <Badge>Configured</Badge>}
                  </div>
                  <Textarea
                    value={draft}
                    onChange={e => setDrafts(d => ({ ...d, [s.key]: e.target.value }))}
                    className="font-mono text-xs min-h-[100px]"
                  />
                  {dirty && (
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setDrafts(d => { const n = { ...d }; delete n[s.key]; return n; })}>Cancel</Button>
                      <Button size="sm" onClick={() => save(s.key)}>Save</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- BROADCAST TAB ---------------- */
function BroadcastTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', severity: 'info', target_role: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('broadcast_announcements').select('*').order('created_at', { ascending: false }).limit(50);
    setItems((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.body) { toast({ title: 'Title and body required', variant: 'destructive' }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('broadcast_announcements').insert({
      title: form.title, body: form.body, severity: form.severity,
      target_role: form.target_role || null, created_by: user!.id,
    });
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Announcement posted' });
    setOpen(false); setForm({ title: '', body: '', severity: 'info', target_role: '' });
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('broadcast_announcements').update({ active: !active }).eq('id', id);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Broadcast Announcements</CardTitle>
            <CardDescription>Push platform-wide messages to all (or role-targeted) users.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Megaphone className="h-4 w-4 mr-1" />New broadcast</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New broadcast</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Body</Label><Textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Severity</Label>
                    <Select value={form.severity} onValueChange={v => setForm({ ...form, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target role (optional)</Label>
                    <Select value={form.target_role || 'all'} onValueChange={v => setForm({ ...form, target_role: v === 'all' ? '' : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        {ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter><Button onClick={create}>Post</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No broadcasts yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map(b => (
              <div key={b.id} className="border border-border rounded-lg p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={b.severity === 'critical' ? 'destructive' : b.severity === 'warning' ? 'secondary' : 'outline'}>
                      {b.severity}
                    </Badge>
                    <span className="font-medium">{b.title}</span>
                    {b.target_role && <Badge variant="outline" className="text-xs">→ {b.target_role}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{b.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(b.created_at).toLocaleString()}</p>
                </div>
                <Switch checked={b.active} onCheckedChange={() => toggleActive(b.id, b.active)} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- HEALTH TAB ---------------- */
function HealthTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [
      { count: facilities },
      { count: patients },
      { count: encounters },
      { count: alerts },
      { count: cases },
      { count: dispatchPending },
      { count: dispatchDead },
      { count: dispatchSuccess },
      { count: rescues },
    ] = await Promise.all([
      supabase.from('facilities').select('*', { count: 'exact', head: true }),
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('encounters').select('*', { count: 'exact', head: true }),
      supabase.from('surveillance_alerts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('case_reports').select('*', { count: 'exact', head: true }),
      supabase.from('case_report_dispatches').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('case_report_dispatches').select('*', { count: 'exact', head: true }).eq('status', 'dead_letter'),
      supabase.from('case_report_dispatches').select('*', { count: 'exact', head: true }).eq('status', 'success'),
      supabase.from('rescue_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'accepted']),
    ]);
    setStats({ facilities, patients, encounters, alerts, cases, dispatchPending, dispatchDead, dispatchSuccess, rescues });
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const cards = [
    { label: 'Facilities', value: stats.facilities, icon: Building2 },
    { label: 'Patients', value: stats.patients, icon: Users },
    { label: 'Encounters', value: stats.encounters, icon: Activity },
    { label: 'Pending alerts', value: stats.alerts, icon: AlertTriangle },
    { label: 'Case reports', value: stats.cases, icon: ShieldCheck },
    { label: 'Active rescues', value: stats.rescues, icon: AlertTriangle },
  ];

  const dispatchHealth = stats.dispatchDead > 0 ? 'critical' : stats.dispatchPending > 50 ? 'warning' : 'healthy';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value ?? 0}</p>
                </div>
                <c.icon className="h-8 w-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" /> Dispatch Outbox Health
            <Badge variant={dispatchHealth === 'critical' ? 'destructive' : dispatchHealth === 'warning' ? 'secondary' : 'default'}>
              {dispatchHealth}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold text-primary">{stats.dispatchSuccess}</p><p className="text-xs text-muted-foreground">Delivered</p></div>
          <div><p className="text-2xl font-bold">{stats.dispatchPending}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          <div><p className="text-2xl font-bold text-destructive">{stats.dispatchDead}</p><p className="text-xs text-muted-foreground">Dead-lettered</p></div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-1" />Refresh stats</Button>
    </div>
  );
}
