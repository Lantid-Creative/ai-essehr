import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, XCircle, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Gates access for facilities that aren't yet approved.
 * - super_admin and users without a facility bypass entirely.
 * - facility_admin of a pending/rejected/suspended facility can still log in
 *   (so they can complete setup / contact NCDC) but only see this gate.
 * - Any other staff role at a non-active facility is fully blocked.
 */
export default function FacilityGate({ children }: { children: React.ReactNode }) {
  const { facilityId, roles, signOut } = useAppContext();
  const [status, setStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = roles.includes('super_admin');
  const isFacilityAdmin = roles.includes('facility_admin');

  useEffect(() => {
    if (!facilityId || isSuperAdmin) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('facilities')
        .select('status, rejection_reason, name')
        .eq('id', facilityId)
        .maybeSingle();
      if (mounted && data) {
        setStatus(data.status);
        setRejectionReason(data.rejection_reason);
        setFacilityName(data.name);
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [facilityId, isSuperAdmin]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Bypass for super_admin or users not tied to a facility yet
  if (isSuperAdmin || !facilityId || status === 'active' || !status) {
    return <>{children}</>;
  }

  // Non-admin staff at a non-active facility get fully blocked
  if (!isFacilityAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold">Facility access disabled</h1>
            <p className="text-sm text-muted-foreground">
              <strong>{facilityName}</strong> is currently {status}. Please contact your facility administrator.
            </p>
            <Button onClick={signOut} variant="outline">Sign out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Facility admin sees a status page
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center space-y-4">
          {status === 'pending' && <Clock className="h-12 w-12 text-warning mx-auto" />}
          {status === 'rejected' && <XCircle className="h-12 w-12 text-destructive mx-auto" />}
          {status === 'suspended' && <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />}

          <div>
            <h1 className="text-xl font-bold">{facilityName}</h1>
            <p className="text-sm text-muted-foreground capitalize mt-1">Status: {status}</p>
          </div>

          {status === 'pending' && (
            <p className="text-sm text-muted-foreground">
              Your facility is awaiting verification by NCDC / NGF. You'll be notified once approved, after which your team
              can begin using Integra+. Approval typically takes 1–2 business days.
            </p>
          )}
          {status === 'rejected' && (
            <div className="text-sm text-left bg-destructive/10 p-3 rounded-md">
              <p className="font-medium text-destructive">Application rejected</p>
              {rejectionReason && <p className="mt-1">{rejectionReason}</p>}
              <p className="mt-2 text-muted-foreground">Please contact NCDC at support@ncdc.gov.ng to appeal or resubmit.</p>
            </div>
          )}
          {status === 'suspended' && (
            <p className="text-sm text-muted-foreground">
              Your facility access has been suspended. Please contact NCDC for reactivation.
            </p>
          )}

          <Button onClick={signOut} variant="outline">Sign out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
