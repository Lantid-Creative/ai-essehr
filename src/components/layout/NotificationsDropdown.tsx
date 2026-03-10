import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, FlaskConical, Pill, Syringe, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'alert' | 'lab' | 'pharmacy' | 'appointment';
  title: string;
  description: string;
  time: string;
  link: string;
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const { facilityId, roles } = useAppContext();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', facilityId],
    queryFn: async (): Promise<Notification[]> => {
      if (!facilityId) return [];
      const items: Notification[] = [];

      // Active surveillance alerts
      const { data: alerts } = await supabase.from('surveillance_alerts')
        .select('id, disease_name, severity, detected_at')
        .eq('facility_id', facilityId)
        .in('status', ['pending', 'investigating'])
        .order('detected_at', { ascending: false })
        .limit(5);

      (alerts || []).forEach(a => {
        items.push({
          id: `alert-${a.id}`,
          type: 'alert',
          title: `${a.severity === 'critical' ? '🔴' : '🟡'} ${a.disease_name} Alert`,
          description: `${a.severity} severity — requires attention`,
          time: new Date(a.detected_at).toLocaleDateString(),
          link: '/surveillance',
        });
      });

      // Pending lab results (for doctors/nurses)
      if (roles.some(r => ['doctor', 'nurse', 'facility_admin', 'lab_tech'].includes(r))) {
        const { count } = await supabase.from('lab_results')
          .select('id', { count: 'exact', head: true })
          .eq('facility_id', facilityId)
          .is('result', null);
        if (count && count > 0) {
          items.push({
            id: 'pending-labs',
            type: 'lab',
            title: `${count} Pending Lab Result${count > 1 ? 's' : ''}`,
            description: 'Tests awaiting results entry',
            time: 'Now',
            link: '/laboratory',
          });
        }
      }

      // Pending prescriptions (for pharmacists)
      if (roles.some(r => ['pharmacist', 'facility_admin'].includes(r))) {
        const { data: rxData } = await supabase.from('encounters')
          .select('id, prescriptions, dispensed_at')
          .eq('facility_id', facilityId)
          .not('prescriptions', 'is', null)
          .is('dispensed_at', null)
          .limit(100);
        const pending = (rxData || []).filter(e => Array.isArray(e.prescriptions) && (e.prescriptions as any[]).length > 0);
        if (pending.length > 0) {
          items.push({
            id: 'pending-rx',
            type: 'pharmacy',
            title: `${pending.length} Prescription${pending.length > 1 ? 's' : ''} to Dispense`,
            description: 'Medications awaiting dispensing',
            time: 'Now',
            link: '/pharmacy',
          });
        }
      }

      // Today's appointments
      if (roles.some(r => ['doctor', 'nurse', 'facility_admin', 'chew', 'data_clerk'].includes(r))) {
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase.from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('facility_id', facilityId)
          .eq('appointment_date', today)
          .eq('status', 'scheduled');
        if (count && count > 0) {
          items.push({
            id: 'today-appts',
            type: 'appointment',
            title: `${count} Appointment${count > 1 ? 's' : ''} Today`,
            description: 'Patients scheduled for today',
            time: 'Today',
            link: '/appointments',
          });
        }
      }

      return items;
    },
    enabled: !!facilityId,
    refetchInterval: 30000,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notifications]')) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const iconMap = {
    alert: <AlertTriangle className="h-4 w-4 text-warning" />,
    lab: <FlaskConical className="h-4 w-4 text-accent" />,
    pharmacy: <Pill className="h-4 w-4 text-primary" />,
    appointment: <Syringe className="h-4 w-4 text-primary" />,
  };

  return (
    <div className="relative" data-notifications>
      <button className="relative p-1" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-heading font-medium text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications</p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => { navigate(n.link); setOpen(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border last:border-0 flex items-start gap-3 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">{iconMap[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
