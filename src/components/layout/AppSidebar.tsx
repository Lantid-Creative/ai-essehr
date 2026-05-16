import { Link, useLocation } from 'react-router-dom';
import { useAppContext, AppRole } from '@/context/AppContext';
import {
  LayoutDashboard, UserPlus, Stethoscope, BedDouble, Shield, Syringe,
  FlaskConical, Pill, Baby, Users, BarChart3, Wifi, Settings, X, Activity,
  CalendarPlus, ClipboardList, Package, Receipt, AlertTriangle, Globe, ArrowRightLeft, Building2, Truck, AlertOctagon, ShieldCheck, FileText, TrendingUp, MapPin, Brain, Crown,
  HeartPulse, Banknote, TestTube, Inbox, FileSignature, FileCheck,
  Baby as BabyIcon, FileWarning, Thermometer, ClipboardCheck, Target
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: AppRole[];
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Queue & Triage', path: '/appointments', icon: CalendarPlus, roles: ['facility_admin', 'doctor', 'nurse', 'chew', 'data_clerk'] },
  { label: 'Patients', path: '/patients', icon: UserPlus, roles: ['facility_admin', 'doctor', 'nurse', 'chew', 'data_clerk'] },
  { label: 'Consultation', path: '/consultation', icon: Stethoscope, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: 'Wards', path: '/wards', icon: BedDouble, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: 'Surveillance', path: '/surveillance', icon: Shield, roles: ['facility_admin', 'doctor', 'nurse', 'chew', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Early Warnings', path: '/early-warnings', icon: AlertTriangle, roles: ['facility_admin', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Immunization', path: '/immunization', icon: Syringe, roles: ['facility_admin', 'nurse', 'chew'] },
  { label: 'Laboratory', path: '/laboratory', icon: FlaskConical, roles: ['facility_admin', 'doctor', 'lab_tech'] },
  { label: 'Pharmacy', path: '/pharmacy', icon: Pill, roles: ['facility_admin', 'doctor', 'pharmacist'] },
  { label: 'Drug Inventory', path: '/inventory', icon: Package, roles: ['facility_admin', 'pharmacist'] },
  { label: 'Billing', path: '/billing', icon: Receipt, roles: ['facility_admin', 'doctor', 'nurse', 'data_clerk'] },
  { label: 'Insurance & Claims', path: '/insurance', icon: FileCheck, roles: ['facility_admin', 'data_clerk'] },
  { label: 'Cashier Shift', path: '/cashier', icon: Banknote, roles: ['facility_admin', 'data_clerk'] },
  { label: 'My Tasks', path: '/tasks', icon: Inbox, roles: ['facility_admin', 'doctor', 'nurse', 'lab_tech', 'pharmacist'] },
  { label: 'Nursing Station', path: '/nursing', icon: HeartPulse, roles: ['facility_admin', 'nurse'] },
  { label: 'Specimens', path: '/specimens', icon: TestTube, roles: ['facility_admin', 'lab_tech'] },
  { label: 'Consent Forms', path: '/consents', icon: FileSignature, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: 'Referrals', path: '/referrals', icon: ArrowRightLeft, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: '🚨 Rescue Tap', path: '/rescue', icon: AlertOctagon },
  { label: 'Ambulance Portal', path: '/ambulance', icon: Truck, roles: ['paramedic'] },
  { label: 'Ambulance Fleet', path: '/fleet', icon: Truck, roles: ['facility_admin', 'super_admin'] },
  { label: 'ER Inbound', path: '/er-inbound', icon: AlertOctagon, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: '👑 Super Admin Portal', path: '/super-admin', icon: Crown, roles: ['super_admin'] },
  { label: 'Facility Admin', path: '/admin/facilities', icon: Building2, roles: ['super_admin'] },
  { label: 'Facility Audit', path: '/admin/facility-audit', icon: ShieldCheck, roles: ['super_admin'] },
  { label: 'MCH', path: '/mch', icon: Baby, roles: ['facility_admin', 'nurse', 'chew'] },
  { label: 'Birth Registration', path: '/births', icon: BabyIcon, roles: ['facility_admin', 'doctor', 'nurse', 'chew', 'data_clerk'] },
  { label: 'Death Registration', path: '/deaths', icon: FileWarning, roles: ['facility_admin', 'doctor', 'data_clerk'] },
  { label: 'NHMIS Registers', path: '/nhmis-registers', icon: ClipboardCheck, roles: ['facility_admin', 'nurse', 'chew', 'data_clerk'] },
  { label: 'NHMIS 001 Monthly', path: '/nhmis-001', icon: ClipboardCheck, roles: ['facility_admin', 'data_clerk', 'super_admin'] },
  { label: 'Cold Chain', path: '/cold-chain', icon: Thermometer, roles: ['facility_admin', 'nurse', 'pharmacist'] },
  { label: 'Discharge Summaries', path: '/discharge-summaries', icon: FileCheck, roles: ['facility_admin', 'doctor', 'nurse'] },
  { label: 'Staff', path: '/staff', icon: Users, roles: ['facility_admin', 'super_admin'] },
  { label: 'NHED Empanelment', path: '/nhed', icon: ShieldCheck, roles: ['facility_admin', 'super_admin'] },
  { label: 'Facility Operations', path: '/operations', icon: Building2, roles: ['facility_admin', 'super_admin'] },
  { label: 'Microplan & Targets', path: '/microplan', icon: Target, roles: ['facility_admin', 'super_admin'] },
  { label: 'WDC & Supervision', path: '/wdc', icon: ClipboardCheck, roles: ['facility_admin', 'super_admin'] },
  { label: 'Quality Improvement', path: '/qi', icon: TrendingUp, roles: ['facility_admin', 'doctor', 'nurse', 'super_admin'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['facility_admin', 'data_clerk', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Custom Report Builder', path: '/reports/builder', icon: FileText, roles: ['facility_admin', 'data_clerk', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'IDSR Weekly', path: '/reports/idsr', icon: FileText, roles: ['facility_admin', 'data_clerk', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Facility KPIs', path: '/reports/kpis', icon: TrendingUp, roles: ['facility_admin', 'data_clerk', 'super_admin'] },
  { label: 'Geo Heatmap', path: '/reports/heatmap', icon: MapPin, roles: ['facility_admin', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'AI Anomaly Detection', path: '/ai-anomaly', icon: Brain, roles: ['facility_admin', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Data Chain', path: '/data-chain', icon: Globe, roles: ['facility_admin', 'epidemiologist', 'dsno', 'super_admin'] },
  { label: 'Audit Trail', path: '/audit', icon: ClipboardList, roles: ['facility_admin', 'super_admin'] },
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
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-heading font-bold text-sm tracking-tight">AI-PEWS</span>
            <p className="text-[10px] text-sidebar-foreground/60 leading-tight truncate">
              Early Warning System
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
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-body transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-sidebar-border text-[10px] text-sidebar-foreground/40">
          <p>© {new Date().getFullYear()} Lantid Creative LTD</p>
          <p className="mt-0.5">Powered by Nigeria Governors' Forum</p>
        </div>
      </aside>
    </>
  );
}
