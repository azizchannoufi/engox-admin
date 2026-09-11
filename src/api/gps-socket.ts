/**
 * Socket.IO client for NestJS GpsTrackingGateway (`namespace: gps-tracking`).
 * Not connected while mock mode is on — live pins currently come from mock GPS.
 */
import { io, type Socket } from "socket.io-client";
import { appConfig } from "@/lib/config";
import { getAccessToken } from "@/api/client";
import type { LivePosition } from "@/types/domain";

let socket: Socket | null = null;

export function connectGpsSocket(onPosition: (payload: LivePosition) => void) {
  if (appConfig.useMock) return () => undefined;
  if (socket) return () => socket?.disconnect();

  socket = io(appConfig.gpsWsUrl, {
    auth: { token: getAccessToken() },
    transports: ["websocket"],
  });

  socket.on("position", onPosition);
  socket.on("gps:position", onPosition);

  return () => {
    socket?.disconnect();
    socket = null;
  };
}
