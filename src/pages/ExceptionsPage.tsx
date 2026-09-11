import { timeAgo } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAlertsQuery, useOrdersQuery } from "@/api/hooks";

export function ExceptionsPage() {
  const alerts = useAlertsQuery();
  const orders = useOrdersQuery();
  const failed = (orders.data ?? []).filter((o) => o.status === "FAILED");
  const flaggedAlerts = (alerts.data ?? []).filter(
    (a) => a.severity !== "info",
  );

  return (
    <div className="space-y-4 p-5">
      <div>
        <p className="text-[11px] font-medium text-gray-1">Eccezioni e reclami</p>
        <h1 className="text-2xl font-bold text-navy">Dispute aperte</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="border-b border-[#eef1f4] px-4 py-3 text-sm font-semibold text-navy">
            Consegne fallite
          </div>
          {orders.isLoading ? (
            <TableSkeleton rows={3} />
          ) : failed.length === 0 ? (
            <EmptyState
              title="Nessuna fermata fallita"
              description="Le consegne fallite appariranno qui per la revisione reclami."
            />
          ) : (
            <ul className="divide-y divide-[#eef1f4]">
              {failed.map((order) => (
                <li key={order.id} className="px-4 py-3">
                  <p className="font-semibold text-navy">
                    #{order.id.replace("ord-", "ORD-").toUpperCase()} · {order.recipientName}
                  </p>
                  <p className="text-sm text-[#4b5563]">{order.address}</p>
                  <p className="mt-1 text-xs text-gray-1">
                    {order.assignedDriverName} · {order.assignedUnit}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="border-b border-[#eef1f4] px-4 py-3 text-sm font-semibold text-navy">
            Eccezioni live
          </div>
          {alerts.isLoading ? (
            <TableSkeleton rows={4} />
          ) : (
            <ul className="divide-y divide-[#eef1f4]">
              {flaggedAlerts.map((alert) => (
                <li key={alert.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={alert.severity === "critical" ? "danger" : "warning"}>
                      {alert.severity === "critical"
                        ? "critico"
                        : alert.severity === "warning"
                          ? "avviso"
                          : "info"}
                    </Badge>
                    <p className="font-semibold text-navy">{alert.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-[#4b5563]">{alert.detail}</p>
                  <p className="mt-1 text-[11px] text-gray-1">
                    {timeAgo(alert.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
