import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FacilityGate from "@/components/auth/FacilityGate";
import MFAGate from "@/components/auth/MFAGate";
import SuspensionGate from "@/components/auth/SuspensionGate";
import FacilityApprovalPage from "@/pages/FacilityApprovalPage";
import FacilityAuditTrailPage from "@/pages/FacilityAuditTrailPage";
import IDSRWeeklyReportPage from "@/pages/IDSRWeeklyReportPage";
import FacilityKPIPage from "@/pages/FacilityKPIPage";
import GeoHeatmapPage from "@/pages/GeoHeatmapPage";
import AIAnomalyDetectionPage from "@/pages/AIAnomalyDetectionPage";
import ReferralsPage from "@/pages/ReferralsPage";
import RescueTapPage from "@/pages/RescueTapPage";
import AmbulancePortalPage from "@/pages/AmbulancePortalPage";
import AmbulanceFleetPage from "@/pages/AmbulanceFleetPage";
import ERInboundPage from "@/pages/ERInboundPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import RegisterFacilityPage from "@/pages/RegisterFacilityPage";
import RegisterPatientPage from "@/pages/RegisterPatientPage";
import FAQPage from "@/pages/FAQPage";
import HelpPage from "@/pages/HelpPage";
import CommunityReportPage from "@/pages/CommunityReportPage";
import Dashboard from "@/pages/Dashboard";
import PatientsPage from "@/pages/PatientsPage";
import ConsultationPage from "@/pages/ConsultationPage";
import WardsPage from "@/pages/WardsPage";
import SurveillancePage from "@/pages/SurveillancePage";
import ImmunizationPage from "@/pages/ImmunizationPage";
import LaboratoryPage from "@/pages/LaboratoryPage";
import PharmacyPage from "@/pages/PharmacyPage";
import MCHPage from "@/pages/MCHPage";
import StaffPage from "@/pages/StaffPage";
import ReportsPage from "@/pages/ReportsPage";
import SyncPage from "@/pages/SyncPage";
import SettingsPage from "@/pages/SettingsPage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import AuditLogPage from "@/pages/AuditLogPage";
import DrugInventoryPage from "@/pages/DrugInventoryPage";
import BillingPage from "@/pages/BillingPage";
import DataChainPage from "@/pages/DataChainPage";
import EarlyWarningsPage from "@/pages/EarlyWarningsPage";
import SuperAdminPortalPage from "@/pages/SuperAdminPortalPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <SuspensionGate>
      <MFAGate>
        <FacilityGate>
          <MainLayout>{children}</MainLayout>
        </FacilityGate>
      </MFAGate>
    </SuspensionGate>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register/facility" element={<RegisterFacilityPage />} />
            <Route path="/register/patient" element={<RegisterPatientPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/community-report" element={<CommunityReportPage />} />

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/patients" element={<ProtectedPage><PatientsPage /></ProtectedPage>} />
            <Route path="/consultation" element={<ProtectedPage><ConsultationPage /></ProtectedPage>} />
            <Route path="/wards" element={<ProtectedPage><WardsPage /></ProtectedPage>} />
            <Route path="/surveillance" element={<ProtectedPage><SurveillancePage /></ProtectedPage>} />
            <Route path="/early-warnings" element={<ProtectedPage><EarlyWarningsPage /></ProtectedPage>} />
            <Route path="/immunization" element={<ProtectedPage><ImmunizationPage /></ProtectedPage>} />
            <Route path="/laboratory" element={<ProtectedPage><LaboratoryPage /></ProtectedPage>} />
            <Route path="/pharmacy" element={<ProtectedPage><PharmacyPage /></ProtectedPage>} />
            <Route path="/mch" element={<ProtectedPage><MCHPage /></ProtectedPage>} />
            <Route path="/staff" element={<ProtectedPage><StaffPage /></ProtectedPage>} />
            <Route path="/reports" element={<ProtectedPage><ReportsPage /></ProtectedPage>} />
            <Route path="/data-chain" element={<ProtectedPage><DataChainPage /></ProtectedPage>} />
            <Route path="/appointments" element={<ProtectedPage><AppointmentsPage /></ProtectedPage>} />
            <Route path="/audit" element={<ProtectedPage><AuditLogPage /></ProtectedPage>} />
            <Route path="/inventory" element={<ProtectedPage><DrugInventoryPage /></ProtectedPage>} />
            <Route path="/billing" element={<ProtectedPage><BillingPage /></ProtectedPage>} />
            <Route path="/referrals" element={<ProtectedPage><ReferralsPage /></ProtectedPage>} />
            <Route path="/rescue" element={<ProtectedPage><RescueTapPage /></ProtectedPage>} />
            <Route path="/ambulance" element={<ProtectedPage><AmbulancePortalPage /></ProtectedPage>} />
            <Route path="/fleet" element={<ProtectedPage><AmbulanceFleetPage /></ProtectedPage>} />
            <Route path="/er-inbound" element={<ProtectedPage><ERInboundPage /></ProtectedPage>} />
            <Route path="/super-admin" element={<ProtectedPage><SuperAdminPortalPage /></ProtectedPage>} />
            <Route path="/admin/facilities" element={<ProtectedPage><FacilityApprovalPage /></ProtectedPage>} />
            <Route path="/admin/facility-audit" element={<ProtectedPage><FacilityAuditTrailPage /></ProtectedPage>} />
            <Route path="/reports/idsr" element={<ProtectedPage><IDSRWeeklyReportPage /></ProtectedPage>} />
            <Route path="/reports/kpis" element={<ProtectedPage><FacilityKPIPage /></ProtectedPage>} />
            <Route path="/reports/heatmap" element={<ProtectedPage><GeoHeatmapPage /></ProtectedPage>} />
            <Route path="/ai-anomaly" element={<ProtectedPage><AIAnomalyDetectionPage /></ProtectedPage>} />
            <Route path="/sync" element={<ProtectedPage><SyncPage /></ProtectedPage>} />
            <Route path="/settings" element={<ProtectedPage><SettingsPage /></ProtectedPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
