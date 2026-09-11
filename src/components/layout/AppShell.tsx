import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { NewOrderModal } from "@/components/orders/NewOrderModal";
import { useAuthStore } from "@/stores/auth-store";

export function AppShell() {
  const session = useAuthStore((s) => s.session);
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto custom-scroll">
          <Outlet />
        </main>
      </div>
      <NewOrderModal />
    </div>
  );
}
