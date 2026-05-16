import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Users, ClipboardCheck, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

type Meeting = {
  id: string;
  meeting_date: string;
  meeting_type: string;
  chairperson: string | null;
  secretary: string | null;
  attendance_count: number | null;
  agenda: string | null;
  decisions: string | null;
  action_items: string | null;
  status: string;
  notes: string | null;
};

type Visit = {
  id: string;
  visit_date: string;
  visit_type: string;
  supervisor_name: string;
  supervisor_cadre: string | null;
  supervisor_organization: string | null;
  findings: string | null;
  recommendations: string | null;
  strengths: string | null;
  gaps: string | null;
  overall_score: number | null;
  next_visit_date: string | null;
  status: string;
};

type Action = {
  id: string;
  visit_id: string;
  facility_id: string;
  action_description: string;
  responsible_person: string | null;
  due_date: string | null;
  status: string;
  notes: string | null;
};

export default function WDCSupervisionPage() {
  const { facilityId, roles } = useAppContext();
  const canManage = roles.includes('facility_admin') || roles.includes('super_admin');

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMeeting, setOpenMeeting] = useState(false);
  const [openVisit, setOpenVisit] = useState(false);
  const [openAction, setOpenAction] = useState<Visit | null>(null);

  const [meetingForm, setMeetingForm] = useState({
    meeting_date: new Date().toISOString().slice(0, 10),
    meeting_type: 'regular',
    chairperson: '',
    secretary: '',
    attendance_count: '',
    agenda: '',
    decisions: '',
    action_items: '',
    status: 'completed',
    notes: '',
  });

  const [visitForm, setVisitForm] = useState({
    visit_date: new Date().toISOString().slice(0, 10),
    visit_type: 'integrated',
    supervisor_name: '',
    supervisor_cadre: '',
    supervisor_organization: '',
    findings: '',
    recommendations: '',
    strengths: '',
    gaps: '',
    overall_score: '',
    next_visit_date: '',
  });

  const [actionForm, setActionForm] = useState({
    action_description: '',
    responsible_person: '',
    due_date: '',
    notes: '',
  });

  const load = async () => {
    if (!facilityId) return;
    setLoading(true);
    const [m, v, a] = await Promise.all([
      supabase.from('wdc_meetings').select('*').eq('facility_id', facilityId).order('meeting_date', { ascending: false }),
      supabase.from('supervisory_visits').select('*').eq('facility_id', facilityId).order('visit_date', { ascending: false }),
      supabase.from('supervisory_visit_actions').select('*').eq('facility_id', facilityId).order('due_date', { ascending: true }),
    ]);
    if (m.data) setMeetings(m.data as Meeting[]);
    if (v.data) setVisits(v.data as Visit[]);
    if (a.data) setActions(a.data as Action[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [facilityId]);

  const saveMeeting = async () => {
    if (!facilityId) return;
    const { error } = await supabase.from('wdc_meetings').insert({
      facility_id: facilityId,
      ...meetingForm,
      attendance_count: meetingForm.attendance_count ? parseInt(meetingForm.attendance_count) : null,
    });
    if (error) return toast.error(error.message);
    toast.success('WDC meeting recorded');
    setOpenMeeting(false);
    setMeetingForm({ ...meetingForm, agenda: '', decisions: '', action_items: '', notes: '', attendance_count: '' });
    load();
  };

  const saveVisit = async () => {
    if (!facilityId) return;
    if (!visitForm.supervisor_name) return toast.error('Supervisor name is required');
    const { error } = await supabase.from('supervisory_visits').insert({
      facility_id: facilityId,
      ...visitForm,
      overall_score: visitForm.overall_score ? parseFloat(visitForm.overall_score) : null,
      next_visit_date: visitForm.next_visit_date || null,
    });
    if (error) return toast.error(error.message);
    toast.success('Supervisory visit recorded');
    setOpenVisit(false);
    setVisitForm({ ...visitForm, supervisor_name: '', findings: '', recommendations: '', strengths: '', gaps: '', overall_score: '', next_visit_date: '' });
    load();
  };

  const saveAction = async () => {
    if (!facilityId || !openAction) return;
    if (!actionForm.action_description) return toast.error('Description required');
    const { error } = await supabase.from('supervisory_visit_actions').insert({
      facility_id: facilityId,
      visit_id: openAction.id,
      action_description: actionForm.action_description,
      responsible_person: actionForm.responsible_person || null,
      due_date: actionForm.due_date || null,
      notes: actionForm.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success('Action added');
    setActionForm({ action_description: '', responsible_person: '', due_date: '', notes: '' });
    setOpenAction(null);
    load();
  };

  const toggleAction = async (a: Action) => {
    const newStatus = a.status === 'completed' ? 'open' : 'completed';
    const { error } = await supabase
      .from('supervisory_visit_actions')
      .update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null })
      .eq('id', a.id);
    if (error) return toast.error(error.message);
    load();
  };

  const statusBadge = (s: string) => {
    const variant = s === 'completed' ? 'default' : s === 'overdue' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{s}</Badge>;
  };

  const openActions = actions.filter(a => a.status !== 'completed').length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">WDC & Supervisory Visits</h1>
        <p className="text-muted-foreground">Ward Development Committee meetings and external supervision records</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>WDC Meetings</CardDescription><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{meetings.length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Supervisory Visits</CardDescription><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />{visits.length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Open Actions</CardDescription><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{openActions}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Last Visit</CardDescription><CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-5 w-5" />{visits[0]?.visit_date ?? '—'}</CardTitle></CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="meetings">
        <TabsList>
          <TabsTrigger value="meetings">WDC Meetings</TabsTrigger>
          <TabsTrigger value="visits">Supervisory Visits</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ward Development Committee Meetings</h2>
            {canManage && (
              <Dialog open={openMeeting} onOpenChange={setOpenMeeting}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Record Meeting</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Record WDC Meeting</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Date</Label><Input type="date" value={meetingForm.meeting_date} onChange={(e) => setMeetingForm({ ...meetingForm, meeting_date: e.target.value })} /></div>
                      <div><Label>Type</Label>
                        <Select value={meetingForm.meeting_type} onValueChange={(v) => setMeetingForm({ ...meetingForm, meeting_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Chairperson</Label><Input value={meetingForm.chairperson} onChange={(e) => setMeetingForm({ ...meetingForm, chairperson: e.target.value })} /></div>
                      <div><Label>Secretary</Label><Input value={meetingForm.secretary} onChange={(e) => setMeetingForm({ ...meetingForm, secretary: e.target.value })} /></div>
                      <div><Label>Attendance Count</Label><Input type="number" value={meetingForm.attendance_count} onChange={(e) => setMeetingForm({ ...meetingForm, attendance_count: e.target.value })} /></div>
                      <div><Label>Status</Label>
                        <Select value={meetingForm.status} onValueChange={(v) => setMeetingForm({ ...meetingForm, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Agenda</Label><Textarea value={meetingForm.agenda} onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })} /></div>
                    <div><Label>Decisions</Label><Textarea value={meetingForm.decisions} onChange={(e) => setMeetingForm({ ...meetingForm, decisions: e.target.value })} /></div>
                    <div><Label>Action Items</Label><Textarea value={meetingForm.action_items} onChange={(e) => setMeetingForm({ ...meetingForm, action_items: e.target.value })} /></div>
                    <div><Label>Notes</Label><Textarea value={meetingForm.notes} onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })} /></div>
                  </div>
                  <DialogFooter><Button onClick={saveMeeting}>Save Meeting</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Chair</TableHead><TableHead>Attendance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading…</TableCell></TableRow> :
                meetings.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No meetings recorded</TableCell></TableRow> :
                meetings.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{m.meeting_date}</TableCell>
                    <TableCell className="capitalize">{m.meeting_type}</TableCell>
                    <TableCell>{m.chairperson ?? '—'}</TableCell>
                    <TableCell>{m.attendance_count ?? '—'}</TableCell>
                    <TableCell>{statusBadge(m.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Supervisory Visits</h2>
            {canManage && (
              <Dialog open={openVisit} onOpenChange={setOpenVisit}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Record Visit</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Record Supervisory Visit</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Visit Date</Label><Input type="date" value={visitForm.visit_date} onChange={(e) => setVisitForm({ ...visitForm, visit_date: e.target.value })} /></div>
                      <div><Label>Type</Label>
                        <Select value={visitForm.visit_type} onValueChange={(v) => setVisitForm({ ...visitForm, visit_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="integrated">Integrated Supportive</SelectItem>
                            <SelectItem value="program">Programme Specific</SelectItem>
                            <SelectItem value="quality">Quality Assurance</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Supervisor Name *</Label><Input value={visitForm.supervisor_name} onChange={(e) => setVisitForm({ ...visitForm, supervisor_name: e.target.value })} /></div>
                      <div><Label>Cadre</Label><Input value={visitForm.supervisor_cadre} onChange={(e) => setVisitForm({ ...visitForm, supervisor_cadre: e.target.value })} placeholder="e.g. M&E Officer" /></div>
                      <div className="col-span-2"><Label>Organization</Label><Input value={visitForm.supervisor_organization} onChange={(e) => setVisitForm({ ...visitForm, supervisor_organization: e.target.value })} placeholder="e.g. LGA PHC Department" /></div>
                      <div><Label>Overall Score (%)</Label><Input type="number" value={visitForm.overall_score} onChange={(e) => setVisitForm({ ...visitForm, overall_score: e.target.value })} /></div>
                      <div><Label>Next Visit</Label><Input type="date" value={visitForm.next_visit_date} onChange={(e) => setVisitForm({ ...visitForm, next_visit_date: e.target.value })} /></div>
                    </div>
                    <div><Label>Strengths</Label><Textarea value={visitForm.strengths} onChange={(e) => setVisitForm({ ...visitForm, strengths: e.target.value })} /></div>
                    <div><Label>Gaps Identified</Label><Textarea value={visitForm.gaps} onChange={(e) => setVisitForm({ ...visitForm, gaps: e.target.value })} /></div>
                    <div><Label>Findings</Label><Textarea value={visitForm.findings} onChange={(e) => setVisitForm({ ...visitForm, findings: e.target.value })} /></div>
                    <div><Label>Recommendations</Label><Textarea value={visitForm.recommendations} onChange={(e) => setVisitForm({ ...visitForm, recommendations: e.target.value })} /></div>
                  </div>
                  <DialogFooter><Button onClick={saveVisit}>Save Visit</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Supervisor</TableHead><TableHead>Org</TableHead><TableHead>Score</TableHead><TableHead>Next Visit</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8">Loading…</TableCell></TableRow> :
                visits.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No visits recorded</TableCell></TableRow> :
                visits.map(v => (
                  <TableRow key={v.id}>
                    <TableCell>{v.visit_date}</TableCell>
                    <TableCell className="capitalize">{v.visit_type}</TableCell>
                    <TableCell>{v.supervisor_name}</TableCell>
                    <TableCell>{v.supervisor_organization ?? '—'}</TableCell>
                    <TableCell>{v.overall_score != null ? `${v.overall_score}%` : '—'}</TableCell>
                    <TableCell>{v.next_visit_date ?? '—'}</TableCell>
                    <TableCell>{canManage && <Button size="sm" variant="outline" onClick={() => setOpenAction(v)}>+ Action</Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <h2 className="text-xl font-semibold">Follow-up Action Items</h2>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead></TableHead><TableHead>Action</TableHead><TableHead>Responsible</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading…</TableCell></TableRow> :
                actions.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No actions recorded</TableCell></TableRow> :
                actions.map(a => {
                  const overdue = a.status !== 'completed' && a.due_date && new Date(a.due_date) < new Date();
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        {canManage && (
                          <Button size="icon" variant="ghost" onClick={() => toggleAction(a)}>
                            <CheckCircle2 className={`h-4 w-4 ${a.status === 'completed' ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md">{a.action_description}</TableCell>
                      <TableCell>{a.responsible_person ?? '—'}</TableCell>
                      <TableCell>{a.due_date ?? '—'}</TableCell>
                      <TableCell>{overdue ? <Badge variant="destructive">Overdue</Badge> : statusBadge(a.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!openAction} onOpenChange={(o) => !o && setOpenAction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Action Item</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Description *</Label><Textarea value={actionForm.action_description} onChange={(e) => setActionForm({ ...actionForm, action_description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Responsible Person</Label><Input value={actionForm.responsible_person} onChange={(e) => setActionForm({ ...actionForm, responsible_person: e.target.value })} /></div>
              <div><Label>Due Date</Label><Input type="date" value={actionForm.due_date} onChange={(e) => setActionForm({ ...actionForm, due_date: e.target.value })} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={actionForm.notes} onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={saveAction}>Save Action</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
