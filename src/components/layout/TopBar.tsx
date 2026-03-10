import { Bell, Menu, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { syncStatus, outbreakAlerts, staffUsers } from '@/data/mockData';
import type { UserRole } from '@/data/mockData';

const roles: UserRole[] = ['CHEW', 'Nurse', 'Doctor', 'Data Entry Clerk', 'Facility Admin', 'State Epidemiologist', 'NCDC Officer'];

export default function TopBar() {
  const { sidebarOpen, setSidebarOpen, currentRole, setCurrentRole } = useAppContext();
  const activeAlertCount = outbreakAlerts.filter(a => a.status !== 'Resolved').length;
  const user = staffUsers[0];

  return (
    <header className="h-16 bg-topbar text-topbar-foreground flex items-center px-4 gap-4 shrink-0">
      {/* Hamburger */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1">
          <Menu className="h-5 w-5" />
        </button>
      )}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-1">
        <Menu className="h-5 w-5" />
      </button>

      {/* Facility info */}
      <div className="hidden sm:block flex-1 min-w-0">
        <p className="text-sm font-heading font-medium truncate">Tudun Wada PHC</p>
        <p className="text-[11px] text-topbar-foreground/70">Kano Municipal LGA, Kano State</p>
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Role switcher */}
      <select
        value={currentRole}
        onChange={e => setCurrentRole(e.target.value as UserRole)}
        className="bg-sidebar-accent text-sidebar-accent-foreground text-xs rounded px-2 py-1 border-0 outline-none max-w-[140px]"
      >
        {roles.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* Connectivity */}
      <div className="flex items-center gap-1 text-xs">
        {syncStatus.isOnline ? (
          <>
            <Wifi className="h-3.5 w-3.5 text-success" />
            <span className="hidden md:inline text-success">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5 text-warning" />
            <span className="hidden md:inline text-warning">Offline</span>
          </>
        )}
        {syncStatus.recordsPending > 0 && (
          <span className="hidden lg:flex items-center gap-1 text-accent ml-1">
            <RefreshCw className="h-3 w-3 pulse-gold" />
            {syncStatus.recordsPending} pending
          </span>
        )}
      </div>

      {/* Alerts bell */}
      <button className="relative p-1">
        <Bell className="h-5 w-5" />
        {activeAlertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {activeAlertCount}
          </span>
        )}
      </button>

      {/* User */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="text-xs leading-tight">
          <p className="font-medium">{user.name}</p>
          <p className="text-topbar-foreground/70">{currentRole}</p>
        </div>
      </div>
    </header>
  );
}
