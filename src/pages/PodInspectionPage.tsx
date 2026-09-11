import { useMemo, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Calendar,
  Check,
  Download,
  FileSpreadsheet,
  Flag,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  Signature,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KpiChip } from "@/components/ui/kpi-chip";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { OpsMap } from "@/components/maps/OpsMap";
import { useDashboardQuery, usePodsQuery } from "@/api/hooks";
import { formatItDate, timeAgo } from "@/lib/dates";
import { cn, formatNumber } from "@/lib/utils";
import type { PodFilter, PodRecord } from "@/types/domain";
import { toast } from "sonner";

function geotagTone(verdict: PodRecord["geotagVerdict"]) {
  if (verdict === "match") return "text-green-3";
  if (verdict === "border") return "text-[#b45309]";
  return "text-danger";
}

function geotagLabel(verdict: PodRecord["geotagVerdict"]) {
  if (verdict === "match") return "Corrispondenza";
  if (verdict === "border") return "Limite";
  return "Anomalia";
}

export function PodInspectionPage() {
  const podsQuery = usePodsQuery();
  const kpis = useDashboardQuery();
  const [filter, setFilter] = useState<PodFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(["pod-88391"]);
  const [activeId, setActiveId] = useState("pod-88391");

  const pods = podsQuery.data ?? [];
  const filtered = useMemo(() => {
    return pods.filter((pod) => {
      const q = search.toLowerCase();
      const matchesSearch =
        pod.orderId.includes(q) ||
        pod.recipientName.toLowerCase().includes(q) ||
        pod.trackingNumber.toLowerCase().includes(q) ||
        pod.address.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filter === "verified") return !pod.flagged && !pod.missingSignature;
      if (filter === "photo") return pod.photoOnly;
      if (filter === "flagged") return pod.flagged;
      if (filter === "missing-signature") return pod.missingSignature;
      return true;
    });
  }, [pods, filter, search]);

  const active = pods.find((p) => p.id === activeId) ?? filtered[0] ?? null;

  const counts = {
    all: pods.length,
    verified: pods.filter((p) => !p.flagged && !p.missingSignature).length,
    photo: pods.filter((p) => p.photoOnly).length,
    flagged: pods.filter((p) => p.flagged).length,
    "missing-signature": pods.filter((p) => p.missingSignature).length,
  };

  function toggleSelect(id: string) {
    setSelectedIds((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
    );
  }

  const pills: { id: PodFilter; label: string; extra?: string }[] = [
    { id: "all", label: "Tutti i log", extra: formatNumber(kpis.data?.auditedPods ?? counts.all) },
    { id: "verified", label: "Verificati e firmati", extra: formatNumber(counts.verified) },
    { id: "photo", label: "Solo foto", extra: String(counts.photo) },
    { id: "flagged", label: "Dispute segnalate", extra: String(counts.flagged) },
    { id: "missing-signature", label: "Firma mancante", extra: String(counts["missing-signature"]) },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-gray-1">
            Comando flotta › Prova di consegna (POD) › Archivio audit e ispezione
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold leading-tight text-navy">
              Ispezione POD e archivio
              <br className="hidden sm:block" /> audit
            </h1>
            <Badge tone="navy" className="rounded-md px-2 py-1">
              DEPOSITO ATTIVO
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <KpiChip
            icon={<ShieldCheck size={16} />}
            label="POD verificati oggi"
            value={formatNumber(kpis.data?.auditedPods ?? 1842)}
            hint="verificati"
          />
          <KpiChip
            icon={<Flag size={16} />}
            label="Dispute segnalate"
            value={String(kpis.data?.flaggedDisputes ?? 14)}
            hint="da rivedere"
            tone="gold"
          />
          <KpiChip
            icon={<MapPin size={16} />}
            label="Precisione GPS"
            value={`${kpis.data?.gpsMatchAccuracy ?? 99.2}%`}
            hint="delta <15 m"
            tone="navy"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm">
          <Calendar size={14} />
          Oggi ({formatItDate(new Date())})
        </Button>
        <div className="relative min-w-[240px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-1" />
          <Input
            className="pl-9"
            placeholder="Cerca tracking, destinatario"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <ScanLine size={14} /> Scansiona
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.message("Re-indicizzazione geotag in coda (mock)")}
        >
          <RefreshCw size={14} /> Re-indicizza geotag
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Esportazione CSV preparata (mock)")}
        >
          <Download size={14} /> Esporta traccia CSV
        </Button>
        <Button
          variant="gold"
          size="sm"
          onClick={() =>
            toast.success(`${selectedIds.length} POD verificati in batch`)
          }
        >
          <Check size={14} /> Verifica batch ({selectedIds.length} selezionati)
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setFilter(pill.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
              filter === pill.id
                ? "border-navy bg-navy text-white"
                : "border-[#e5e9ef] bg-white text-[#4b5563] hover:border-navy-100",
            )}
          >
            {pill.id === "verified" ? <span className="text-green-2">●</span> : null}
            {pill.id === "photo" ? <ImageIcon size={12} /> : null}
            {pill.id === "flagged" ? <Flag size={12} /> : null}
            {pill.id === "missing-signature" ? <Signature size={12} /> : null}
            {pill.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                filter === pill.id ? "bg-white/15" : "bg-[#f1f3f6]",
                pill.id === "flagged" && filter !== pill.id && "bg-[#fff6e5] text-[#b45309]",
              )}
            >
              {pill.extra}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eef1f4] px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-1">
              Prove di consegna del manifesto
            </p>
            <span className="text-[11px] text-green-3">Flusso telemetria sincronizzato</span>
          </div>
          {podsQuery.isLoading ? (
            <TableSkeleton rows={8} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nessun record POD"
              description="Niente corrisponde a questo filtro di audit."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wide text-gray-1">
                  <tr>
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2 font-semibold">Ordine e tracking</th>
                    <th className="px-3 py-2 font-semibold">Orario</th>
                    <th className="px-3 py-2 font-semibold">Autista / mezzo</th>
                    <th className="px-3 py-2 font-semibold">Destinatario e indirizzo</th>
                    <th className="px-3 py-2 font-semibold">Delta geotag</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pod) => {
                    const selected = selectedIds.includes(pod.id);
                    const activeRow = active?.id === pod.id;
                    return (
                      <tr
                        key={pod.id}
                        onClick={() => setActiveId(pod.id)}
                        className={cn(
                          "cursor-pointer border-t border-[#eef1f4]",
                          activeRow && "bg-gold-soft shadow-[inset_3px_0_0_#C9A227]",
                          pod.flagged && !activeRow && "bg-[#fff8f7]",
                        )}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(pod.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className={cn("px-3 py-3", pod.flagged && "text-danger")}>
                          <p className="font-bold">
                            #{pod.orderId.replace("ord-", "ORD-").toUpperCase()}
                          </p>
                          <p className="text-[11px] text-gray-1">
                            {pod.trackingNumber}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-navy">
                            {format(new Date(pod.deliveredAt), "HH:mm:ss", { locale: it })}
                          </p>
                          <p className="text-[11px] text-green-3">EDT</p>
                          <p className="text-[11px] text-gray-1">
                            {timeAgo(pod.deliveredAt)}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold">{pod.driverName}</p>
                          <p className="text-[11px] text-gray-1">{pod.unitCode}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold">{pod.recipientName}</p>
                          <p className="text-[11px] text-gray-1">{pod.address}</p>
                        </td>
                        <td className={cn("px-3 py-3 font-semibold", geotagTone(pod.geotagVerdict))}>
                          <p>{pod.geotagDeltaM}m</p>
                          <p className="text-[11px] font-medium">
                            {geotagLabel(pod.geotagVerdict)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-[#eef1f4] px-4 py-2 text-[11px] text-gray-1">
            <span>
              Mostrati 1–{filtered.length} di {formatNumber(kpis.data?.auditedPods ?? filtered.length)} record di audit
            </span>
            <span>Righe: {filtered.length}</span>
          </div>
        </Card>

        {active ? <PodInspector pod={active} /> : null}
      </div>
    </div>
  );
}

function PodInspector({ pod }: { pod: PodRecord }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#111] bg-[#111] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} />
            <p className="text-sm font-semibold">Ispettore audit POD</p>
            <span className="rounded bg-green-3 px-1.5 py-0.5 text-[10px] font-bold">
              {pod.flagged ? "REVISIONE" : "OK"}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/70">
            Ordine #{pod.orderId.replace("ord-", "ORD-").toUpperCase()} · Consegnato{" "}
            {format(new Date(pod.deliveredAt), "HH:mm:ss", { locale: it })} EDT
          </p>
        </div>
      </div>

      <div className="space-y-3 bg-white p-3 text-ink">
        <section className="overflow-hidden rounded-md border border-[#e7ebf0]">
          <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-1">
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon size={12} /> Prova fotografica
            </span>
            <span className="text-green-3">IA verificata {pod.aiVerifiedPct}%</span>
          </div>
          <img src={pod.photoUrl} alt="Foto POD" className="h-48 w-full object-cover" />
          <p className="px-3 py-2 text-[11px] text-[#4b5563]">{pod.notes}</p>
        </section>

        <section className="rounded-md border border-[#e7ebf0] p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-gray-1">
            <span className="inline-flex items-center gap-1.5">
              <Signature size={12} /> Firma del destinatario
            </span>
            <span>SHA-256 validato</span>
          </div>
          <div className="mb-3 flex h-20 items-center justify-center rounded-md bg-[#f7f9fb]">
            {pod.signatureUrl ? (
              <img src={pod.signatureUrl} alt="firma" className="h-16" />
            ) : (
              <span className="text-xs text-gray-1">Nessuna firma acquisita</span>
            )}
          </div>
          <p className="text-xs">
            Firmatario: <strong>{pod.signerName}</strong>
            {pod.signatureUrl ? (
              <span className="ml-2 text-green-3">Firmato crittograficamente</span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-gray-1">
            OTP SMS destinatario: {pod.smsVerified ? "Verificato" : "In attesa"} · {pod.phoneMasked}
          </p>
        </section>

        <section className="overflow-hidden rounded-md border border-[#e7ebf0]">
          <div className="flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} /> Geotag e telemetria veicolo
            </span>
            <span className={geotagTone(pod.geotagVerdict)}>
              {pod.geotagDeltaM}m corrispondenza (limite &lt;15 m)
            </span>
          </div>
          <div className="h-36">
            <OpsMap
              focus={[pod.lat, pod.lng]}
              zoom={15}
              orders={[
                {
                  id: pod.orderId,
                  trackingNumber: pod.trackingNumber,
                  recipientName: pod.recipientName,
                  address: pod.address,
                  neighborhood: "",
                  lat: pod.lat,
                  lng: pod.lng,
                  assignedDriverId: pod.driverId,
                  assignedDriverName: pod.driverName,
                  assignedUnit: pod.unitCode,
                  status: "DELIVERED",
                  blockId: "blk",
                  routeSequence: 1,
                  estimatedArrival: pod.deliveredAt,
                  createdAt: pod.deliveredAt,
                  qrCode: pod.trackingNumber,
                  merchantName: "Apex Commerce",
                  manifestId: null,
                  manifestRef: null,
                  depotStatus: "DELIVERED",
                  weightKg: null,
                  fragile: false,
                },
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
