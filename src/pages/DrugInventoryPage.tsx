import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import {
  Package, Plus, AlertTriangle, Search, Loader2, Edit, Save, X, Trash2,
  TrendingDown, CalendarX, BarChart3
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

const CATEGORIES = ['Antimalarials', 'Antibiotics', 'Analgesics', 'Antihypertensives', 'Antidiabetics', 'Vitamins', 'ORS/Fluids', 'Vaccines', 'Contraceptives', 'General'];
const UNITS = ['tablets', 'capsules', 'vials', 'bottles', 'sachets', 'ampoules', 'tubes', 'strips'];

export default function DrugInventoryPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form state
  const [form, setForm] = useState({
    drug_name: '', generic_name: '', category: 'General', unit: 'tablets',
    quantity_in_stock: '', reorder_level: '10', unit_cost: '',
    batch_number: '', expiry_date: '', supplier: '',
  });

  const resetForm = () => {
    setForm({
      drug_name: '', generic_name: '', category: 'General', unit: 'tablets',
      quantity_in_stock: '', reorder_level: '10', unit_cost: '',
      batch_number: '', expiry_date: '', supplier: '',
    });
    setEditId(null);
  };

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['drug-inventory', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('drug_inventory' as any)
        .select('*')
        .eq('facility_id', facilityId)
        .order('drug_name');
      return (data || []) as any[];
    },
    enabled: !!facilityId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        facility_id: facilityId,
        drug_name: form.drug_name,
        generic_name: form.generic_name || null,
        category: form.category,
        unit: form.unit,
        quantity_in_stock: parseInt(form.quantity_in_stock) || 0,
        reorder_level: parseInt(form.reorder_level) || 10,
        unit_cost: parseFloat(form.unit_cost) || 0,
        batch_number: form.batch_number || null,
        expiry_date: form.expiry_date || null,
        supplier: form.supplier || null,
        last_restocked_at: new Date().toISOString(),
      };

      if (editId) {
        const { error } = await supabase.from('drug_inventory' as any).update(payload as any).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('drug_inventory' as any).insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editId ? 'Drug updated' : 'Drug added to inventory' });
      queryClient.invalidateQueries({ queryKey: ['drug-inventory'] });
      setAddOpen(false);
      resetForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('drug_inventory' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Drug removed from inventory' });
      queryClient.invalidateQueries({ queryKey: ['drug-inventory'] });
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, qty }: { id: string; qty: number }) => {
      const item = inventory.find((i: any) => i.id === id);
      if (!item) return;
      const { error } = await supabase.from('drug_inventory' as any)
        .update({
          quantity_in_stock: item.quantity_in_stock + qty,
          last_restocked_at: new Date().toISOString(),
        } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Stock updated' });
      queryClient.invalidateQueries({ queryKey: ['drug-inventory'] });
    },
  });

  const filtered = inventory.filter((d: any) => {
    const matchSearch = !search || d.drug_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.generic_name && d.generic_name.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const lowStock = inventory.filter((d: any) => d.quantity_in_stock <= d.reorder_level);
  const today = new Date();
  const expiringSoon = inventory.filter((d: any) => {
    if (!d.expiry_date) return false;
    const exp = new Date(d.expiry_date);
    const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  });
  const expired = inventory.filter((d: any) => d.expiry_date && new Date(d.expiry_date) < today);
  const totalValue = inventory.reduce((s: number, d: any) => s + (d.quantity_in_stock * (d.unit_cost || 0)), 0);

  const openEdit = (item: any) => {
    setForm({
      drug_name: item.drug_name,
      generic_name: item.generic_name || '',
      category: item.category || 'General',
      unit: item.unit || 'tablets',
      quantity_in_stock: String(item.quantity_in_stock),
      reorder_level: String(item.reorder_level),
      unit_cost: String(item.unit_cost || ''),
      batch_number: item.batch_number || '',
      expiry_date: item.expiry_date || '',
      supplier: item.supplier || '',
    });
    setEditId(item.id);
    setAddOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Drug Inventory</h1>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Drug</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Drug' : 'Add New Drug'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Drug Name *</Label>
                  <Input value={form.drug_name} onChange={e => setForm(f => ({ ...f, drug_name: e.target.value }))} required className="mt-1" />
                </div>
                <div>
                  <Label>Generic Name</Label>
                  <Input value={form.generic_name} onChange={e => setForm(f => ({ ...f, generic_name: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity in Stock *</Label>
                  <Input type="number" value={form.quantity_in_stock} onChange={e => setForm(f => ({ ...f, quantity_in_stock: e.target.value }))} required className="mt-1" min="0" />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reorder Level</Label>
                  <Input type="number" value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: e.target.value }))} className="mt-1" min="0" />
                </div>
                <div>
                  <Label>Unit Cost (₦)</Label>
                  <Input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input value={form.batch_number} onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Supplier</Label>
                  <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editId ? 'Update Drug' : 'Add to Inventory'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Package className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{inventory.length}</p>
            <p className="text-xs text-muted-foreground">Total Drugs</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <TrendingDown className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium text-destructive">{lowStock.length}</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CalendarX className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{expiringSoon.length + expired.length}</p>
            <p className="text-xs text-muted-foreground">Expiring/Expired</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">₦{totalValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Stock Value</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || expired.length > 0) && (
        <div className="space-y-2">
          {lowStock.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">Low Stock Alert ({lowStock.length} items)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lowStock.slice(0, 5).map((d: any) => `${d.drug_name} (${d.quantity_in_stock} left)`).join(', ')}
                  {lowStock.length > 5 && ` +${lowStock.length - 5} more`}
                </p>
              </div>
            </div>
          )}
          {expired.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
              <CalendarX className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">Expired Drugs ({expired.length})</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {expired.slice(0, 5).map((d: any) => d.drug_name).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search drugs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="card-ehr overflow-hidden">
          <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground">
            {filtered.length} drug{filtered.length !== 1 ? 's' : ''} in inventory
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-2 font-medium">Drug Name</th>
                  <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Category</th>
                  <th className="text-center px-4 py-2 font-medium">Stock</th>
                  <th className="text-center px-4 py-2 font-medium hidden sm:table-cell">Reorder</th>
                  <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Expiry</th>
                  <th className="text-right px-4 py-2 font-medium hidden md:table-cell">Cost</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d: any) => {
                  const isLow = d.quantity_in_stock <= d.reorder_level;
                  const isExpired = d.expiry_date && new Date(d.expiry_date) < today;
                  const isExpiring = d.expiry_date && !isExpired && ((new Date(d.expiry_date).getTime() - today.getTime()) / 86400000) <= 90;

                  return (
                    <tr key={d.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-2">
                        <p className="font-medium">{d.drug_name}</p>
                        {d.generic_name && <p className="text-xs text-muted-foreground">{d.generic_name}</p>}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground hidden md:table-cell">{d.category}</td>
                      <td className={`px-4 py-2 text-center font-semibold ${isLow ? 'text-destructive' : ''}`}>
                        {d.quantity_in_stock} <span className="text-xs font-normal text-muted-foreground">{d.unit}</span>
                      </td>
                      <td className="px-4 py-2 text-center text-muted-foreground hidden sm:table-cell">{d.reorder_level}</td>
                      <td className="px-4 py-2 hidden lg:table-cell text-xs">
                        {d.expiry_date ? new Date(d.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right hidden md:table-cell">₦{(d.unit_cost || 0).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        {isExpired ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Expired</span>
                        ) : isExpiring ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Expiring</span>
                        ) : isLow ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Low Stock</span>
                        ) : d.quantity_in_stock === 0 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Out of Stock</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">In Stock</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <RestockButton item={d} onRestock={(qty) => restockMutation.mutate({ id: d.id, qty })} />
                          <button onClick={() => openEdit(d)} className="p-1 text-muted-foreground hover:text-primary" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { if (confirm(`Delete ${d.drug_name}?`)) deleteMutation.mutate(d.id); }} className="p-1 text-muted-foreground hover:text-destructive" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    {inventory.length === 0 ? 'No drugs in inventory yet. Click "Add Drug" to start.' : 'No matching drugs found.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RestockButton({ item, onRestock }: { item: any; onRestock: (qty: number) => void }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1 text-muted-foreground hover:text-primary" title="Restock">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Restock: {item.drug_name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Current stock: {item.quantity_in_stock} {item.unit}</p>
        <div>
          <Label>Quantity to Add</Label>
          <Input type="number" value={qty} onChange={e => setQty(e.target.value)} className="mt-1" min="1" placeholder="Enter quantity..." />
        </div>
        <Button onClick={() => { onRestock(parseInt(qty) || 0); setOpen(false); setQty(''); }} disabled={!qty || parseInt(qty) <= 0} className="w-full">
          Add {qty || 0} {item.unit}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
