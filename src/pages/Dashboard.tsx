import { useAppContext } from '@/context/AppContext';
import FacilityDashboard from '@/components/dashboard/FacilityDashboard';
import EpidemiologistDashboard from '@/components/dashboard/EpidemiologistDashboard';
import NCDCDashboard from '@/components/dashboard/NCDCDashboard';

export default function Dashboard() {
  const { currentRole } = useAppContext();

  if (currentRole === 'State Epidemiologist') return <EpidemiologistDashboard />;
  if (currentRole === 'NCDC Officer') return <NCDCDashboard />;
  return <FacilityDashboard />;
}
