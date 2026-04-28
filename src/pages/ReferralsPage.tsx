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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRightLeft, Send, Inbox, CheckCircle2, XCircle, Plus, Loader2, Hospital, Search } from 'lucide-react';

export default function ReferralsPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [respondTarget, setRespondTarget] = useState<any | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'declined' | 'completed'>('accepted');

  // Form
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [receivingFacility, setReceivingFacility] = useState<string>('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('routine');
  const [summary, setSummary] = useState('');

  const { data: outgoing = [] } = useQuery({
    queryKey: ['referrals-outgoing', facilityId],
    queryFn: async () => {
      const { data } = await supabase
        .from('patient_referrals')
        .select('*, patients(first_name,last_name,patient_code)')
        .eq('referring_facility_id', facilityId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!facilityId,
  });

  const { data: incoming = [] } = useQuery({
    queryKey: ['referrals-incoming', facilityId],
    queryFn: async () => {
      const { data } = await supabase
        .from('patient_referrals')
        .select('*, patients(first_name,last_name,patient_code,date_of_birth,gender,allergies)')
        .eq('receiving_facility_id', facilityId!)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!facilityId,
  });

  // For lookups
  const { data: facilities = [] } = useQuery({
    queryKey: ['facilities-active'],
    queryFn: async () => {
      const { data } = await supabase
        .from('facilities')
        .select('id,name,facility_type,region,district')
        .eq('status', 'active')
        .order('name');
      return data || [];
    },
  });

  const { data: patientResults = [] } = useQuery({
    queryKey: ['patient-search-referral', patientSearch, facilityId],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2) return [];
      const { data } = await supabase
        .from('patients')
        .select('id,first_name,last_name,patient_code,phone')
        .eq('facility_id', facilityId!)
        .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,patient_code.ilike.%${patientSearch}%,phone.ilike.%${patientSearch}%`)
        .limit(10);
      return data || [];
    },
    enabled: !!facilityId && patientSearch.length >= 2,
  });

  const facilitiesById = Object.fromEntries(facilities.map(f => [f.id, f]));

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPatientId || !receivingFacility || !reason) {
        throw new Error('Patient, receiving facility, and reason are required.');
      }
      const { error } = await supabase.from('patient_referrals').insert({
        patient_id: selectedPatientId,
        referring_facility_id: facilityId!,
        receiving_facility_id: receivingFacility,
        referring_clinician_id: user?.id,
        reason,
        urgency,
        clinical_summary: summary || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Referral sent', description: 'The receiving facility will see it in their inbox.' });
      queryClient.invalidateQueries({ queryKey: ['referrals-outgoing'] });
      setCreateOpen(false);
      setSelectedPatientId(''); setReceivingFacility(''); setReason(''); setSummary(''); setUrgency('routine'); setPatientSearch('');
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const respondMutation = useMutation({
    mutationFn: async () => {
      if (!respondTarget) return;
      const { error } = await supabase.from('patient_referrals').update({
        status: responseStatus,
        response_notes: responseNotes || null,
        responded_by: user?.id,
        responded_at: new Date().toISOString(),
      }).eq('id', respondTarget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Response sent' });
      queryClient.invalidateQueries({ queryKey: ['referrals-incoming'] });
      setRespondTarget(null); setResponseNotes('');
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const urgencyBadge = (u: string) => {
    const cls = u === 'emergency' ? 'destructive' : u === 'urgent' ? 'default' : 'secondary';
    return <Badge variant={cls as any} className="capitalize">{u}</Badge>;
  };
  const statusBadge = (s: string) => {
    const cls = s === 'accepted' || s === 'completed' ? 'default' : s === 'declined' ? 'destructive' : 'secondary';
    return <Badge variant={cls as any} className="capitalize">{s}</Badge>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowRightLeft className="h-6 w-6" /> Patient Referrals</h1>
          <p className="text-sm text-muted-foreground">Refer patients to other facilities. Receiving hospitals see the full record on accept.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Referral</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Refer Patient to Another Facility</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Search patient (name, code, or phone)</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                  <Input className="pl-8" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Type to search..." />
                </div>
                {patientResults.length > 0 && !selectedPatientId && (
                  <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                    {patientResults.map((p: any) => (
                      <button key={p.id} type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                        onClick={() => { setSelectedPatientId(p.id); setPatientSearch(`${p.first_name} ${p.last_name} (${p.patient_code})`); }}>
                        {p.first_name} {p.last_name} · {p.patient_code} · {p.phone || '—'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Receiving facility</Label>
                <Select value={receivingFacility} onValueChange={setReceivingFacility}>
                  <SelectTrigger><SelectValue placeholder="Choose a hospital" /></SelectTrigger>
                  <SelectContent>
                    {facilities.filter(f => f.id !== facilityId).map(f => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} {f.district && `· ${f.district}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Urgency</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent (within 24h)</SelectItem>
                    <SelectItem value="emergency">Emergency (immediate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Reason for referral</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Surgical management of acute appendicitis" />
              </div>

              <div>
                <Label>Clinical summary (optional)</Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="Relevant history, current treatment, investigations..." />
              </div>

              <p className="text-xs text-muted-foreground">
                On acceptance, the receiving facility will gain access to this patient's full health record (encounters, labs, immunizations).
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Send className="h-4 w-4 mr-1" /> Send Referral
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">
            <Inbox className="h-4 w-4 mr-1" /> Inbox
            {incoming.filter((r: any) => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">{incoming.filter((r: any) => r.status === 'pending').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing"><Send className="h-4 w-4 mr-1" /> Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4 space-y-3">
          {incoming.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">No incoming referrals.</CardContent></Card>}
          {incoming.map((r: any) => {
            const ref = facilitiesById[r.referring_facility_id];
            return (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{r.patients?.first_name} {r.patients?.last_name}</h3>
                        <Badge variant="outline">{r.patients?.patient_code}</Badge>
                        {urgencyBadge(r.urgency)}
                        {statusBadge(r.status)}
                      </div>
                      <p className="text-sm flex items-center gap-1 text-muted-foreground">
                        <Hospital className="h-3 w-3" /> From: {ref?.name || 'Unknown facility'}
                      </p>
                      <p className="text-sm mt-2"><strong>Reason:</strong> {r.reason}</p>
                      {r.clinical_summary && <p className="text-sm mt-1 text-muted-foreground"><strong>Summary:</strong> {r.clinical_summary}</p>}
                      {r.patients?.allergies && (
                        <p className="text-xs mt-1 text-destructive">⚠ Allergies: {r.patients.allergies}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">Received {new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      {r.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => { setRespondTarget(r); setResponseStatus('accepted'); }}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setRespondTarget(r); setResponseStatus('declined'); }}>
                            <XCircle className="h-4 w-4 mr-1" /> Decline
                          </Button>
                        </>
                      )}
                      {r.status === 'accepted' && (
                        <Button size="sm" variant="outline" onClick={() => { setRespondTarget(r); setResponseStatus('completed'); }}>
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4 space-y-3">
          {outgoing.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">No referrals sent yet.</CardContent></Card>}
          {outgoing.map((r: any) => {
            const rec = facilitiesById[r.receiving_facility_id];
            return (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{r.patients?.first_name} {r.patients?.last_name}</h3>
                        <Badge variant="outline">{r.patients?.patient_code}</Badge>
                        {urgencyBadge(r.urgency)}
                        {statusBadge(r.status)}
                      </div>
                      <p className="text-sm flex items-center gap-1 text-muted-foreground">
                        <Hospital className="h-3 w-3" /> To: {rec?.name || 'Unknown facility'}
                      </p>
                      <p className="text-sm mt-2"><strong>Reason:</strong> {r.reason}</p>
                      {r.response_notes && <p className="text-sm mt-1"><strong>Response:</strong> {r.response_notes}</p>}
                      <p className="text-xs text-muted-foreground mt-2">Sent {new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      <Dialog open={!!respondTarget} onOpenChange={(o) => !o && setRespondTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseStatus === 'accepted' && 'Accept Referral'}
              {responseStatus === 'declined' && 'Decline Referral'}
              {responseStatus === 'completed' && 'Mark as Completed'}
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={responseNotes} onChange={(e) => setResponseNotes(e.target.value)} rows={3} />
            {responseStatus === 'accepted' && (
              <p className="text-xs text-muted-foreground mt-2">
                Accepting will give your facility access to this patient's full health record.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondTarget(null)}>Cancel</Button>
            <Button onClick={() => respondMutation.mutate()} disabled={respondMutation.isPending}
              variant={responseStatus === 'declined' ? 'destructive' : 'default'}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
