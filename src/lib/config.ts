/** Runtime flags. Mock stays on until the NestJS admin surface is connected. */
export const appConfig = {
  useMock: import.meta.env.VITE_USE_MOCK !== "false",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  gpsWsUrl:
    import.meta.env.VITE_GPS_WS_URL ?? "http://localhost:3000/gps-tracking",
};
