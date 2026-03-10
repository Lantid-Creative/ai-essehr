import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterFacilityPage from "@/pages/RegisterFacilityPage";
import RegisterPatientPage from "@/pages/RegisterPatientPage";
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
            <Route path="/register/facility" element={<RegisterFacilityPage />} />
            <Route path="/register/patient" element={<RegisterPatientPage />} />

            {/* Dashboard routes (wrapped in MainLayout) */}
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/patients" element={<MainLayout><PatientsPage /></MainLayout>} />
            <Route path="/consultation" element={<MainLayout><ConsultationPage /></MainLayout>} />
            <Route path="/wards" element={<MainLayout><WardsPage /></MainLayout>} />
            <Route path="/surveillance" element={<MainLayout><SurveillancePage /></MainLayout>} />
            <Route path="/immunization" element={<MainLayout><ImmunizationPage /></MainLayout>} />
            <Route path="/laboratory" element={<MainLayout><LaboratoryPage /></MainLayout>} />
            <Route path="/pharmacy" element={<MainLayout><PharmacyPage /></MainLayout>} />
            <Route path="/mch" element={<MainLayout><MCHPage /></MainLayout>} />
            <Route path="/staff" element={<MainLayout><StaffPage /></MainLayout>} />
            <Route path="/reports" element={<MainLayout><ReportsPage /></MainLayout>} />
            <Route path="/sync" element={<MainLayout><SyncPage /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
