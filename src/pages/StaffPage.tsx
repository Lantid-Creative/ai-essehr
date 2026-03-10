import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { CheckCircle, XCircle, UserPlus, Loader2 } from 'lucide-react';
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
  const { facilityId } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('nurse');
  const [jobTitle, setJobTitle] = useState('');

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('facility_id', facilityId);
      if (!profiles) return [];

      // Fetch roles for each staff member
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
      // Sign up the new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Update their profile with facility_id and job_title
      await supabase.from('profiles').update({
        facility_id: facilityId,
        job_title: jobTitle || null,
      }).eq('id', authData.user.id);

      // Assign role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: role as any,
        facility_id: facilityId,
      });
    },
    onSuccess: () => {
      toast({ title: 'Staff member added', description: `${fullName} has been invited.` });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setOpen(false);
      setEmail(''); setFullName(''); setPassword(''); setRole('nurse'); setJobTitle('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
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

      <div className="card-ehr overflow-hidden">
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
                  <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Job Title</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(s => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{s.full_name}</td>
                    <td className="px-4 py-2">
                      {s.roles.map((r: string) => ROLE_LABELS[r] || r).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden md:table-cell">{s.email}</td>
                    <td className="px-4 py-2 text-muted-foreground hidden lg:table-cell">{s.job_title || '—'}</td>
                    <td className="px-4 py-2">
                      {s.is_active
                        ? <span className="badge-success flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Active</span>
                        : <span className="badge-warning flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Inactive</span>}
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No staff members found. Add your first team member above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
