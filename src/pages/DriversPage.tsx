import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useDriversQuery } from "@/api/hooks";
import { timeAgo } from "@/lib/dates";

export function DriversPage() {
  const query = useDriversQuery();

  return (
    <div className="space-y-4 p-3 sm:p-5">
      <div>
        <p className="text-[11px] font-medium text-gray-1">Gestione autisti</p>
        <h1 className="text-xl font-bold text-navy sm:text-2xl">Turno in servizio</h1>
      </div>
      <Card className="overflow-hidden">
        {query.isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-[#f7f9fb] text-[11px] uppercase tracking-wide text-gray-1">
              <tr>
                <th className="px-4 py-3 font-semibold">Autista</th>
                <th className="px-4 py-3 font-semibold">Contatto</th>
                <th className="px-4 py-3 font-semibold">Mezzo</th>
                <th className="px-4 py-3 font-semibold">Stato</th>
                <th className="px-4 py-3 font-semibold">Verifica precedenti</th>
                <th className="px-4 py-3 font-semibold">Progresso</th>
                <th className="px-4 py-3 font-semibold">Ultimo contatto</th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((driver) => (
                <tr key={driver.id} className="border-t border-[#eef1f4]">
                  <td className="px-4 py-3 font-semibold text-navy">
                    {driver.firstName} {driver.lastName}
                  </td>
                  <td className="px-4 py-3 text-[#4b5563]">
                    {driver.email}
                    <div className="text-[11px] text-gray-1">{driver.phone}</div>
                  </td>
                  <td className="px-4 py-3">{driver.licensePlate}</td>
                  <td className="px-4 py-3">
                    <Badge tone={driver.isOnline ? "success" : "neutral"}>
                      {driver.isOnline ? "In linea" : "Fuori linea"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        driver.backgroundCheckStatus === "APPROVED"
                          ? "success"
                          : "warning"
                      }
                    >
                      {driver.backgroundCheckStatus === "APPROVED"
                        ? "Approvato"
                        : driver.backgroundCheckStatus === "PENDING"
                          ? "In attesa"
                          : driver.backgroundCheckStatus === "REJECTED"
                            ? "Rifiutato"
                            : "Scaduto"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {driver.stopsDone}/{driver.stopsTotal}
                  </td>
                  <td className="px-4 py-3 text-gray-1">
                    {timeAgo(driver.lastSeenAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
