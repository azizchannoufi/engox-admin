import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Hand, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { DeliveryStatusBadge } from "@/components/ui/status-badge";
import { ParcelQr } from "@/components/ui/parcel-qr";
import {
  useAssignOrdersMutation,
  useDriversQuery,
  useOrdersQuery,
} from "@/api/hooks";
import { parcelQr } from "@/lib/parcel";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { Order } from "@/types/domain";

function orderLabel(order: Order) {
  return `#${order.id.replace("ord-", "ORD-").toUpperCase()}`;
}

export function RoutesPage() {
  const ordersQuery = useOrdersQuery();
  const driversQuery = useDriversQuery();
  const assign = useAssignOrdersMutation();
  const openNewOrder = useUiStore((s) => s.openNewOrder);
  const [selected, setSelected] = useState<string[]>([]);
  const [driverId, setDriverId] = useState("");
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  const orders = ordersQuery.data ?? [];
  const drivers = driversQuery.data ?? [];
  const visible = orders.filter((order) => {
    const q = search.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.trackingNumber.toLowerCase().includes(q) ||
      order.recipientName.toLowerCase().includes(q) ||
      order.address.toLowerCase().includes(q)
    );
  });

  const assignableIds = visible
    .filter((order) => order.status === "PENDING" || order.status === "OUT_FOR_DELIVERY")
    .map((order) => order.id);
  const unassigned = visible.filter((o) => !o.assignedDriverId);
  const byDriver = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const driver of drivers) {
      map.set(
        driver.id,
        visible.filter((o) => o.assignedDriverId === driver.id),
      );
    }
    return map;
  }, [drivers, visible]);

  const allVisibleSelected =
    assignableIds.length > 0 && assignableIds.every((id) => selected.includes(id));

  function toggle(id: string) {
    setSelected((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelected((curr) => curr.filter((id) => !assignableIds.includes(id)));
      return;
    }
    setSelected((curr) => Array.from(new Set([...curr, ...assignableIds])));
  }

  function handToDriver(targetDriverId: string, ids = selected) {
    const eligible = ids.filter((id) => {
      const order = orders.find((item) => item.id === id);
      return order && order.status !== "DELIVERED" && order.status !== "FAILED";
    });
    if (!targetDriverId || eligible.length === 0) return;
    const driver = drivers.find((item) => item.id === targetDriverId);
    assign.mutate(
      { orderIds: eligible, driverId: targetDriverId },
      {
        onSuccess: () => {
          const n = eligible.length;
          toast.success(
            `${n} ${n === 1 ? "fermata consegnata" : "fermate consegnate"} a ${driver?.firstName ?? "autista"}`,
          );
          setSelected([]);
          setDragging(null);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Assegnazione non riuscita",
          );
        },
      },
    );
  }

  function dropOnDriver(targetDriverId: string) {
    const ids = dragging ? [dragging] : selected;
    handToDriver(targetDriverId, ids);
  }

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-gray-1">Ottimizzatore percorsi</p>
          <h1 className="text-2xl font-bold text-navy">Pianificazione ordini e rotte</h1>
        </div>
        <Button onClick={openNewOrder}>
          <Plus size={14} />
          Ricevi lista
        </Button>
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-soft text-green-3">
          <Hand size={16} />
        </div>
        <div className="min-w-[160px] flex-1">
          <p className="text-sm font-semibold text-navy">Consegna le fermate a un autista</p>
          <p className="text-[11px] text-gray-1">
            Seleziona una lista, scegli un autista oppure trascina le righe su una scheda del turno.
          </p>
        </div>
        <Input
          placeholder="Cerca ordine, destinatario, indirizzo"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelected(unassigned.map((order) => order.id))}
        >
          Seleziona non assegnati ({unassigned.length})
        </Button>
        <select
          className="h-9 rounded-md border border-gray-2 bg-white px-3 text-sm"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        >
          <option value="">Scegli autista…</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.firstName} {driver.lastName} · {driver.licensePlate}
            </option>
          ))}
        </select>
        <Button
          disabled={selected.length === 0 || !driverId || assign.isPending}
          onClick={() => handToDriver(driverId)}
        >
          Consegna {selected.length || ""} selezionat{selected.length === 1 ? "o" : "i"}
        </Button>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="overflow-hidden">
          {ordersQuery.isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f7f9fb] text-[11px] uppercase tracking-wide text-gray-1">
                  <tr>
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        aria-label="Seleziona tutti gli ordini assegnabili"
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold">QR</th>
                    <th className="px-3 py-3 font-semibold">ID ordine</th>
                    <th className="px-3 py-3 font-semibold">Destinatario</th>
                    <th className="px-3 py-3 font-semibold">Indirizzo</th>
                    <th className="px-3 py-3 font-semibold">Autista</th>
                    <th className="px-3 py-3 font-semibold">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((order) => {
                    const locked =
                      order.status === "DELIVERED" || order.status === "FAILED";
                    return (
                      <tr
                        key={order.id}
                        draggable={!locked}
                        onDragStart={() => {
                          if (!locked) setDragging(order.id);
                        }}
                        onDragEnd={() => setDragging(null)}
                        className={cn(
                          "border-t border-[#eef1f4] hover:bg-[#fbfcfd]",
                          locked ? "cursor-default opacity-70" : "cursor-grab",
                          selected.includes(order.id) && "bg-gold-soft",
                        )}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            disabled={locked}
                            checked={selected.includes(order.id)}
                            onChange={() => toggle(order.id)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <ParcelQr value={parcelQr(order)} size={48} />
                        </td>
                        <td className="px-3 py-3 font-semibold text-navy">
                          {orderLabel(order)}
                          <div className="text-[11px] font-medium text-gray-1">
                            {order.trackingNumber}
                          </div>
                        </td>
                        <td className="px-3 py-3">{order.recipientName}</td>
                        <td className="px-3 py-3 text-[#4b5563]">{order.address}</td>
                        <td className="px-3 py-3">{order.assignedDriverName ?? "—"}</td>
                        <td className="px-3 py-3">
                          <DeliveryStatusBadge status={order.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-3">
          <Card className="p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-1">
              Elenco non assegnati ({unassigned.length})
            </p>
            <p className="mt-1 text-xs text-gray-1">
              Trascina una riga su una scheda autista, oppure seleziona una lista e consegnala.
            </p>
          </Card>
          {drivers.map((driver) => {
            const stops = byDriver.get(driver.id) ?? [];
            return (
              <Card
                key={driver.id}
                className={cn(
                  "p-3 transition-colors",
                  dragging && "border-green-2 bg-green-soft/40",
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOnDriver(driver.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <p className="text-[11px] text-gray-1">{driver.licensePlate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-1">
                      {stops.length} {stops.length === 1 ? "fermata" : "fermate"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={selected.length === 0 || assign.isPending}
                      onClick={() => handToDriver(driver.id)}
                    >
                      Consegna qui
                    </Button>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-[#4b5563]">
                  {stops.slice(0, 5).map((order) => (
                    <li key={order.id}>
                      {order.recipientName} — {order.neighborhood}
                    </li>
                  ))}
                  {stops.length > 5 ? (
                    <li className="text-gray-1">+{stops.length - 5} altri</li>
                  ) : null}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
