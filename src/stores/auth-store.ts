import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearTokens, setTokens } from "@/api/client";
import type { AdminSession } from "@/types/domain";

interface AuthState {
  session: AdminSession | null;
  setSession: (session: AdminSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => {
        setTokens(session.accessToken, session.refreshToken);
        set({ session });
      },
      logout: () => {
        clearTokens();
        set({ session: null });
      },
    }),
    { name: "engox.admin.auth" },
  ),
);
