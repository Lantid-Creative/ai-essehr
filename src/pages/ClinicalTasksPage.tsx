import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Inbox, AlertTriangle, FlaskConical, ArrowRightLeft, CheckCheck } from 'lucide-react';

type Task = { id: string; task_type: string; title: string; description: string | null; priority: string; status: string; created_at: string; due_at: string | null; related_entity_type: string | null; related_entity_id: string | null };

export default function ClinicalTasksPage() {
  const { user, facilityId, roles } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');

  const load = async () => {
    if (!facilityId) return;
    let q = supabase.from('clinical_tasks').select('*').eq('facility_id', facilityId).neq('status', 'done').neq('status', 'dismissed').order('priority', { ascending: false }).order('created_at', { ascending: false });
    if (filter === 'mine' && user) q = q.or(`assignee_id.eq.${user.id},assignee_role.in.(${roles.join(',')})`);
    const { data } = await q;
    setTasks((data as any) ?? []);
  };
  useEffect(() => { load(); }, [facilityId, filter, user, roles.join(',')]);

  const complete = async (id: string) => {
    const { error } = await supabase.from('clinical_tasks').update({
      status: 'done', completed_at: new Date().toISOString(), completed_by: user?.id,
    }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Task completed');
    load();
  };

  const dismiss = async (id: string) => {
    await supabase.from('clinical_tasks').update({ status: 'dismissed', completed_at: new Date().toISOString(), completed_by: user?.id }).eq('id', id);
    load();
  };

  const icon = (t: string) => ({
    review_lab: <FlaskConical className="h-4 w-4" />,
    ack_abnormal: <AlertTriangle className="h-4 w-4" />,
    refill_request: <Inbox className="h-4 w-4" />,
    referral_response: <ArrowRightLeft className="h-4 w-4" />,
    signoff: <CheckCheck className="h-4 w-4" />,
    critical_value: <AlertTriangle className="h-4 w-4" />,
  } as Record<string, JSX.Element>)[t] ?? <Inbox className="h-4 w-4" />;

  const prioColor = (p: string) => ({
    urgent: 'bg-destructive text-destructive-foreground',
    high: 'bg-amber-500 text-white',
    normal: 'bg-primary/10 text-primary',
    low: 'bg-muted text-muted-foreground',
  } as Record<string, string>)[p] ?? 'bg-muted';

  const grouped = {
    urgent: tasks.filter(t => t.priority === 'urgent'),
    high: tasks.filter(t => t.priority === 'high'),
    normal: tasks.filter(t => t.priority === 'normal'),
    low: tasks.filter(t => t.priority === 'low'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clinical Task Inbox</h1>
          <p className="text-muted-foreground">Pending labs, abnormal results, referrals, signoffs</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={v => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="mine">Assigned to me ({grouped.urgent.length + grouped.high.length})</TabsTrigger>
          <TabsTrigger value="all">All facility tasks</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {tasks.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <CheckCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Inbox zero. Nothing requires your attention right now.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              {(['urgent', 'high', 'normal', 'low'] as const).map(p => grouped[p].length > 0 && (
                <Card key={p}>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Badge className={prioColor(p)}>{p.toUpperCase()}</Badge> {grouped[p].length} tasks</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {grouped[p].map(t => (
                        <div key={t.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{icon(t.task_type)}</div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{t.title}</div>
                              {t.description && <div className="text-xs text-muted-foreground mt-1">{t.description}</div>}
                              <div className="text-xs text-muted-foreground mt-1">{new Date(t.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => complete(t.id)}>Done</Button>
                            <Button size="sm" variant="ghost" onClick={() => dismiss(t.id)}>Dismiss</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
