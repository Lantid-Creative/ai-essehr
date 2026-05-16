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
import PayReturnPage from "@/pages/PayReturnPage";
import InsuranceClaimsPage from "@/pages/InsuranceClaimsPage";
import CashierShiftPage from "@/pages/CashierShiftPage";
import NursingPage from "@/pages/NursingPage";
import SpecimensPage from "@/pages/SpecimensPage";
import ClinicalTasksPage from "@/pages/ClinicalTasksPage";
import ConsentFormsPage from "@/pages/ConsentFormsPage";
import SolutionsIndexPage from "@/pages/solutions/SolutionsIndexPage";
import SolutionEHRPage from "@/pages/solutions/SolutionEHRPage";
import SolutionAIPage from "@/pages/solutions/SolutionAIPage";
import SolutionChainPage from "@/pages/solutions/SolutionChainPage";
import SolutionAlertsPage from "@/pages/solutions/SolutionAlertsPage";
import FeaturesIndexPage from "@/pages/FeaturesIndexPage";
import CaseFirstTimeCitizenPage from "@/pages/case-studies/CaseFirstTimeCitizenPage";
import CaseReturningCitizenPage from "@/pages/case-studies/CaseReturningCitizenPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import TermsPage from "@/pages/legal/TermsPage";
import SecurityPage from "@/pages/legal/SecurityPage";
import RegisterCitizenPage from "@/pages/RegisterCitizenPage";
import BirthRegistrationPage from "@/pages/BirthRegistrationPage";
import DeathRegistrationPage from "@/pages/DeathRegistrationPage";
import NHMISRegistersPage from "@/pages/NHMISRegistersPage";
import NHMIS001SummaryPage from "@/pages/NHMIS001SummaryPage";
import ColdChainPage from "@/pages/ColdChainPage";
import DischargeSummaryPage from "@/pages/DischargeSummaryPage";
import CustomReportBuilderPage from "@/pages/CustomReportBuilderPage";
import NHEDEmpanelmentPage from "@/pages/NHEDEmpanelmentPage";
import FacilityOperationsPage from "@/pages/FacilityOperationsPage";
import FacilityMicroplanPage from "@/pages/FacilityMicroplanPage";
import WDCSupervisionPage from "@/pages/WDCSupervisionPage";
import QualityImprovementPage from "@/pages/QualityImprovementPage";
import PatientFeedbackPage from "@/pages/PatientFeedbackPage";
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
            <Route path="/pay/return" element={<PayReturnPage />} />
            <Route path="/register/citizen" element={<RegisterCitizenPage />} />
            <Route path="/solutions" element={<SolutionsIndexPage />} />
            <Route path="/solutions/ehr" element={<SolutionEHRPage />} />
            <Route path="/solutions/sentinel-ai" element={<SolutionAIPage />} />
            <Route path="/solutions/data-chain" element={<SolutionChainPage />} />
            <Route path="/solutions/early-warnings" element={<SolutionAlertsPage />} />
            <Route path="/features" element={<FeaturesIndexPage />} />
            <Route path="/case-studies/first-time-citizen" element={<CaseFirstTimeCitizenPage />} />
            <Route path="/case-studies/returning-citizen" element={<CaseReturningCitizenPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal/privacy" element={<PrivacyPage />} />
            <Route path="/legal/terms" element={<TermsPage />} />
            <Route path="/legal/security" element={<SecurityPage />} />

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
            <Route path="/insurance" element={<ProtectedPage><InsuranceClaimsPage /></ProtectedPage>} />
            <Route path="/cashier" element={<ProtectedPage><CashierShiftPage /></ProtectedPage>} />
            <Route path="/nursing" element={<ProtectedPage><NursingPage /></ProtectedPage>} />
            <Route path="/specimens" element={<ProtectedPage><SpecimensPage /></ProtectedPage>} />
            <Route path="/tasks" element={<ProtectedPage><ClinicalTasksPage /></ProtectedPage>} />
            <Route path="/consents" element={<ProtectedPage><ConsentFormsPage /></ProtectedPage>} />
            <Route path="/sync" element={<ProtectedPage><SyncPage /></ProtectedPage>} />
            <Route path="/settings" element={<ProtectedPage><SettingsPage /></ProtectedPage>} />
            <Route path="/births" element={<ProtectedPage><BirthRegistrationPage /></ProtectedPage>} />
            <Route path="/deaths" element={<ProtectedPage><DeathRegistrationPage /></ProtectedPage>} />
            <Route path="/nhmis-registers" element={<ProtectedPage><NHMISRegistersPage /></ProtectedPage>} />
            <Route path="/nhmis-001" element={<ProtectedPage><NHMIS001SummaryPage /></ProtectedPage>} />
            <Route path="/cold-chain" element={<ProtectedPage><ColdChainPage /></ProtectedPage>} />
            <Route path="/discharge-summaries" element={<ProtectedPage><DischargeSummaryPage /></ProtectedPage>} />
            <Route path="/reports/builder" element={<ProtectedPage><CustomReportBuilderPage /></ProtectedPage>} />
            <Route path="/nhed" element={<ProtectedPage><NHEDEmpanelmentPage /></ProtectedPage>} />
            <Route path="/operations" element={<ProtectedPage><FacilityOperationsPage /></ProtectedPage>} />
            <Route path="/microplan" element={<ProtectedPage><FacilityMicroplanPage /></ProtectedPage>} />
            <Route path="/wdc" element={<ProtectedPage><WDCSupervisionPage /></ProtectedPage>} />
            <Route path="/qi" element={<ProtectedPage><QualityImprovementPage /></ProtectedPage>} />
            <Route path="/feedback" element={<ProtectedPage><PatientFeedbackPage /></ProtectedPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
