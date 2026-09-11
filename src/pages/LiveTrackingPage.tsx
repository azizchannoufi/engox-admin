import { useEffect, useMemo, useState } from "react";
import { timeAgo } from "@/lib/dates";
import { Battery, ChevronLeft, Gauge, Search, X } from "lucide-react";
import { OpsMap } from "@/components/maps/OpsMap";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDriversQuery, useOrdersQuery } from "@/api/hooks";
import { connectGpsSocket } from "@/api/gps-socket";
import { cn } from "@/lib/utils";
import type { Driver, Order } from "@/types/domain";

function trailFor(driver: Driver): [number, number][] {
  const steps = 6;
  return Array.from({ length: steps }, (_, i) => {
    const t = (steps - i) / 400;
    return [driver.lat - t * Math.cos((driver.headingDeg * Math.PI) / 180), driver.lng - t * Math.sin((driver.headingDeg * Math.PI) / 180)] as [number, number];
  }).reverse().concat([[driver.lat, driver.lng]]);
}

export function LiveTrackingPage() {
  const driversQuery = useDriversQuery();
  const ordersQuery = useOrdersQuery();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("drv-dave");

  useEffect(() => {
    return connectGpsSocket(() => {
      /* live positions stream in when VITE_USE_MOCK=false */
    });
  }, []);

  const drivers = driversQuery.data ?? [];
  const filtered = drivers.filter((driver) => {
    const name = `${driver.firstName} ${driver.lastName}`.toLowerCase();
    return name.includes(query.toLowerCase()) || driver.licensePlate.toLowerCase().includes(query.toLowerCase());
  });
  const selected = drivers.find((d) => d.id === selectedId) ?? null;
  const driverOrders = useMemo(
    () => (ordersQuery.data ?? []).filter((o) => o.assignedDriverId === selectedId),
    [ordersQuery.data, selectedId],
  );

  const listProps = {
    query,
    onQuery: setQuery,
    loading: driversQuery.isLoading,
    drivers: filtered,
    selectedId,
    onSelect: (id: string) => setSelectedId(id),
  };

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] min-h-0 flex-col lg:block lg:min-h-[560px]">
      <div className="relative min-h-[220px] flex-1 lg:absolute lg:inset-0">
        <OpsMap
          drivers={drivers}
          orders={ordersQuery.data ?? []}
          trail={selected ? trailFor(selected) : undefined}
          focus={selected ? [selected.lat, selected.lng] : undefined}
          zoom={12}
          onSelectDriver={setSelectedId}
        />

        <aside className="absolute left-4 top-4 z-[400] hidden h-[calc(100%-2rem)] w-[320px] flex-col overflow-hidden rounded-xl border border-white/10 bg-white/95 shadow-xl backdrop-blur lg:flex">
          <DriverList {...listProps} />
        </aside>

        {selected ? (
          <div className="absolute right-4 top-4 z-[400] hidden w-[360px] overflow-hidden rounded-xl border border-white/10 bg-white shadow-xl lg:block">
            <DriverDetail
              driver={selected}
              orders={driverOrders}
              onClose={() => setSelectedId(null)}
            />
          </div>
        ) : null}
      </div>

      <div className="z-[400] flex max-h-[48%] min-h-[200px] flex-col overflow-hidden border-t border-[#e7ebf0] bg-white lg:hidden">
        {selected ? (
          <DriverDetail
            driver={selected}
            orders={driverOrders}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <DriverList {...listProps} />
        )}
      </div>
    </div>
  );
}

function DriverList({
  query,
  onQuery,
  loading,
  drivers,
  selectedId,
  onSelect,
}: {
  query: string;
  onQuery: (value: string) => void;
  loading: boolean;
  drivers: Driver[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[#eef1f4] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-1">
          Unità live
        </p>
        <div className="relative mt-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-1" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            className="pl-8"
            placeholder="Filtra autista o targa"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto custom-scroll">
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          drivers.map((driver) => {
            const progress =
              driver.stopsTotal === 0
                ? 0
                : Math.round((driver.stopsDone / driver.stopsTotal) * 100);
            const active = driver.id === selectedId;
            return (
              <button
                key={driver.id}
                onClick={() => onSelect(driver.id)}
                className={cn(
                  "w-full border-b border-[#f1f4f7] px-3 py-3 text-left hover:bg-navy-50",
                  active && "bg-gold-soft",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-navy">
                    {driver.firstName} {driver.lastName}
                  </p>
                  <Badge tone={driver.isOnline ? "success" : "neutral"}>
                    {driver.isOnline ? "In servizio" : "Fuori linea"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-1">
                  {driver.licensePlate}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#4b5563]">
                  <span className="inline-flex items-center gap-1">
                    <Battery size={12} /> {driver.batteryPct}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Gauge size={12} /> {Math.round(driver.speedKmh)} km/h
                  </span>
                  <span>
                    {driver.stopsDone}/{driver.stopsTotal} fermate
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8edf3]">
                  <div
                    className="h-full rounded-full bg-green-2"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function DriverDetail({
  driver,
  orders,
  onClose,
}: {
  driver: Driver;
  orders: Order[];
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-start justify-between border-b border-[#eef1f4] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-navy">
            {driver.firstName} {driver.lastName}
          </p>
          <p className="text-[11px] text-gray-1">
            {driver.vehicleType === "VAN"
              ? "Furgone"
              : driver.vehicleType === "CAR"
                ? "Auto"
                : driver.vehicleType}{" "}
            · {driver.licensePlate}
          </p>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1 text-gray-1 hover:text-navy"
          aria-label="Chiudi dettaglio"
        >
          <ChevronLeft size={16} className="lg:hidden" />
          <X size={16} className="hidden lg:block" />
          <span className="text-xs font-semibold lg:hidden">Lista</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 py-3 text-center text-xs">
        <div>
          <p className="text-gray-1">Velocità</p>
          <p className="font-bold text-navy">{Math.round(driver.speedKmh)}</p>
        </div>
        <div>
          <p className="text-gray-1">Direzione</p>
          <p className="font-bold text-navy">{driver.headingDeg}°</p>
        </div>
        <div>
          <p className="text-gray-1">Ultimo ping</p>
          <p className="font-bold text-navy">{timeAgo(driver.lastSeenAt)}</p>
        </div>
      </div>
      <div className="max-h-72 min-h-0 flex-1 overflow-y-auto border-t border-[#eef1f4] custom-scroll">
        <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-1">
          Cronologia percorso
        </p>
        {orders.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-gray-1">Nessuna fermata assegnata in questo turno.</p>
        ) : (
          <ol className="space-y-2 px-4 pb-4">
            {orders
              .slice()
              .sort((a, b) => a.routeSequence - b.routeSequence)
              .map((order) => (
                <li key={order.id} className="rounded-md border border-[#eef1f4] px-3 py-2">
                  <p className="text-xs font-semibold text-navy">
                    #{order.routeSequence} · {order.recipientName}
                  </p>
                  <p className="text-[11px] text-gray-1">{order.address}</p>
                </li>
              ))}
          </ol>
        )}
      </div>
      <div className="border-t border-[#eef1f4] p-3">
        <Button variant="outline" className="w-full" size="sm">
          Apri traccia GPS completa
        </Button>
      </div>
    </div>
  );
}
