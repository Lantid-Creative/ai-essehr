import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Pill, Clock, CheckCircle, Package, Loader2 } from 'lucide-react';

export default function PharmacistDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['pharmacist-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { pending: 0, dispensed: 0, totalDrugs: 0 };
      const { data } = await supabase.from('encounters')
        .select('id, prescriptions, referral_notes')
        .eq('facility_id', facilityId)
        .not('prescriptions', 'is', null)
        .limit(200);
      if (!data) return { pending: 0, dispensed: 0, totalDrugs: 0 };

      const withRx = data.filter(e => Array.isArray(e.prescriptions) && (e.prescriptions as any[]).length > 0);
      const pending = withRx.filter(e => e.referral_notes !== '__dispensed__').length;
      const dispensed = withRx.filter(e => e.referral_notes === '__dispensed__').length;
      const totalDrugs = withRx.reduce((s, e) => s + (e.prescriptions as any[]).length, 0);

      return { pending, dispensed, totalDrugs };
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Pharmacist Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Pending Dispensing" value={stats?.pending || 0} icon={<Clock className="h-5 w-5 text-warning" />} />
        <StatCard label="Dispensed" value={stats?.dispensed || 0} icon={<CheckCircle className="h-5 w-5 text-success" />} />
        <StatCard label="Total Drug Items" value={stats?.totalDrugs || 0} icon={<Package className="h-5 w-5 text-primary" />} />
      </div>

      <Link to="/pharmacy" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
        <Pill className="h-4 w-4" /> Go to Pharmacy
      </Link>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Quick Actions</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• View and dispense prescriptions from the Pharmacy page</p>
          <p>• Prescriptions are created automatically during consultations</p>
          <p>• Mark items as dispensed to track fulfillment</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="stat-card flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-heading font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
