import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';

export default function SuspensionGate({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAppContext();
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !profile?.is_suspended) { setReason(null); return; }
    supabase.from('user_suspensions')
      .select('reason')
      .eq('user_id', user.id)
      .is('lifted_at', null)
      .maybeSingle()
      .then(({ data }) => setReason(data?.reason || 'Account suspended.'));
  }, [user, profile?.is_suspended]);

  if (profile?.is_suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Account suspended</AlertTitle>
            <AlertDescription className="mt-2">
              {reason || 'Your account has been suspended by a platform administrator.'}
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="w-full mt-4" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
