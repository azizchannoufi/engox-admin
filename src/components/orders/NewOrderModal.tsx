import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ListPlus, Package } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParcelQr } from "@/components/ui/parcel-qr";
import { useDriversQuery, useIngestInboundMutation } from "@/api/hooks";
import { parseOrderList } from "@/lib/parse-orders";
import { useUiStore } from "@/stores/ui-store";

const SAMPLE_LIST = `ENX-210-2026, Priya Shah, 22-15 31st St, Astoria
ENX-211-2026, Jonah Klein, 108-22 Queens Blvd, Forest Hills
ENX-212-2026, Lila Chen, 37-20 Broadway, Astoria
Maya Ortiz, 35-11 35th Ave, Astoria`;

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}

const selectClass =
  "h-9 w-full rounded-md border border-gray-2 bg-white px-3 text-sm text-ink outline-none focus:border-navy";

export function NewOrderModal() {
  const open = useUiStore((s) => s.newOrderOpen);
  const close = useUiStore((s) => s.closeNewOrder);
  const navigate = useNavigate();
  const driversQuery = useDriversQuery();
  const ingest = useIngestInboundMutation();

  const [merchantName, setMerchantName] = useState("");
  const [manifestRef, setManifestRef] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [driverId, setDriverId] = useState("");

  const parsed = useMemo(() => parseOrderList(bulkText), [bulkText]);
  const drivers = driversQuery.data ?? [];

  function reset() {
    setMerchantName("");
    setManifestRef("");
    setBulkText("");
    setDriverId("");
  }

  function handleClose() {
    reset();
    close();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Ricevi lista in ingresso" wide>
      <p className="mb-4 text-sm text-[#4b5563]">
        Engox è in subappalto: incolla la lista del commerciante all’arrivo in
        deposito. Ogni collo riceve un QR (usa il codice dello speditore, oppure
        emettiamo un’etichetta{" "}
        <span className="font-mono text-navy">ENX-###-2026</span>).
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Commerciante / speditore">
          <Input
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder="Apex Commerce"
          />
        </Field>
        <Field label="Riferimento lotto (opzionale)">
          <Input
            value={manifestRef}
            onChange={(e) => setManifestRef(e.target.value)}
            placeholder="LOT-QNS-APEX-042"
          />
        </Field>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Lista pacchi — un collo per riga">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={SAMPLE_LIST}
            className="h-40 w-full resize-y rounded-md border border-gray-2 bg-white px-3 py-2 font-mono text-xs text-ink outline-none placeholder:text-gray-1 focus:border-navy"
          />
        </Field>
        <p className="text-[11px] text-gray-1">
          Formato: <strong>QR, Destinatario, Indirizzo, Quartiere</strong>. Il QR è
          opzionale. Separatori virgola, pipe o tabulazione.
        </p>
        <div className="flex items-center justify-between text-xs text-gray-1">
          <span className="inline-flex items-center gap-1.5">
            <Package size={12} />
            {parsed.length} colli analizzati
          </span>
          <button
            className="font-semibold text-green-3 hover:underline"
            onClick={() => setBulkText(SAMPLE_LIST)}
          >
            Inserisci lista di esempio
          </button>
        </div>
        {parsed.length > 0 ? (
          <ul className="grid max-h-56 gap-2 overflow-y-auto rounded-md border border-[#eef1f4] bg-[#f7f9fb] p-2 custom-scroll sm:grid-cols-2">
            {parsed.map((draft, index) => {
              const qr = draft.qrCode || `ENX-auto-${index + 1}`;
              return (
                <li
                  key={`${draft.recipientName}-${index}`}
                  className="flex items-center gap-2 rounded-md border border-[#e7ebf0] bg-white p-2"
                >
                  <ParcelQr value={qr} size={56} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-navy">
                      {draft.recipientName}
                    </p>
                    <p className="truncate text-[11px] text-gray-1">
                      {draft.address}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="mt-4">
        <Field label="Consegna questa lista a un autista (opzionale)">
          <select
            className={selectClass}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
          >
            <option value="">Tieni in ingresso al deposito</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.firstName} {driver.lastName} · {driver.licensePlate}
                {driver.isOnline ? "" : " (fuori linea)"}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose}>
          Annulla
        </Button>
        <Button
          disabled={parsed.length === 0 || ingest.isPending}
          onClick={() => {
            ingest.mutate(
              {
                merchantName: merchantName.trim() || "Commerciante in subappalto",
                manifestRef: manifestRef.trim() || undefined,
                drafts: parsed.map((draft) => ({
                  ...draft,
                  assignedDriverId: driverId || null,
                })),
              },
              {
                onSuccess: (result) => {
                  toast.success(
                    `Lotto ${result.manifestRef}: ${result.orders.length} colli ricevuti con etichette QR`,
                  );
                  handleClose();
                  navigate("/depot");
                },
                onError: (error) => {
                  toast.error(
                    error instanceof Error ? error.message : "Ricezione non riuscita",
                  );
                },
              },
            );
          }}
        >
          <ListPlus size={14} />
          Ricevi {parsed.length || ""} colli
        </Button>
      </div>
    </Modal>
  );
}
