import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Banknote, ArrowDownCircle, ArrowUpCircle, Lock, Unlock } from 'lucide-react';

type Shift = { id: string; opened_at: string; closed_at: string | null; opening_cash: number; expected_cash: number; actual_cash: number | null; variance: number | null; status: string };
type Movement = { id: string; movement_type: string; amount: number; reference: string | null; notes: string | null; created_at: string };

export default function CashierShiftPage() {
  const { user, facilityId } = useAppContext();
  const [shift, setShift] = useState<Shift | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [openCash, setOpenCash] = useState(0);
  const [closeCash, setCloseCash] = useState(0);
  const [mv, setMv] = useState({ movement_type: 'cash_in', amount: 0, reference: '', notes: '' });

  const load = async () => {
    if (!user || !facilityId) return;
    const { data: s } = await supabase.from('cashier_shifts').select('*')
      .eq('cashier_id', user.id).eq('status', 'open').maybeSingle();
    setShift((s as any) ?? null);
    if (s) {
      const { data: m } = await supabase.from('cashier_movements').select('*').eq('shift_id', s.id).order('created_at', { ascending: false });
      setMovements((m as any) ?? []);
    } else {
      setMovements([]);
    }
  };
  useEffect(() => { load(); }, [user, facilityId]);

  const openShift = async () => {
    if (!user || !facilityId) return;
    const { error } = await supabase.from('cashier_shifts').insert({
      facility_id: facilityId, cashier_id: user.id, opening_cash: openCash, expected_cash: openCash, status: 'open',
    });
    if (error) return toast.error(error.message);
    toast.success('Shift opened');
    setOpenCash(0);
    load();
  };

  const recordMovement = async () => {
    if (!shift || !user || !mv.amount) return;
    const { error } = await supabase.from('cashier_movements').insert({
      shift_id: shift.id, ...mv, recorded_by: user.id,
    });
    if (error) return toast.error(error.message);
    // update expected_cash on shift
    const delta = mv.movement_type === 'cash_in' || mv.movement_type === 'payment' || mv.movement_type === 'deposit' ? mv.amount : -mv.amount;
    await supabase.from('cashier_shifts').update({ expected_cash: shift.expected_cash + delta }).eq('id', shift.id);
    setMv({ movement_type: 'cash_in', amount: 0, reference: '', notes: '' });
    load();
  };

  const closeShift = async () => {
    if (!shift) return;
    const variance = closeCash - shift.expected_cash;
    const { error } = await supabase.from('cashier_shifts').update({
      status: 'closed', closed_at: new Date().toISOString(), actual_cash: closeCash, variance,
    }).eq('id', shift.id);
    if (error) return toast.error(error.message);
    toast.success(`Shift closed. Variance: ₦${variance.toLocaleString()}`);
    setCloseCash(0);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cashier Shift</h1>
        <p className="text-muted-foreground">Open shift → record movements → reconcile and close</p>
      </div>

      {!shift ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Unlock className="h-5 w-5" />Open New Shift</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-w-md">
            <div><Label>Opening cash in drawer (₦)</Label><Input type="number" value={openCash} onChange={e => setOpenCash(Number(e.target.value))} /></div>
            <Button onClick={openShift} className="w-full">Open Shift</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Opening cash</div><div className="text-2xl font-bold">₦{Number(shift.opening_cash).toLocaleString()}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Expected now</div><div className="text-2xl font-bold text-primary">₦{Number(shift.expected_cash).toLocaleString()}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Movements</div><div className="text-2xl font-bold">{movements.length}</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Record Movement</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div><Label>Type</Label>
                  <Select value={mv.movement_type} onValueChange={v => setMv({ ...mv, movement_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Payment received</SelectItem>
                      <SelectItem value="deposit">Patient deposit</SelectItem>
                      <SelectItem value="refund">Refund out</SelectItem>
                      <SelectItem value="petty_cash">Petty cash out</SelectItem>
                      <SelectItem value="cash_in">Cash in (other)</SelectItem>
                      <SelectItem value="cash_out">Cash out (other)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (₦)</Label><Input type="number" value={mv.amount} onChange={e => setMv({ ...mv, amount: Number(e.target.value) })} /></div>
                <div><Label>Reference</Label><Input value={mv.reference} onChange={e => setMv({ ...mv, reference: e.target.value })} placeholder="INV-001" /></div>
                <div className="md:col-span-1"><Label>Notes</Label><Input value={mv.notes} onChange={e => setMv({ ...mv, notes: e.target.value })} /></div>
                <Button onClick={recordMovement}>Record</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Today's Movements</CardTitle></CardHeader>
            <CardContent>
              {movements.length === 0 ? <p className="text-muted-foreground text-sm">No movements yet.</p> : (
                <div className="space-y-1">
                  {movements.map(m => {
                    const isOut = ['cash_out', 'refund', 'petty_cash'].includes(m.movement_type);
                    return (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex items-center gap-2">
                          {isOut ? <ArrowUpCircle className="h-4 w-4 text-destructive" /> : <ArrowDownCircle className="h-4 w-4 text-emerald-600" />}
                          <div>
                            <div className="text-sm font-medium">{m.movement_type.replace('_', ' ')}</div>
                            <div className="text-xs text-muted-foreground">{m.reference} {m.notes}</div>
                          </div>
                        </div>
                        <div className={`font-semibold ${isOut ? 'text-destructive' : 'text-emerald-600'}`}>
                          {isOut ? '-' : '+'}₦{Number(m.amount).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Close Shift</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-w-md">
              <div><Label>Actual cash counted (₦)</Label><Input type="number" value={closeCash} onChange={e => setCloseCash(Number(e.target.value))} /></div>
              {closeCash > 0 && (
                <div className={`p-3 rounded ${closeCash - shift.expected_cash === 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>
                  Variance: ₦{(closeCash - shift.expected_cash).toLocaleString()}
                </div>
              )}
              <Button onClick={closeShift} variant="destructive" className="w-full">Close Shift</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
