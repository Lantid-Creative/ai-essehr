import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { CheckCircle, XCircle, UserPlus, Loader2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const ROLE_LABELS: Record<string, string> = {
  facility_admin: 'Facility Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  chew: 'CHEW',
  lab_tech: 'Lab Technician',
  pharmacist: 'Pharmacist',
  data_clerk: 'Data Clerk',
};

export default function StaffPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('nurse');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('facility_id', facilityId);
      if (!profiles) return [];

      const userIds = profiles.map(p => p.id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      return profiles.map(p => ({
        ...p,
        roles: (roles || []).filter(r => r.user_id === p.id).map(r => r.role),
      }));
    },
    enabled: !!facilityId,
  });

  const addStaffMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-staff', {
        body: { email, password, full_name: fullName, role, job_title: jobTitle, department, facility_id: facilityId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      toast({ title: 'Staff member added', description: `${fullName} has been created successfully.` });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setOpen(false);
      setEmail(''); setFullName(''); setPassword(''); setRole('nurse'); setJobTitle(''); setDepartment('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ staffId, isActive }: { staffId: string; isActive: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_active: !isActive }).eq('id', staffId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: 'Staff status updated' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const filteredStaff = staffList.filter((s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.full_name.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || s.roles.some((r: string) => (ROLE_LABELS[r] || r).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Health Worker Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" /> Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addStaffMutation.mutate(); }} className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label>Temporary Password *</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role *</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Outpatient" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Job Title</Label>
                <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Nurse" className="mt-1" />
              </div>
              <Button type="submit" className="w-full" disabled={addStaffMutation.isPending}>
                {addStaffMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding...</> : 'Add Staff Member'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="card-ehr p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or role..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="card-ehr overflow-hidden">
        <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground">
          {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Role</th>
                  <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Department</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s: any) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <div>
                        <p className="font-medium">{s.full_name}</p>
                        {s.job_title && <p className="text-xs text-muted-foreground">{s.job_title}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {s.roles.map((r: string) => (
                          <span key={r} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{ROLE_LABELS[r] || r}</span>
                        ))}
                        {s.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden md:table-cell text-xs">{s.email}</td>
                    <td className="px-4 py-2 text-muted-foreground hidden lg:table-cell">{s.department || '—'}</td>
                    <td className="px-4 py-2">
                      {s.is_active
                        ? <span className="badge-success flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Active</span>
                        : <span className="badge-warning flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Inactive</span>}
                    </td>
                    <td className="px-4 py-2">
                      {s.id !== user?.id && (
                        <button
                          onClick={() => toggleActiveMutation.mutate({ staffId: s.id, isActive: s.is_active })}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          title={s.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {s.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          {s.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No staff members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
