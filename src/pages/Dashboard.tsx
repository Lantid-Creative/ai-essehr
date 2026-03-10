import { useAppContext } from '@/context/AppContext';
import FacilityDashboard from '@/components/dashboard/FacilityDashboard';
import EpidemiologistDashboard from '@/components/dashboard/EpidemiologistDashboard';
import NCDCDashboard from '@/components/dashboard/NCDCDashboard';

export default function Dashboard() {
  const { roles } = useAppContext();

  if (roles.includes('epidemiologist') || roles.includes('dsno')) return <EpidemiologistDashboard />;
  if (roles.includes('super_admin')) return <NCDCDashboard />;
  return <FacilityDashboard />;
}
