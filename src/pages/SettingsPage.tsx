import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/lib/config";
import { Colors } from "@/constants/theme";

export function SettingsPage() {
  return (
    <div className="space-y-4 p-5">
      <div>
        <p className="text-[11px] font-medium text-gray-1">Impostazioni</p>
        <h1 className="text-2xl font-bold text-navy">Workspace e API</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-navy">Origine dati</h2>
          <p className="mt-1 text-sm text-[#4b5563]">
            L’interfaccia parla con `src/api/services.ts`. La modalità mock è
            attiva così ogni schermata si può visualizzare in anteprima senza NestJS.
            Cambia il flag quando le API admin saranno pronte.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-1">Modalità mock</dt>
              <dd>
                <Badge tone={appConfig.useMock ? "warning" : "success"}>
                  {appConfig.useMock ? "ON — JSON locale" : "OFF — API live"}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-1">Base API</dt>
              <dd className="font-mono text-xs">{appConfig.apiBaseUrl}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-1">Socket GPS</dt>
              <dd className="font-mono text-xs">{appConfig.gpsWsUrl}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-navy">Colori del brand</h2>
          <p className="mt-1 text-sm text-[#4b5563]">
            Portati dall’app autisti così Fleet Ops resta sui colori Engox
            verde / navy.
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {Object.entries({
              navy: Colors.blues.blue1,
              green1: Colors.greens.green1,
              green2: Colors.greens.green2,
              green3: Colors.greens.green3,
              error: Colors.status.error,
            }).map(([name, color]) => (
              <div key={name} className="text-center">
                <div
                  className="h-10 rounded-md border border-[#e7ebf0]"
                  style={{ background: color }}
                />
                <p className="mt-1 text-[10px] text-gray-1">{name}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-navy">Endpoint NestJS pronti</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[#4b5563] md:grid-cols-2">
            <li>`POST /auth/login` — scambio token Firebase</li>
            <li>`POST /auth/refresh` — rinnovo access token</li>
            <li>`POST /auth/logout` — invalida le sessioni</li>
            <li>`GET /admin/deliveries/unassigned` — vista magazzino</li>
            <li>`POST /admin/manifests/inbound` — ricevi lista colli + QR</li>
            <li>`POST /admin/parcels/stage` — metti in baia i colli</li>
            <li>`POST /admin/blocks/:id/assign/:driverId` — assegna blocco</li>
            <li>`WS /gps-tracking` — posizioni live (token admin)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
