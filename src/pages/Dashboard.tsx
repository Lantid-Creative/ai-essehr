import { useAppContext } from '@/context/AppContext';
import FacilityDashboard from '@/components/dashboard/FacilityDashboard';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import NurseDashboard from '@/components/dashboard/NurseDashboard';
import CHEWDashboard from '@/components/dashboard/CHEWDashboard';
import LabTechDashboard from '@/components/dashboard/LabTechDashboard';
import PharmacistDashboard from '@/components/dashboard/PharmacistDashboard';
import DataClerkDashboard from '@/components/dashboard/DataClerkDashboard';
import EpidemiologistDashboard from '@/components/dashboard/EpidemiologistDashboard';
import NCDCDashboard from '@/components/dashboard/NCDCDashboard';

export default function Dashboard() {
  const { roles } = useAppContext();

  // Priority order: most specific role first
  if (roles.includes('super_admin')) return <NCDCDashboard />;
  if (roles.includes('epidemiologist') || roles.includes('dsno')) return <EpidemiologistDashboard />;
  if (roles.includes('doctor')) return <DoctorDashboard />;
  if (roles.includes('nurse')) return <NurseDashboard />;
  if (roles.includes('chew')) return <CHEWDashboard />;
  if (roles.includes('lab_tech')) return <LabTechDashboard />;
  if (roles.includes('pharmacist')) return <PharmacistDashboard />;
  if (roles.includes('data_clerk')) return <DataClerkDashboard />;
  if (roles.includes('facility_admin')) return <FacilityDashboard />;

  return <FacilityDashboard />;
}
