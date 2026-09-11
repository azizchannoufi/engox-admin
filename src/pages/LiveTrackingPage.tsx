import { useEffect, useMemo, useState } from "react";
import { timeAgo } from "@/lib/dates";
import { Battery, Gauge, Search, X } from "lucide-react";
import { OpsMap } from "@/components/maps/OpsMap";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDriversQuery, useOrdersQuery } from "@/api/hooks";
import { connectGpsSocket } from "@/api/gps-socket";
import { cn } from "@/lib/utils";
import type { Driver } from "@/types/domain";

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

  return (
    <div className="relative h-[calc(100vh-64px)] min-h-[640px]">
      <OpsMap
        drivers={drivers}
        orders={ordersQuery.data ?? []}
        trail={selected ? trailFor(selected) : undefined}
        focus={selected ? [selected.lat, selected.lng] : undefined}
        zoom={12}
        onSelectDriver={setSelectedId}
      />

      <aside className="absolute left-4 top-4 z-[400] flex h-[calc(100%-2rem)] w-[320px] flex-col overflow-hidden rounded-xl border border-white/10 bg-white/95 shadow-xl backdrop-blur">
        <div className="border-b border-[#eef1f4] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-1">
            Unità live
          </p>
          <div className="relative mt-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-1" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
              placeholder="Filtra autista o targa"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scroll">
          {driversQuery.isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            filtered.map((driver) => {
              const progress =
                driver.stopsTotal === 0
                  ? 0
                  : Math.round((driver.stopsDone / driver.stopsTotal) * 100);
              const active = driver.id === selectedId;
              return (
                <button
                  key={driver.id}
                  onClick={() => setSelectedId(driver.id)}
                  className={cn(
                    "w-full border-b border-[#f1f4f7] px-3 py-3 text-left hover:bg-navy-50",
                    active && "bg-gold-soft",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <Badge tone={driver.isOnline ? "success" : "neutral"}>
                      {driver.isOnline ? "In servizio" : "Fuori linea"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-1">
                    {driver.licensePlate}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-[#4b5563]">
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
      </aside>

      {selected ? (
        <div className="absolute right-4 top-4 z-[400] w-[360px] overflow-hidden rounded-xl border border-white/10 bg-white shadow-xl">
          <div className="flex items-start justify-between border-b border-[#eef1f4] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-navy">
                {selected.firstName} {selected.lastName}
              </p>
              <p className="text-[11px] text-gray-1">
                {selected.vehicleType === "VAN"
                  ? "Furgone"
                  : selected.vehicleType === "CAR"
                    ? "Auto"
                    : selected.vehicleType}{" "}
                · {selected.licensePlate}
              </p>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-gray-1 hover:text-navy">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 px-4 py-3 text-center text-xs">
            <div>
              <p className="text-gray-1">Velocità</p>
              <p className="font-bold text-navy">{Math.round(selected.speedKmh)}</p>
            </div>
            <div>
              <p className="text-gray-1">Direzione</p>
              <p className="font-bold text-navy">{selected.headingDeg}°</p>
            </div>
            <div>
              <p className="text-gray-1">Ultimo ping</p>
              <p className="font-bold text-navy">
                {timeAgo(selected.lastSeenAt)}
              </p>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto border-t border-[#eef1f4] custom-scroll">
            <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-1">
              Cronologia percorso
            </p>
            {driverOrders.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-gray-1">Nessuna fermata assegnata in questo turno.</p>
            ) : (
              <ol className="space-y-2 px-4 pb-4">
                {driverOrders
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
      ) : null}
    </div>
  );
}
