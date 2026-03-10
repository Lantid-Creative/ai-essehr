import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import RegisterFacilityPage from "@/pages/RegisterFacilityPage";
import RegisterPatientPage from "@/pages/RegisterPatientPage";
import FAQPage from "@/pages/FAQPage";
import HelpPage from "@/pages/HelpPage";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
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

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/patients" element={<ProtectedPage><PatientsPage /></ProtectedPage>} />
            <Route path="/consultation" element={<ProtectedPage><ConsultationPage /></ProtectedPage>} />
            <Route path="/wards" element={<ProtectedPage><WardsPage /></ProtectedPage>} />
            <Route path="/surveillance" element={<ProtectedPage><SurveillancePage /></ProtectedPage>} />
            <Route path="/immunization" element={<ProtectedPage><ImmunizationPage /></ProtectedPage>} />
            <Route path="/laboratory" element={<ProtectedPage><LaboratoryPage /></ProtectedPage>} />
            <Route path="/pharmacy" element={<ProtectedPage><PharmacyPage /></ProtectedPage>} />
            <Route path="/mch" element={<ProtectedPage><MCHPage /></ProtectedPage>} />
            <Route path="/staff" element={<ProtectedPage><StaffPage /></ProtectedPage>} />
            <Route path="/reports" element={<ProtectedPage><ReportsPage /></ProtectedPage>} />
            <Route path="/appointments" element={<ProtectedPage><AppointmentsPage /></ProtectedPage>} />
            <Route path="/audit" element={<ProtectedPage><AuditLogPage /></ProtectedPage>} />
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
