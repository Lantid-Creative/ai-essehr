import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import {
  Receipt, Plus, Loader2, Search, Printer, CheckCircle, CreditCard,
  Banknote, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const SERVICE_PRICES: Record<string, number> = {
  'Consultation Fee': 2000,
  'Registration Fee': 500,
  'Emergency Fee': 5000,
  'Admission Fee': 10000,
  'Bed Charge (per day)': 3000,
  'Nursing Care': 1500,
  'Dressing/Procedure': 1000,
  'Ultrasound': 5000,
  'X-Ray': 4000,
  'ECG': 3000,
};

const LAB_PRICES: Record<string, number> = {
  'RDT Malaria': 500,
  'Full Blood Count': 2000,
  'Blood Culture': 3500,
  'Urinalysis': 800,
  'Stool Microscopy': 1000,
  'Liver Function Test': 3000,
  'Renal Function Test': 3000,
  'Widal Test': 1500,
  'Lassa Screening': 5000,
  'Cholera RDT': 1000,
};

interface InvoiceItem {
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function BillingPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Create invoice form
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('invoices' as any)
        .select('*')
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (!data || data.length === 0) return [];

      const patientIds = [...new Set((data as any[]).map((i: any) => i.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name, patient_code').in('id', patientIds);
      const map = Object.fromEntries((patients || []).map(p => [p.id, p]));
      return (data as any[]).map((inv: any) => ({
        ...inv,
        patient: map[inv.patient_id] || { first_name: 'Unknown', last_name: '', patient_code: '' },
      }));
    },
    enabled: !!facilityId,
  });

  const { data: patientSearchResults = [] } = useQuery({
    queryKey: ['billing-patient-search', patientSearch, facilityId],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2 || !facilityId) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, patient_code')
        .eq('facility_id', facilityId)
        .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,patient_code.ilike.%${patientSearch}%`)
        .limit(5);
      return data || [];
    },
    enabled: patientSearch.length >= 2,
  });

  const addItem = (desc: string, category: string, price: number) => {
    const existing = items.findIndex(i => i.description === desc);
    if (existing >= 0) {
      const updated = [...items];
      updated[existing].quantity += 1;
      updated[existing].total = updated[existing].quantity * updated[existing].unit_price;
      setItems(updated);
    } else {
      setItems([...items, { description: desc, category, quantity: 1, unit_price: price, total: price }]);
    }
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItemQty = (idx: number, qty: number) => {
    const updated = [...items];
    updated[idx].quantity = qty;
    updated[idx].total = qty * updated[idx].unit_price;
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountVal = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountVal);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPatientId || items.length === 0) throw new Error('Add patient and items');
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const { data: invoice, error } = await supabase.from('invoices' as any).insert({
        facility_id: facilityId,
        patient_id: selectedPatientId,
        invoice_number: invoiceNumber,
        subtotal,
        discount: discountVal,
        total,
        created_by: user?.id,
        notes: notes || null,
      } as any).select('id').single();
      if (error) throw error;

      const itemInserts = items.map(i => ({
        invoice_id: (invoice as any).id,
        description: i.description,
        category: i.category,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.total,
      }));
      await supabase.from('invoice_items' as any).insert(itemInserts as any);
    },
    onSuccess: () => {
      toast({ title: 'Invoice created' });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setCreateOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const payMutation = useMutation({
    mutationFn: async ({ id, method }: { id: string; method: string }) => {
      const { error } = await supabase.from('invoices' as any).update({
        status: 'paid',
        payment_method: method,
        paid_at: new Date().toISOString(),
      } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Payment recorded' });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSelectedInvoice(null);
    },
  });

  const resetCreateForm = () => {
    setPatientSearch(''); setSelectedPatientId(null); setSelectedPatientName('');
    setItems([]); setDiscount('0'); setNotes('');
  };

  const filteredInvoices = invoices.filter((inv: any) =>
    !searchQuery || inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${inv.patient.first_name} ${inv.patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unpaid = filteredInvoices.filter((i: any) => i.status === 'unpaid');
  const paid = filteredInvoices.filter((i: any) => i.status === 'paid');
  const totalRevenue = paid.reduce((s: number, i: any) => s + (parseFloat(i.total) || 0), 0);
  const totalOutstanding = unpaid.reduce((s: number, i: any) => s + (parseFloat(i.total) || 0), 0);

  const printInvoice = (inv: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const itemRows = (inv._items || items).map((i: any) =>
      `<tr><td>${i.description}</td><td>${i.category}</td><td>${i.quantity}</td><td>₦${(i.unit_price || 0).toLocaleString()}</td><td>₦${(i.total || 0).toLocaleString()}</td></tr>`
    ).join('');
    win.document.write(`<html><head><title>Invoice ${inv.invoice_number}</title>
      <style>body{font-family:sans-serif;padding:30px;font-size:14px}table{width:100%;border-collapse:collapse;margin-top:15px}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.total{font-size:18px;font-weight:bold}h1{color:#166534}</style>
      </head><body>
      <h1>AI-ESS EHR</h1>
      <h2>Invoice #${inv.invoice_number}</h2>
      <p>Patient: ${inv.patient?.first_name || ''} ${inv.patient?.last_name || ''}</p>
      <p>Date: ${new Date(inv.created_at).toLocaleDateString()}</p>
      <p>Status: ${inv.status?.toUpperCase()}</p>
      <table><thead><tr><th>Description</th><th>Category</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${itemRows}</tbody></table>
      <p style="margin-top:15px">Subtotal: ₦${(parseFloat(inv.subtotal) || 0).toLocaleString()}</p>
      <p>Discount: ₦${(parseFloat(inv.discount) || 0).toLocaleString()}</p>
      <p class="total">Total: ₦${(parseFloat(inv.total) || 0).toLocaleString()}</p>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Billing & Invoicing</h1>
        <Dialog open={createOpen} onOpenChange={o => { setCreateOpen(o); if (!o) resetCreateForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Invoice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Patient selection */}
              <div>
                <Label>Patient *</Label>
                {selectedPatientId ? (
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded mt-1">
                    <span className="text-sm font-medium">{selectedPatientName}</span>
                    <button onClick={() => { setSelectedPatientId(null); setPatientSearch(''); }} className="text-xs text-primary hover:underline">Change</button>
                  </div>
                ) : (
                  <>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search patient..." className="pl-10" />
                    </div>
                    {patientSearchResults.length > 0 && (
                      <div className="border border-border rounded mt-1 divide-y divide-border max-h-32 overflow-y-auto">
                        {patientSearchResults.map(p => (
                          <button key={p.id} onClick={() => {
                            setSelectedPatientId(p.id);
                            setSelectedPatientName(`${p.first_name} ${p.last_name}`);
                            setPatientSearch('');
                          }} className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm">
                            {p.first_name} {p.last_name} <span className="text-xs text-muted-foreground ml-1">{p.patient_code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quick-add services */}
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Services</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {Object.entries(SERVICE_PRICES).map(([name, price]) => (
                    <button key={name} onClick={() => addItem(name, 'service', price)}
                      className="px-2 py-1 rounded text-xs border border-border hover:border-primary/50 bg-background transition-colors">
                      {name} (₦{price.toLocaleString()})
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Lab Tests</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {Object.entries(LAB_PRICES).map(([name, price]) => (
                    <button key={name} onClick={() => addItem(name, 'lab', price)}
                      className="px-2 py-1 rounded text-xs border border-border hover:border-primary/50 bg-background transition-colors">
                      {name} (₦{price.toLocaleString()})
                    </button>
                  ))}
                </div>
              </div>

              {/* Items table */}
              {items.length > 0 && (
                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50">
                      <th className="text-left px-3 py-1.5 text-xs">Item</th>
                      <th className="text-center px-3 py-1.5 text-xs">Qty</th>
                      <th className="text-right px-3 py-1.5 text-xs">Price</th>
                      <th className="text-right px-3 py-1.5 text-xs">Total</th>
                      <th className="px-2 py-1.5"></th>
                    </tr></thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-1.5">{item.description}</td>
                          <td className="px-3 py-1.5 text-center">
                            <input type="number" value={item.quantity} min={1}
                              onChange={e => updateItemQty(i, parseInt(e.target.value) || 1)}
                              className="w-12 text-center border border-input rounded px-1 py-0.5 text-xs bg-background" />
                          </td>
                          <td className="px-3 py-1.5 text-right">₦{item.unit_price.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-right font-medium">₦{item.total.toLocaleString()}</td>
                          <td className="px-2 py-1.5">
                            <button onClick={() => removeItem(i)} className="text-destructive hover:text-destructive/80 text-xs">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount (₦)</Label>
                  <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="mt-1" min="0" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" placeholder="Optional" />
                </div>
              </div>

              <div className="bg-muted/50 rounded p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
                {discountVal > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-₦{discountVal.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-lg border-t border-border pt-1"><span>Total</span><span>₦{total.toLocaleString()}</span></div>
              </div>

              <Button onClick={() => createMutation.mutate()} className="w-full" disabled={createMutation.isPending || !selectedPatientId || items.length === 0}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Receipt className="h-4 w-4 mr-2" />}
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Receipt className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{invoices.length}</p>
            <p className="text-xs text-muted-foreground">Total Invoices</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">₦{totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Revenue (Paid)</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Banknote className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{paid.length}</p>
            <p className="text-xs text-muted-foreground">Paid Invoices</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by invoice # or patient name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="unpaid">
          <TabsList>
            <TabsTrigger value="unpaid" className="gap-1"><DollarSign className="h-3 w-3" /> Unpaid ({unpaid.length})</TabsTrigger>
            <TabsTrigger value="paid" className="gap-1"><CheckCircle className="h-3 w-3" /> Paid ({paid.length})</TabsTrigger>
          </TabsList>

          {['unpaid', 'paid'].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="card-ehr overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="table-header">
                        <th className="text-left px-4 py-2 font-medium">Invoice #</th>
                        <th className="text-left px-4 py-2 font-medium">Patient</th>
                        <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Date</th>
                        <th className="text-right px-4 py-2 font-medium">Total</th>
                        <th className="text-left px-4 py-2 font-medium">Status</th>
                        <th className="text-left px-4 py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(tab === 'unpaid' ? unpaid : paid).map((inv: any) => (
                        <tr key={inv.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-2 font-mono text-xs">{inv.invoice_number}</td>
                          <td className="px-4 py-2 font-medium">{inv.patient.first_name} {inv.patient.last_name}</td>
                          <td className="px-4 py-2 text-muted-foreground text-xs hidden sm:table-cell">{new Date(inv.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-right font-semibold">₦{(parseFloat(inv.total) || 0).toLocaleString()}</td>
                          <td className="px-4 py-2">
                            <span className={inv.status === 'paid' ? 'text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800' : 'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800'}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-1">
                              {inv.status === 'unpaid' && (
                                <PayButton invoice={inv} onPay={(method) => payMutation.mutate({ id: inv.id, method })} />
                              )}
                              <button onClick={() => printInvoice(inv)} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                                <Printer className="h-3 w-3" /> Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(tab === 'unpaid' ? unpaid : paid).length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No {tab} invoices.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function PayButton({ invoice, onPay }: { invoice: any; onPay: (method: string) => void }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('cash');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-primary hover:underline flex items-center gap-0.5">
          <CreditCard className="h-3 w-3" /> Pay
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <p className="text-sm">Invoice: <span className="font-mono">{invoice.invoice_number}</span></p>
        <p className="text-lg font-bold">₦{(parseFloat(invoice.total) || 0).toLocaleString()}</p>
        <div>
          <Label>Payment Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card (POS)</SelectItem>
              <SelectItem value="transfer">Bank Transfer</SelectItem>
              <SelectItem value="insurance">Insurance/HMO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { onPay(method); setOpen(false); }} className="w-full gap-2">
          <CheckCircle className="h-4 w-4" /> Confirm Payment
        </Button>
      </DialogContent>
    </Dialog>
  );
}
