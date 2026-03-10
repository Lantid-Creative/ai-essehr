import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Search, Loader2, FlaskConical, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LaboratoryPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resultDialog, setResultDialog] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [refRange, setRefRange] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [resultNotes, setResultNotes] = useState('');
  const [searchPending, setSearchPending] = useState('');
  const [searchCompleted, setSearchCompleted] = useState('');

  const { data: pendingTests = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['lab-pending', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('lab_results')
        .select('id, test_name, test_category, ordered_at, patient_id, notes')
        .eq('facility_id', facilityId)
        .is('result', null)
        .order('ordered_at', { ascending: true });
      if (!data || data.length === 0) return [];
      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      return data.map(e => ({ ...e, patientName: patientMap[e.patient_id] || 'Unknown' }));
    },
    enabled: !!facilityId,
  });

  const { data: completedResults = [], isLoading: completedLoading } = useQuery({
    queryKey: ['lab-completed', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('lab_results')
        .select('id, test_name, test_category, result, reference_range, is_abnormal, ordered_at, resulted_at, patient_id, notes')
        .eq('facility_id', facilityId)
        .not('result', 'is', null)
        .order('resulted_at', { ascending: false })
        .limit(50);
      if (!data || data.length === 0) return [];
      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      return data.map(e => ({ ...e, patientName: patientMap[e.patient_id] || 'Unknown' }));
    },
    enabled: !!facilityId,
  });

  const enterResultMutation = useMutation({
    mutationFn: async () => {
      if (!resultDialog) throw new Error('No test selected');
      const { error } = await supabase.from('lab_results').update({
        result: resultValue,
        reference_range: refRange || null,
        is_abnormal: isAbnormal,
        resulted_at: new Date().toISOString(),
        performed_by: user?.id,
        notes: resultNotes || null,
      }).eq('id', resultDialog);
      if (error) throw error;

      // Audit log
      if (user) {
        const test = pendingTests.find((t: any) => t.id === resultDialog);
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          facility_id: facilityId,
          action: 'create',
          entity_type: 'lab_result',
          entity_id: resultDialog,
          details: { test: test?.test_name, result: resultValue, abnormal: isAbnormal, patient: test?.patientName } as any,
        } as any);
      }
    },
    onSuccess: () => {
      toast({ title: 'Result entered successfully' });
      queryClient.invalidateQueries({ queryKey: ['lab-pending'] });
      queryClient.invalidateQueries({ queryKey: ['lab-completed'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setResultDialog(null);
      setResultValue(''); setRefRange(''); setIsAbnormal(false); setResultNotes('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const filteredPending = pendingTests.filter((t: any) =>
    !searchPending || t.patientName.toLowerCase().includes(searchPending.toLowerCase()) || t.test_name.toLowerCase().includes(searchPending.toLowerCase())
  );
  const filteredCompleted = completedResults.filter((t: any) =>
    !searchCompleted || t.patientName.toLowerCase().includes(searchCompleted.toLowerCase()) || t.test_name.toLowerCase().includes(searchCompleted.toLowerCase())
  );

  const isLoading = pendingLoading || completedLoading;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Laboratory</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Clock className="h-5 w-5 text-warning shrink-0" />
          <div><p className="text-2xl font-heading font-medium">{pendingTests.length}</p><p className="text-xs text-muted-foreground">Pending</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success shrink-0" />
          <div><p className="text-2xl font-heading font-medium">{completedResults.length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div><p className="text-2xl font-heading font-medium">{completedResults.filter((r: any) => r.is_abnormal).length}</p><p className="text-xs text-muted-foreground">Abnormal</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-primary shrink-0" />
          <div><p className="text-2xl font-heading font-medium">{pendingTests.length + completedResults.length}</p><p className="text-xs text-muted-foreground">Total Tests</p></div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-1"><Clock className="h-3 w-3" /> Pending ({pendingTests.length})</TabsTrigger>
            <TabsTrigger value="completed" className="gap-1"><CheckCircle className="h-3 w-3" /> Completed ({completedResults.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by patient or test..." value={searchPending} onChange={e => setSearchPending(e.target.value)} className="pl-10" />
            </div>
            {filteredPending.length === 0 ? (
              <div className="card-ehr p-6 text-center text-muted-foreground text-sm">No pending tests. Tests are ordered from consultations.</div>
            ) : (
              <div className="space-y-2">
                {filteredPending.map((l: any) => (
                  <div key={l.id} className="card-ehr flex items-center justify-between p-3 text-sm">
                    <div>
                      <p className="font-medium">{l.patientName}</p>
                      <p className="text-xs text-muted-foreground">{l.test_name} · {l.test_category || 'General'} · Ordered {new Date(l.ordered_at).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" onClick={() => {
                      setResultDialog(l.id);
                      setResultValue(''); setRefRange(''); setIsAbnormal(false); setResultNotes(l.notes || '');
                    }}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Enter Result
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by patient or test..." value={searchCompleted} onChange={e => setSearchCompleted(e.target.value)} className="pl-10" />
            </div>
            <div className="card-ehr overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left px-4 py-2 font-medium">Patient</th>
                      <th className="text-left px-4 py-2 font-medium">Test</th>
                      <th className="text-left px-4 py-2 font-medium">Result</th>
                      <th className="text-left px-4 py-2 font-medium">Flag</th>
                      <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompleted.map((l: any) => (
                      <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{l.patientName}</td>
                        <td className="px-4 py-2">{l.test_name}</td>
                        <td className="px-4 py-2 max-w-[200px] truncate">{l.result}</td>
                        <td className="px-4 py-2">
                          <span className={l.is_abnormal ? 'badge-danger' : 'badge-success'}>{l.is_abnormal ? 'Abnormal' : 'Normal'}</span>
                        </td>
                        <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">
                          {l.resulted_at ? new Date(l.resulted_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                    {filteredCompleted.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No completed results yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Enter Result Dialog */}
      <Dialog open={!!resultDialog} onOpenChange={(open) => !open && setResultDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Lab Result</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); enterResultMutation.mutate(); }} className="space-y-4">
            <div>
              <Label>Result *</Label>
              <Input value={resultValue} onChange={e => setResultValue(e.target.value)} required className="mt-1" placeholder="e.g. Positive, 12.5 g/dL" />
            </div>
            <div>
              <Label>Reference Range</Label>
              <Input value={refRange} onChange={e => setRefRange(e.target.value)} className="mt-1" placeholder="e.g. 12-16 g/dL" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="abnormal" checked={isAbnormal} onChange={e => setIsAbnormal(e.target.checked)} className="rounded border-input" />
              <Label htmlFor="abnormal" className="cursor-pointer">Mark as Abnormal</Label>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={resultNotes} onChange={e => setResultNotes(e.target.value)} className="mt-1" placeholder="Additional comments" />
            </div>
            <Button type="submit" className="w-full" disabled={enterResultMutation.isPending}>
              {enterResultMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : 'Save Result'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
