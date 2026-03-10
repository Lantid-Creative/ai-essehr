import { Link, useLocation } from 'react-router-dom';
import { useAppContext, AppRole } from '@/context/AppContext';
import {
  LayoutDashboard, UserPlus, Stethoscope, BedDouble, Shield, Syringe,
  FlaskConical, Pill, Baby, Users, BarChart3, Wifi, Settings, X, Activity
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: AppRole[]; // If empty/undefined, visible to all
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', path: '/patients', icon: UserPlus, roles: ['facility_admin', 'doctor', 'nurse', 'chew', 'data_clerk'] },
  { label: 'Consultation', path: '/consultation', icon: Stethoscope, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: 'Wards', path: '/wards', icon: BedDouble, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: 'Surveillance', path: '/surveillance', icon: Shield, roles: ['facility_admin', 'doctor', 'nurse', 'chew', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Immunization', path: '/immunization', icon: Syringe, roles: ['facility_admin', 'nurse', 'chew'] },
  { label: 'Laboratory', path: '/laboratory', icon: FlaskConical, roles: ['facility_admin', 'doctor', 'lab_tech'] },
  { label: 'Pharmacy', path: '/pharmacy', icon: Pill, roles: ['facility_admin', 'doctor', 'pharmacist'] },
  { label: 'MCH', path: '/mch', icon: Baby, roles: ['facility_admin', 'nurse', 'chew'] },
  { label: 'Staff', path: '/staff', icon: Users, roles: ['facility_admin', 'super_admin'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['facility_admin', 'data_clerk', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Sync', path: '/sync', icon: Wifi },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function AppSidebar() {
  const { sidebarOpen, setSidebarOpen, roles } = useAppContext();
  const location = useLocation();

  const visibleItems = allNavItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some(r => roles.includes(r));
  });

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-60`}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <Activity className="h-6 w-6 text-primary" />
          <div className="flex-1 min-w-0">
            <span className="font-heading font-bold text-base tracking-tight">AI-ESS EHR</span>
            <p className="text-[10px] text-sidebar-foreground/70 leading-tight truncate">
              Surveillance-First Platform
            </p>
          </div>
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {visibleItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-body transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/50">
          © {new Date().getFullYear()} Lantid Creative LTD
        </div>
      </aside>
    </>
  );
}
