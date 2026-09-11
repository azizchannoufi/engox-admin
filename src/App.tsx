import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LiveTrackingPage } from "@/pages/LiveTrackingPage";
import { FleetPage } from "@/pages/FleetPage";
import { DriversPage } from "@/pages/DriversPage";
import { RoutesPage } from "@/pages/RoutesPage";
import { PodInspectionPage } from "@/pages/PodInspectionPage";
import { DepotPage } from "@/pages/DepotPage";
import { ExceptionsPage } from "@/pages/ExceptionsPage";
import { SettingsPage } from "@/pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/live-tracking" element={<LiveTrackingPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/depot" element={<DepotPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/pod-verification" element={<PodInspectionPage />} />
            <Route path="/exceptions" element={<ExceptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" offset={72} />
    </QueryClientProvider>
  );
}
