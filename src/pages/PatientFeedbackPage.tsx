import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MessageSquare, Star, AlertCircle, CheckCircle2, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Feedback = {
  id: string;
  facility_id: string;
  patient_id: string | null;
  channel: string;
  category: string;
  rating: number | null;
  subject: string;
  message: string;
  is_anonymous: boolean;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
};

type Response = {
  id: string;
  feedback_id: string;
  responder_id: string;
  response_text: string;
  is_internal_note: boolean;
  created_at: string;
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'destructive',
  in_progress: 'default',
  resolved: 'outline',
  closed: 'secondary',
};

const PRIORITY_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'secondary',
  normal: 'outline',
  high: 'default',
  urgent: 'destructive',
};

export default function PatientFeedbackPage() {
  const { facilityId, user } = useAppContext();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const [form, setForm] = useState({
    channel: 'in_person',
    category: 'general',
    rating: '',
    subject: '',
    message: '',
    priority: 'normal',
    is_anonymous: false,
  });

  const load = async () => {
    if (!facilityId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('patient_feedback')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Feedback[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [facilityId]);

  const loadResponses = async (id: string) => {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('feedback_id', id)
      .order('created_at', { ascending: true });
    if (error) toast.error(error.message);
    else setResponses((data ?? []) as Response[]);
  };

  const openDetail = async (f: Feedback) => {
    setSelected(f);
    await loadResponses(f.id);
  };

  const submitFeedback = async () => {
    if (!facilityId) return toast.error('No facility');
    if (!form.subject.trim() || !form.message.trim()) return toast.error('Subject and message required');
    const { error } = await supabase.from('patient_feedback').insert({
      facility_id: facilityId,
      submitted_by: user?.id ?? null,
      channel: form.channel,
      category: form.category,
      rating: form.rating ? parseInt(form.rating, 10) : null,
      subject: form.subject.trim(),
      message: form.message.trim(),
      priority: form.priority,
      is_anonymous: form.is_anonymous,
      status: 'open',
    });
    if (error) return toast.error(error.message);
    toast.success('Feedback recorded');
    setOpen(false);
    setForm({ channel: 'in_person', category: 'general', rating: '', subject: '', message: '', priority: 'normal', is_anonymous: false });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const patch: Record<string, unknown> = { status };
    if (status === 'resolved') {
      patch.resolved_at = new Date().toISOString();
      patch.resolved_by = user?.id ?? null;
    }
    const { error } = await supabase.from('patient_feedback').update(patch).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Status updated');
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const addResponse = async () => {
    if (!selected || !user) return;
    if (!newResponse.trim()) return;
    const { error } = await supabase.from('feedback_responses').insert({
      feedback_id: selected.id,
      responder_id: user.id,
      response_text: newResponse.trim(),
      is_internal_note: isInternal,
    });
    if (error) return toast.error(error.message);
    setNewResponse('');
    setIsInternal(false);
    loadResponses(selected.id);
    if (selected.status === 'open') updateStatus(selected.id, 'in_progress');
  };

  const filtered = items.filter((i) => tab === 'all' ? true : i.status === tab);

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'open').length,
    resolved: items.filter(i => i.status === 'resolved').length,
    avgRating: (() => {
      const rated = items.filter(i => i.rating != null);
      if (!rated.length) return null;
      return (rated.reduce((s, i) => s + (i.rating ?? 0), 0) / rated.length).toFixed(1);
    })(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Feedback & Complaints</h1>
          <p className="text-muted-foreground text-sm">Capture, triage, and resolve patient voice across the facility.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Feedback</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Patient Feedback</DialogTitle>
                <DialogDescription>Log a compliment, complaint, suggestion, or concern.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Channel</Label>
                    <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In-person</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="suggestion_box">Suggestion Box</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="compliment">Compliment</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="clinical_care">Clinical Care</SelectItem>
                        <SelectItem value="staff_conduct">Staff Conduct</SelectItem>
                        <SelectItem value="wait_time">Wait Time</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="facility">Facility / Cleanliness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_anonymous} onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })} />
                  Submit anonymously
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submitFeedback}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />Total</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Open</CardDescription><CardTitle className="text-3xl text-destructive">{stats.open}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Resolved</CardDescription><CardTitle className="text-3xl">{stats.resolved}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Star className="h-4 w-4" />Avg Rating</CardDescription><CardTitle className="text-3xl">{stats.avgRating ?? '—'}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="text-muted-foreground text-sm">No feedback in this view.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((f) => (
                      <TableRow key={f.id} className="cursor-pointer" onClick={() => openDetail(f)}>
                        <TableCell className="text-xs">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium max-w-xs truncate">{f.subject}{f.is_anonymous && <span className="text-xs text-muted-foreground ml-1">(anon)</span>}</TableCell>
                        <TableCell className="capitalize text-xs">{f.category.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="capitalize text-xs">{f.channel.replace(/_/g, ' ')}</TableCell>
                        <TableCell><Badge variant={PRIORITY_VARIANT[f.priority] ?? 'outline'}>{f.priority}</Badge></TableCell>
                        <TableCell>{f.rating ?? '—'}</TableCell>
                        <TableCell><Badge variant={STATUS_VARIANT[f.status] ?? 'outline'}>{f.status.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDetail(f); }}>View</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.subject}
                  <Badge variant={STATUS_VARIANT[selected.status] ?? 'outline'}>{selected.status.replace(/_/g, ' ')}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {new Date(selected.created_at).toLocaleString()} · {selected.channel.replace(/_/g, ' ')} · {selected.category.replace(/_/g, ' ')}
                  {selected.is_anonymous && ' · Anonymous'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-md border p-3 bg-muted/30">
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                  {selected.rating && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{selected.rating}/5</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="text-xs">Update status:</Label>
                  {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                    <Button key={s} size="sm" variant={selected.status === s ? 'default' : 'outline'} onClick={() => updateStatus(selected.id, s)}>
                      {s.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Responses & Notes ({responses.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {responses.map((r) => (
                      <div key={r.id} className={`rounded-md p-3 text-sm border ${r.is_internal_note ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' : 'bg-card'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                          {r.is_internal_note && <Badge variant="outline" className="text-xs">Internal Note</Badge>}
                        </div>
                        <p className="whitespace-pre-wrap">{r.response_text}</p>
                      </div>
                    ))}
                    {responses.length === 0 && <p className="text-xs text-muted-foreground">No responses yet.</p>}
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <Textarea
                    rows={3}
                    placeholder="Write a response or internal note…"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                      Internal note (not visible to patient)
                    </label>
                    <Button size="sm" onClick={addResponse} disabled={!newResponse.trim()}>
                      <Send className="h-4 w-4 mr-2" />Send
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
