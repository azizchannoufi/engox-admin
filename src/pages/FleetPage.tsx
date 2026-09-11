import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { MaintenanceBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  useAssignVehicleMutation,
  useDriversQuery,
  useVehiclesQuery,
} from "@/api/hooks";
import { formatNumber } from "@/lib/utils";
import { Link } from "react-router-dom";

export function FleetPage() {
  const vehiclesQuery = useVehiclesQuery();
  const driversQuery = useDriversQuery();
  const assign = useAssignVehicleMutation();
  const [search, setSearch] = useState("");
  const [assignVehicleId, setAssignVehicleId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState("");

  const rows = useMemo(() => {
    const list = vehiclesQuery.data ?? [];
    const q = search.toLowerCase();
    return list.filter(
      (v) =>
        v.unitCode.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q) ||
        (v.assignedDriverName ?? "").toLowerCase().includes(q),
    );
  }, [vehiclesQuery.data, search]);

  const freeDrivers = (driversQuery.data ?? []).filter(
    (d) => !d.vehicleId || d.vehicleId === assignVehicleId,
  );

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-gray-1">
            Veicoli e autisti
          </p>
          <h1 className="text-2xl font-bold text-navy">Assegnazione flotta</h1>
        </div>
        <Link to="/drivers" className="text-sm font-semibold text-green-3 hover:underline">
          Apri gestione autisti →
        </Link>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Cerca mezzo, targa, autista"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card className="overflow-hidden">
        {vehiclesQuery.isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Nessun veicolo trovato"
            description="Modifica la ricerca o importa il parco mezzi dall’API."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#f7f9fb] text-[11px] uppercase tracking-wide text-gray-1">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID veicolo</th>
                  <th className="px-4 py-3 font-semibold">Targa</th>
                  <th className="px-4 py-3 font-semibold">Modello</th>
                  <th className="px-4 py-3 font-semibold">Autista assegnato</th>
                  <th className="px-4 py-3 font-semibold">Chilometraggio</th>
                  <th className="px-4 py-3 font-semibold">Manutenzione</th>
                  <th className="px-4 py-3 font-semibold">Azione</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t border-[#eef1f4] hover:bg-[#fbfcfd]">
                    <td className="px-4 py-3 font-semibold text-navy">{vehicle.unitCode}</td>
                    <td className="px-4 py-3">{vehicle.plateNumber}</td>
                    <td className="px-4 py-3">{vehicle.model}</td>
                    <td className="px-4 py-3">
                      {vehicle.assignedDriverName ?? (
                        <Badge tone="warning">Non assegnato</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatNumber(vehicle.mileageKm)} km</td>
                    <td className="px-4 py-3">
                      <MaintenanceBadge status={vehicle.maintenanceStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssignVehicleId(vehicle.id);
                          setDriverId(vehicle.assignedDriverId ?? "");
                        }}
                      >
                        Assegna veicolo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(assignVehicleId)}
        onClose={() => setAssignVehicleId(null)}
        title="Assegna veicolo all’autista"
      >
        <p className="mb-3 text-sm text-gray-1">
          Abbina un autista disponibile a questo mezzo per il turno corrente.
        </p>
        <select
          className="h-10 w-full rounded-md border border-gray-2 bg-white px-3 text-sm"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        >
          <option value="">Seleziona autista</option>
          {freeDrivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.firstName} {driver.lastName} · {driver.licensePlate}
            </option>
          ))}
        </select>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAssignVehicleId(null)}>
            Annulla
          </Button>
          <Button
            disabled={!driverId || assign.isPending}
            onClick={() => {
              if (!assignVehicleId) return;
              assign.mutate(
                { vehicleId: assignVehicleId, driverId },
                {
                  onSuccess: () => {
                    toast.success("Veicolo assegnato per questo turno");
                    setAssignVehicleId(null);
                  },
                },
              );
            }}
          >
            Conferma assegnazione
          </Button>
        </div>
      </Modal>
    </div>
  );
}
