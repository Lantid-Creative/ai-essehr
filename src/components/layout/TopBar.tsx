import { Bell, Menu, Wifi, WifiOff, LogOut, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/hooks/useOfflineSync';

export default function TopBar() {
  const { sidebarOpen, setSidebarOpen, profile, roles, signOut } = useAppContext();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayRole = roles.length > 0
    ? roles[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Staff';

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <header className="h-16 bg-[hsl(var(--topbar))] text-[hsl(var(--topbar-foreground))] flex items-center px-4 gap-3 shrink-0">
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden sm:block min-w-0">
        <p className="text-sm font-heading font-medium truncate">{profile?.full_name || 'AI-ESS EHR'}</p>
        <p className="text-[11px] opacity-70 truncate">{displayRole}</p>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1 text-xs">
        {isOnline ? (
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
      </div>

      <button className="relative p-1">
        <Bell className="h-5 w-5" />
      </button>

      <div className="hidden md:flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          {initials}
        </div>
        <div className="text-xs leading-tight">
          <p className="font-medium">{profile?.full_name || 'User'}</p>
          <p className="opacity-70">{displayRole}</p>
        </div>
      </div>

      <button onClick={handleSignOut} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Sign out">
        <LogOut className="h-4 w-4" />
      </button>
    </header>
  );
}
