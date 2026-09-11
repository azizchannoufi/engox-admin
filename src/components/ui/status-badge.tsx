import type { DeliveryStatus, DepotStatus, MaintenanceStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const map = {
    PENDING: { tone: "warning" as const, label: "In attesa" },
    OUT_FOR_DELIVERY: { tone: "navy" as const, label: "In transito" },
    DELIVERED: { tone: "success" as const, label: "Consegnato" },
    FAILED: { tone: "danger" as const, label: "Fallito" },
  };
  const item = map[status];
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

export function DepotStatusBadge({ status }: { status: DepotStatus }) {
  const map = {
    INBOUND: { tone: "warning" as const, label: "In ingresso" },
    STAGED: { tone: "mint" as const, label: "In baia" },
    ASSIGNED: { tone: "navy" as const, label: "Assegnato" },
    OUT_FOR_DELIVERY: { tone: "navy" as const, label: "In uscita" },
    DELIVERED: { tone: "success" as const, label: "Consegnato" },
    FAILED: { tone: "danger" as const, label: "Fallito" },
  };
  const item = map[status];
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

export function MaintenanceBadge({ status }: { status: MaintenanceStatus }) {
  const map = {
    OK: { tone: "success" as const, label: "Operativo" },
    DUE: { tone: "warning" as const, label: "Manutenzione" },
    IN_SHOP: { tone: "warning" as const, label: "In officina" },
    OUT_OF_SERVICE: { tone: "danger" as const, label: "Fuori servizio" },
  };
  const item = map[status];
  return <Badge tone={item.tone}>{item.label}</Badge>;
}
