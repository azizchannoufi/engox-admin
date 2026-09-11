import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  MapPinned,
  Truck,
  ClipboardCheck,
  Route,
  TriangleAlert,
  Settings,
  Warehouse,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUiStore } from "@/stores/ui-store";

const NAV = [
  { to: "/dashboard", label: "Comando flotta", icon: LayoutGrid },
  { to: "/live-tracking", label: "Tracking geofence live", icon: MapPinned },
  { to: "/fleet", label: "Veicoli e autisti", icon: Truck },
  { to: "/depot", label: "Deposito", icon: Warehouse },
  { to: "/pod-verification", label: "POD e audit", icon: ClipboardCheck },
  { to: "/routes", label: "Ottimizzazione percorsi", icon: Route },
  { to: "/exceptions", label: "Eccezioni e reclami", icon: TriangleAlert },
  { to: "/settings", label: "Impostazioni", icon: Settings },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const closeMobileNav = useUiStore((s) => s.closeMobileNav);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const compact = isDesktop && collapsed;

  useEffect(() => {
    if (isDesktop) closeMobileNav();
  }, [isDesktop, closeMobileNav]);

  useEffect(() => {
    closeMobileNav();
  }, [location.pathname, closeMobileNav]);

  return (
    <>
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 top-16 z-40 bg-[rgba(0,35,102,0.4)] lg:hidden"
          aria-label="Chiudi menu"
          onClick={closeMobileNav}
        />
      ) : null}
      <aside
        className={cn(
          "flex flex-col border-r border-[#e7ebf0] bg-white",
          "fixed bottom-0 left-0 top-16 z-50 w-[min(236px,86vw)] transition-transform duration-200",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:h-full lg:translate-x-0 lg:transition-[width]",
          compact ? "lg:w-[72px]" : "lg:w-[236px]",
        )}
      >
        <div className="flex-1 overflow-y-auto px-2 py-4 custom-scroll">
          {!compact ? (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-1">
              Operazioni principali
            </p>
          ) : null}
          <nav className="space-y-0.5">
            {NAV.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-navy text-white"
                      : "text-[#4b5563] hover:bg-navy-50 hover:text-navy",
                    compact && "justify-center px-0",
                  )}
                >
                  <item.icon size={16} strokeWidth={1.8} />
                  {!compact ? <span>{item.label}</span> : null}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#e7ebf0] p-3">
          {!compact ? (
            <div className="mb-2 flex items-center justify-between text-[11px] text-gray-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-2" />
                Sync deposito attivo
              </span>
              <span>v4.18.2</span>
            </div>
          ) : null}
          <button
            onClick={toggle}
            className="hidden h-8 w-full items-center justify-center rounded-md text-gray-1 hover:bg-navy-50 hover:text-navy lg:flex"
            aria-label="Mostra o nascondi menu"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
