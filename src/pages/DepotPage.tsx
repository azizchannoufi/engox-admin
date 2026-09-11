import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Boxes,
  Hand,
  PackageCheck,
  QrCode,
  ScanLine,
  Warehouse,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiChip } from "@/components/ui/kpi-chip";
import { Modal } from "@/components/ui/modal";
import { ParcelQr } from "@/components/ui/parcel-qr";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DepotStatusBadge } from "@/components/ui/status-badge";
import {
  useAssignOrdersMutation,
  useDriversQuery,
  useManifestsQuery,
  useOrdersQuery,
  useStageParcelsMutation,
} from "@/api/hooks";
import { timeAgo } from "@/lib/dates";
import { parcelQr } from "@/lib/parcel";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { DepotStatus, Order } from "@/types/domain";

const FILTERS: { id: "all" | DepotStatus; label: string }[] = [
  { id: "all", label: "Tutto in cortile" },
  { id: "INBOUND", label: "In ingresso" },
  { id: "STAGED", label: "In baia" },
  { id: "ASSIGNED", label: "Assegnati" },
  { id: "OUT_FOR_DELIVERY", label: "In uscita" },
];

export function DepotPage() {
  const ordersQuery = useOrdersQuery();
  const manifestsQuery = useManifestsQuery();
  const driversQuery = useDriversQuery();
  const stage = useStageParcelsMutation();
  const assign = useAssignOrdersMutation();
  const openNewOrder = useUiStore((s) => s.openNewOrder);

  const [scan, setScan] = useState("");
  const [filter, setFilter] = useState<"all" | DepotStatus>("all");
  const [lotId, setLotId] = useState<string | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [driverId, setDriverId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const parcels = ordersQuery.data ?? [];
  const lots = manifestsQuery.data ?? [];
  const drivers = driversQuery.data ?? [];
  const active = parcels.find((p) => p.id === activeId) ?? null;

  const visible = useMemo(() => {
    const q = scan.trim().toLowerCase();
    return parcels.filter((parcel) => {
      if (lotId !== "all" && parcel.manifestId !== lotId) return false;
      if (filter !== "all" && parcel.depotStatus !== filter) return false;
      if (!q) return true;
      const hay = [
        parcelQr(parcel),
        parcel.trackingNumber,
        parcel.recipientName,
        parcel.address,
        parcel.merchantName,
        parcel.manifestRef ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [parcels, lotId, filter, scan]);

  const inbound = parcels.filter((p) => p.depotStatus === "INBOUND").length;
  const staged = parcels.filter((p) => p.depotStatus === "STAGED").length;
  const assigned = parcels.filter(
    (p) => p.depotStatus === "ASSIGNED" || p.depotStatus === "OUT_FOR_DELIVERY",
  ).length;

  function toggle(id: string) {
    setSelected((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
    );
  }

  const yardIds = visible
    .filter((p) => p.depotStatus === "INBOUND" || p.depotStatus === "STAGED")
    .map((p) => p.id);

  return (
    <div className="space-y-4 p-3 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-gray-1">
            Cortile deposito · ricezione subappalto
          </p>
          <h1 className="text-xl font-bold text-navy sm:text-2xl">Gestione ordini deposito</h1>
        </div>
        <Button onClick={openNewOrder}>
          <Boxes size={14} />
          Ricevi lista in ingresso
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiChip
          icon={<Warehouse size={16} />}
          label="Lotti aperti"
          value={String(lots.length)}
          hint="Manifesti commercianti"
          tone="navy"
        />
        <KpiChip
          icon={<ScanLine size={16} />}
          label="Colli in ingresso"
          value={String(inbound)}
          hint="In attesa in banchina"
        />
        <KpiChip
          icon={<PackageCheck size={16} />}
          label="In baia"
          value={String(staged)}
          hint="Pronti da consegnare"
        />
        <KpiChip
          icon={<Hand size={16} />}
          label="Con gli autisti"
          value={String(assigned)}
          hint="Assegnati / in uscita"
          tone="gold"
        />
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-0 w-full flex-1 sm:min-w-[220px]">
          <QrCode
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-1"
          />
          <Input
            className="pl-9 font-mono"
            placeholder="Scansiona o digita QR (ENX-118-2026)"
            value={scan}
            onChange={(e) => setScan(e.target.value)}
          />
        </div>
        <select
          className="h-9 w-full min-w-0 rounded-md border border-gray-2 bg-white px-3 text-sm sm:w-auto"
          value={lotId}
          onChange={(e) => setLotId(e.target.value)}
        >
          <option value="all">Tutti i lotti</option>
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.reference} · {lot.merchantName}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          disabled={selected.length === 0 || stage.isPending}
          onClick={() =>
            stage.mutate(selected, {
              onSuccess: () => {
                toast.success(`${selected.length} colli messi in baia`);
                setSelected([]);
              },
            })
          }
        >
          Metti in baia
        </Button>
        <select
          className="h-9 w-full min-w-0 rounded-md border border-gray-2 bg-white px-3 text-sm sm:w-auto"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        >
          <option value="">Consegna lista a…</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.firstName} {driver.lastName}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          disabled={selected.length === 0 || !driverId || assign.isPending}
          onClick={() =>
            assign.mutate(
              { orderIds: selected, driverId },
              {
                onSuccess: () => {
                  const driver = drivers.find((d) => d.id === driverId);
                  toast.success(
                    `${selected.length} colli consegnati a ${driver?.firstName ?? "autista"}`,
                  );
                  setSelected([]);
                },
              },
            )
          }
        >
          Consegna {selected.length || ""} colli
        </Button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setFilter(pill.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              filter === pill.id
                ? "border-navy bg-navy text-white"
                : "border-[#e5e9ef] bg-white text-[#4b5563] hover:border-navy-100",
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.35fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-[#eef1f4] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-1">
            Lotti in ingresso
          </div>
          {manifestsQuery.isLoading ? (
            <TableSkeleton rows={4} />
          ) : lots.length === 0 ? (
            <EmptyState
              title="Nessun lotto ancora"
              description="Ricevi una lista commerciante per aprire un lotto di deposito."
            />
          ) : (
            <ul className="divide-y divide-[#eef1f4]">
              {lots.map((lot) => {
                const count = parcels.filter((p) => p.manifestId === lot.id).length;
                const waiting = parcels.filter(
                  (p) =>
                    p.manifestId === lot.id &&
                    (p.depotStatus === "INBOUND" || p.depotStatus === "STAGED"),
                ).length;
                const activeLot = lotId === lot.id;
                return (
                  <li key={lot.id}>
                    <button
                      onClick={() => setLotId(activeLot ? "all" : lot.id)}
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-navy-50",
                        activeLot && "bg-gold-soft",
                      )}
                    >
                      <p className="font-mono text-xs font-semibold text-navy">
                        {lot.reference}
                      </p>
                      <p className="text-sm font-semibold text-ink">
                        {lot.merchantName}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-1">
                        {count} colli · {waiting} ancora in cortile · {timeAgo(lot.receivedAt)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eef1f4] px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-1">
              Colli in cortile
            </p>
            <button
              className="text-[11px] font-semibold text-green-3 hover:underline"
              onClick={() => setSelected(yardIds)}
            >
              Seleziona in cortile ({yardIds.length})
            </button>
          </div>
          {ordersQuery.isLoading ? (
            <TableSkeleton rows={8} />
          ) : visible.length === 0 ? (
            <EmptyState
              title="Nessun collo corrispondente"
              description="Scansiona un QR o ricevi una nuova lista in ingresso."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
                <thead className="bg-[#f7f9fb] text-[10px] uppercase tracking-wide text-gray-1">
                  <tr>
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2 font-semibold">QR</th>
                    <th className="px-3 py-2 font-semibold">Destinatario</th>
                    <th className="px-3 py-2 font-semibold">Lotto</th>
                    <th className="px-3 py-2 font-semibold">Deposito</th>
                    <th className="px-3 py-2 font-semibold">Autista</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((parcel) => {
                    const qr = parcelQr(parcel);
                    const hit =
                      scan.trim().length > 0 &&
                      qr.toLowerCase() === scan.trim().toLowerCase();
                    return (
                      <tr
                        key={parcel.id}
                        onClick={() => setActiveId(parcel.id)}
                        className={cn(
                          "cursor-pointer border-t border-[#eef1f4] hover:bg-[#fbfcfd]",
                          selected.includes(parcel.id) && "bg-gold-soft",
                          hit && "bg-green-soft",
                        )}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(parcel.id)}
                            onChange={() => toggle(parcel.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <ParcelQr value={qr} size={52} />
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-semibold text-navy">
                            {parcel.recipientName}
                          </p>
                          <p className="text-[11px] text-gray-1">{parcel.address}</p>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-[#4b5563]">
                          {parcel.manifestRef ?? "—"}
                          <div>{parcel.merchantName}</div>
                        </td>
                        <td className="px-3 py-2">
                          <DepotStatusBadge status={parcel.depotStatus} />
                        </td>
                        <td className="px-3 py-2">
                          {parcel.assignedDriverName ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ParcelDrawer
        parcel={active}
        onClose={() => setActiveId(null)}
        onStage={() => {
          if (!active) return;
          stage.mutate([active.id], {
            onSuccess: () => toast.success("Collo messo in baia"),
          });
        }}
      />
    </div>
  );
}

function ParcelDrawer({
  parcel,
  onClose,
  onStage,
}: {
  parcel: Order | null;
  onClose: () => void;
  onStage: () => void;
}) {
  if (!parcel) return null;
  const qr = parcelQr(parcel);

  return (
    <Modal open={Boolean(parcel)} onClose={onClose} title="Etichetta collo">
      <div className="flex flex-col items-center gap-3">
        <ParcelQr value={qr} size={180} />
        <div className="w-full text-sm">
          <p className="font-semibold text-navy">{parcel.recipientName}</p>
          <p className="text-[#4b5563]">{parcel.address}</p>
          <p className="mt-2 text-xs text-gray-1">
            {parcel.merchantName} · {parcel.manifestRef}
            {parcel.fragile ? " · Fragile" : ""}
          </p>
        </div>
        <DepotStatusBadge status={parcel.depotStatus} />
        {parcel.depotStatus === "INBOUND" ? (
          <Button className="w-full" onClick={onStage}>
            Metti in baia questo collo
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}
