import AppSidebar from './AppSidebar';
import TopBar from './TopBar';
import { useAppContext } from '@/context/AppContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppContext();

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarOpen ? 'lg:ml-60' : ''}`}>
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
