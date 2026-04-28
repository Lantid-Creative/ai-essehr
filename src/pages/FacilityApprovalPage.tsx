import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Building2, CheckCircle2, XCircle, Loader2, Upload, Download, AlertTriangle, ShieldAlert } from 'lucide-react';

type Facility = {
  id: string;
  name: string;
  facility_type: string;
  facility_code: string | null;
  region: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  bed_count: number | null;
};

export default function FacilityApprovalPage() {
  const { roles } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectFacility, setRejectFacility] = useState<Facility | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);

  const isSuperAdmin = roles.includes('super_admin');

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Facility[];
    },
    enabled: isSuperAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (facility: Facility) => {
      const { error } = await supabase
        .from('facilities')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: null,
        })
        .eq('id', facility.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Facility approved', description: 'They can now access the platform.' });
      queryClient.invalidateQueries({ queryKey: ['facilities-admin'] });
    },
    onError: (e: any) => toast({ title: 'Approval failed', description: e.message, variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!rejectFacility) return;
      const { error } = await supabase
        .from('facilities')
        .update({ status: 'rejected', rejection_reason: rejectReason || 'No reason provided' })
        .eq('id', rejectFacility.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Facility rejected' });
      queryClient.invalidateQueries({ queryKey: ['facilities-admin'] });
      setRejectFacility(null);
      setRejectReason('');
    },
    onError: (e: any) => toast({ title: 'Rejection failed', description: e.message, variant: 'destructive' }),
  });

  const suspendMutation = useMutation({
    mutationFn: async (facility: Facility) => {
      const newStatus = facility.status === 'suspended' ? 'active' : 'suspended';
      const { error } = await supabase.from('facilities').update({ status: newStatus }).eq('id', facility.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Facility status updated' });
      queryClient.invalidateQueries({ queryKey: ['facilities-admin'] });
    },
  });

  const downloadTemplate = () => {
    const csv = 'name,facility_type,facility_code,region,district,address,phone,email,bed_count,latitude,longitude\nExample General Hospital,secondary,EX-001,Lagos,Ikeja,123 Main St,+234800000000,info@example.org,50,6.6018,3.3515';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'aipews-facilities-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsv = (text: string): any[] => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let current = ''; let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === ',' && !inQuotes) { values.push(current); current = ''; }
        else current += ch;
      }
      values.push(current);
      const row: any = {};
      headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
      return row;
    });
  };

  const handleImport = async () => {
    if (!csvFile) return;
    setImporting(true);
    setImportResults(null);
    try {
      const text = await csvFile.text();
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error('CSV is empty or invalid');
      const facilities = rows.map(r => ({ ...r, auto_approve: autoApprove }));
      const { data, error } = await supabase.functions.invoke('bulk-import-facilities', {
        body: { facilities },
      });
      if (error) throw error;
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ['facilities-admin'] });
      toast({
        title: 'Import complete',
        description: `${data.inserted} of ${data.total} facilities imported.`,
      });
    } catch (e: any) {
      toast({ title: 'Import failed', description: e.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Super-admin access only</p>
            <p className="text-sm text-muted-foreground mt-1">This console is restricted to NCDC / NGF platform administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pending = facilities.filter(f => f.status === 'pending');
  const active = facilities.filter(f => f.status === 'active');
  const other = facilities.filter(f => !['pending', 'active'].includes(f.status));

  const renderFacilityCard = (f: Facility) => (
    <Card key={f.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">{f.name}</h3>
              <Badge variant={
                f.status === 'active' ? 'default' :
                f.status === 'pending' ? 'secondary' :
                f.status === 'rejected' ? 'destructive' : 'outline'
              }>{f.status}</Badge>
              <Badge variant="outline" className="capitalize">{f.facility_type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {[f.district, f.region].filter(Boolean).join(', ') || 'No location'}
              {f.facility_code && ` · ${f.facility_code}`}
            </p>
            {f.address && <p className="text-xs text-muted-foreground mt-1">{f.address}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {f.email || '—'} · {f.phone || '—'} · Registered {new Date(f.created_at).toLocaleDateString()}
            </p>
            {f.rejection_reason && (
              <p className="text-xs text-destructive mt-2">Rejected: {f.rejection_reason}</p>
            )}
          </div>
          <div className="flex gap-2">
            {f.status === 'pending' && (
              <>
                <Button size="sm" onClick={() => approveMutation.mutate(f)} disabled={approveMutation.isPending}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectFacility(f)}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
            {f.status === 'active' && (
              <Button size="sm" variant="outline" onClick={() => suspendMutation.mutate(f)}>Suspend</Button>
            )}
            {f.status === 'suspended' && (
              <Button size="sm" onClick={() => suspendMutation.mutate(f)}>Reactivate</Button>
            )}
            {f.status === 'rejected' && (
              <Button size="sm" onClick={() => approveMutation.mutate(f)}>Approve anyway</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facility Administration</h1>
        <p className="text-sm text-muted-foreground">Approve new hospitals and bulk-onboard facilities for the national rollout.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pending.length > 0 && <Badge variant="destructive" className="ml-2">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="other">Other ({other.length})</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> :
           pending.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No facilities awaiting approval.</CardContent></Card>
           ) : pending.map(renderFacilityCard)}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {active.map(renderFacilityCard)}
          {active.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">No active facilities.</CardContent></Card>}
        </TabsContent>

        <TabsContent value="other" className="mt-4">
          {other.map(renderFacilityCard)}
          {other.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">No suspended or rejected facilities.</CardContent></Card>}
        </TabsContent>

        <TabsContent value="import" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Bulk CSV Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">Required columns:</p>
                <p className="text-muted-foreground">
                  <code>name</code> (required), <code>facility_type</code> (primary/secondary/tertiary),
                  <code>facility_code</code>, <code>region</code>, <code>district</code>, <code>address</code>,
                  <code>phone</code>, <code>email</code>, <code>bed_count</code>, <code>latitude</code>, <code>longitude</code>
                </p>
                <Button variant="link" size="sm" className="px-0" onClick={downloadTemplate}>
                  <Download className="h-3 w-3 mr-1" /> Download template
                </Button>
              </div>

              <div>
                <Label htmlFor="csv">CSV file</Label>
                <Input
                  id="csv" type="file" accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />
                Auto-approve all imported facilities (skip review)
              </label>

              <Button onClick={handleImport} disabled={!csvFile || importing}>
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Import Facilities
              </Button>

              {importResults && (
                <div className="mt-4 border rounded-lg p-4 space-y-2">
                  <div className="flex gap-4 text-sm">
                    <span className="text-success font-medium">✓ {importResults.inserted} imported</span>
                    {importResults.failed > 0 && (
                      <span className="text-destructive font-medium">✗ {importResults.failed} failed</span>
                    )}
                  </div>
                  {importResults.failed > 0 && (
                    <div className="max-h-48 overflow-y-auto text-xs space-y-1 mt-2">
                      {importResults.results.filter((r: any) => r.status === 'error').map((r: any, i: number) => (
                        <div key={i} className="flex gap-2">
                          <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                          <span>Row {r.row} ({r.name || 'unnamed'}): {r.error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectFacility} onOpenChange={(o) => !o && setRejectFacility(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectFacility?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (visible to facility admin)</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFacility(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
