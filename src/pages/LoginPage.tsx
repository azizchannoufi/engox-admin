import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { mockOpsLogin } from "@/api/services";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appConfig } from "@/lib/config";

export function LoginPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const [email, setEmail] = useState("marcus.k@engox.com");
  const [busy, setBusy] = useState(false);

  async function enterOps() {
    setBusy(true);
    try {
      const session = await mockOpsLogin();
      setSession({ ...session, email });
      toast.success("Accesso al comando Hub Queens");
      navigate("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh bg-navy">
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(1,212,166,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(201,162,39,0.16),transparent_42%)]" />
        <div className="relative flex h-full flex-col justify-between p-8 text-white xl:p-12">
          <img src="/logo2.png" alt="Engox" className="h-10 w-auto brightness-0 invert" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-green-2">
              Comando missioni
            </p>
            <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight xl:text-4xl">
              Operazioni flotta per l’ultimo miglio — live, verificabili, on-brand.
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/70">
              Hub Queens · tracce GPS · ispettore POD · assegnazione percorsi. I
              dati mock sono caricati per anteprima senza API.
            </p>
          </div>
          <p className="text-xs text-white/50">Engox Logistics · Back-office admin</p>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center bg-white px-5 py-10 sm:px-8 lg:max-w-md lg:flex-none lg:py-12">
        <img src="/logo.png" alt="Engox Logistics" className="mb-8 h-9 w-auto self-start" />
        <h2 className="text-2xl font-bold text-navy">Accedi</h2>
        <p className="mt-1 text-sm text-gray-1">
          {appConfig.useMock
            ? "Modalità mock attiva. Il login Firebase è simulato finché il backend non è collegato."
            : "Scambia un token Firebase con POST /auth/login."}
        </p>
        <label className="mt-6 text-xs font-semibold text-navy">Email di lavoro</label>
        <Input
          className="mt-1"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button className="mt-5 w-full" size="lg" disabled={busy} onClick={() => void enterOps()}>
          Continua come responsabile ops
        </Button>
        <p className="mt-4 text-xs text-gray-1">
          Ruolo richiesto: ADMIN · I guard NestJS lo applicheranno in produzione.
        </p>
      </div>
    </div>
  );
}
