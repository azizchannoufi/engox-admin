/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GPS_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
