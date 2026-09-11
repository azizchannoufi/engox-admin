import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/dates";
import {
  Bell,
  ChevronDown,
  Plus,
  Search,
  Wifi,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAlertsQuery } from "@/api/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { DEPOT } from "@/constants/theme";
import { initials } from "@/lib/utils";

function formatZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function TopBar() {
  const now = useClock();
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const openNewOrder = useUiStore((s) => s.openNewOrder);
  const { data: alerts = [] } = useAlertsQuery();
  const [openAlerts, setOpenAlerts] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const unread = alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <header className="flex h-[64px] items-center gap-4 border-b border-[#e7ebf0] bg-white px-4">
      <div className="flex min-w-[220px] items-center gap-2.5">
        <img src="/logo.png" alt="Engox Logistics" className="h-8 w-auto" />
        <div className="leading-tight">
          <p className="text-[11px] font-extrabold tracking-[0.14em] text-navy">
            ENGOX FLEET OPS
          </p>
          <p className="text-[10px] text-gray-1">Comando missioni</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-md border border-[#e7ebf0] px-3 py-1.5 lg:flex">
        <span className="text-[11px] text-gray-1">Deposito</span>
        <span className="max-w-[280px] truncate text-sm font-semibold text-navy">
          {DEPOT.name}
        </span>
        <ChevronDown size={14} className="text-gray-1" />
      </div>

      <div className="hidden items-center gap-3 font-mono text-[11px] text-gray-1 xl:flex">
        <span>
          UTC <strong className="text-navy">{formatZone(now, "UTC")}</strong>
        </span>
        <span>
          EDT{" "}
          <strong className="text-navy">
            {formatZone(now, "America/New_York")}
          </strong>
        </span>
      </div>

      <div className="relative mx-auto hidden w-full max-w-md md:block">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-1"
        />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Cerca tracking, destinatario, autista…"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Badge tone="mint" className="hidden sm:inline-flex">
          <Wifi size={11} />
          Tutti i microservizi operativi
        </Badge>

        <div className="relative">
          <button
            onClick={() => {
              setOpenAlerts((v) => !v);
              setOpenProfile(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[#e7ebf0] text-navy hover:bg-navy-50"
            aria-label="Notifiche"
          >
            <Bell size={16} />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            ) : null}
          </button>
          {openAlerts ? (
            <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-[#e7ebf0] bg-white shadow-lg">
              <div className="border-b border-[#eef1f4] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-1">
                Avvisi in tempo reale
              </div>
              <div className="max-h-80 overflow-y-auto custom-scroll">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border-b border-[#f3f5f7] px-3 py-2.5 last:border-0"
                  >
                    <p className="text-sm font-semibold text-navy">{alert.title}</p>
                    <p className="text-xs text-gray-1">{alert.detail}</p>
                    <p className="mt-1 text-[10px] text-gray-1">
                      {timeAgo(alert.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <Button
          size="sm"
          onClick={() => {
            setOpenAlerts(false);
            setOpenProfile(false);
            openNewOrder();
          }}
        >
          <Plus size={14} />
          Ricevi lista
        </Button>

        <div className="relative">
          <button
            onClick={() => {
              setOpenProfile((v) => !v);
              setOpenAlerts(false);
            }}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-navy-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
              {initials(session?.name ?? "MK")}
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-sm font-semibold text-navy">
                {session?.name ?? "Marcus K."}
              </span>
              <span className="block text-[11px] text-gray-1">
                {session?.title ?? "Responsabile operazioni"}
              </span>
            </span>
          </button>
          {openProfile ? (
            <div className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-[#e7ebf0] bg-white p-1 shadow-lg">
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-navy-50"
                onClick={() => navigate("/settings")}
              >
                Impostazioni
              </button>
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-[#fdecea]"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Esci
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
