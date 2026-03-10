import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import MainLayout from "@/components/layout/MainLayout";
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
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/wards" element={<WardsPage />} />
              <Route path="/surveillance" element={<SurveillancePage />} />
              <Route path="/immunization" element={<ImmunizationPage />} />
              <Route path="/laboratory" element={<LaboratoryPage />} />
              <Route path="/pharmacy" element={<PharmacyPage />} />
              <Route path="/mch" element={<MCHPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/sync" element={<SyncPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
