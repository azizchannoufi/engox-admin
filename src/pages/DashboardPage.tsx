import {
  AlertTriangle,
  CheckCircle2,
  Navigation,
  PackageCheck,
  Truck,
  Users,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "recharts";
import { timeAgo } from "@/lib/dates";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiChip } from "@/components/ui/kpi-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { OpsMap } from "@/components/maps/OpsMap";
import {
  useAlertsQuery,
  useDashboardQuery,
  useDriversQuery,
  useOrdersQuery,
} from "@/api/hooks";
import { hourlyVolume, statusBreakdown } from "@/mock/data";
import { formatNumber } from "@/lib/utils";

export function DashboardPage() {
  const kpis = useDashboardQuery();
  const drivers = useDriversQuery();
  const orders = useOrdersQuery();
  const alerts = useAlertsQuery();

  return (
    <div className="space-y-4 p-5">
      <div>
        <p className="text-[11px] font-medium text-gray-1">
          Comando flotta · Hub Queens
        </p>
        <h1 className="text-2xl font-bold text-navy">Dashboard esecutiva</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.isLoading || !kpis.data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-lg" />
          ))
        ) : (
          <>
            <KpiChip
              icon={<PackageCheck size={18} />}
              label="Consegne di oggi"
              value={formatNumber(kpis.data.deliveriesToday)}
              hint="POD verificati nella finestra"
            />
            <KpiChip
              icon={<Users size={18} />}
              label="Autisti in servizio"
              value={String(kpis.data.activeDrivers)}
              hint="Heartbeat GPS < 2 min"
              tone="navy"
            />
            <KpiChip
              icon={<CheckCircle2 size={18} />}
              label="Tasso di successo"
              value={`${kpis.data.successRate}%`}
              hint="Esclusi i blocchi annullati"
            />
            <KpiChip
              icon={<AlertTriangle size={18} />}
              label="Consegne fallite"
              value={String(kpis.data.failedDeliveries)}
              hint="Da rivedere nelle eccezioni"
              tone="gold"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Navigation size={15} />
              Mappa flotta attiva
            </div>
            <span className="text-[11px] text-gray-1">
              {drivers.data?.filter((d) => d.isOnline).length ?? 0} mezzi live
            </span>
          </CardHeader>
          <div className="h-[340px]">
            <OpsMap
              drivers={drivers.data ?? []}
              orders={orders.data ?? []}
              zoom={11}
            />
          </div>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                <Truck size={15} />
                Stato consegne live
              </div>
            </CardHeader>
            <div className="grid grid-cols-2 gap-2 p-3">
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {statusBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 self-center text-sm">
                {statusBreakdown.map((entry) => (
                  <li key={entry.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-1">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: entry.color }}
                      />
                      {entry.name}
                    </span>
                    <strong className="text-navy">{entry.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-navy">Volume orario</p>
            </CardHeader>
            <div className="h-[140px] px-2 pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyVolume}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="consegne" fill="#002366" radius={[4, 4, 0, 0]} name="Consegne" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-navy">Avvisi recenti</p>
        </CardHeader>
        <div className="divide-y divide-[#eef1f4]">
          {(alerts.data ?? []).map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 px-4 py-3">
              <span
                className={
                  alert.severity === "critical"
                    ? "mt-1 h-2 w-2 rounded-full bg-danger"
                    : alert.severity === "warning"
                      ? "mt-1 h-2 w-2 rounded-full bg-amber"
                      : "mt-1 h-2 w-2 rounded-full bg-green-2"
                }
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy">{alert.title}</p>
                <p className="text-sm text-[#5b6570]">{alert.detail}</p>
              </div>
              <span className="shrink-0 text-[11px] text-gray-1">
                {timeAgo(alert.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
