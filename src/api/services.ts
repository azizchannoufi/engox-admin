/**
 * Admin API surface.
 * Paths match NestJS today (`/auth/*`, `/admin/*`) plus planned admin reads.
 * Flip VITE_USE_MOCK=false to send the same shapes over HTTP.
 */
import { apiRequest, mockLatency } from "@/api/client";
import { appConfig } from "@/lib/config";
import {
  mockAlerts,
  mockDrivers,
  mockKpis,
  mockPods,
  mockSession,
  mockVehicles,
} from "@/mock/data";
import {
  assignMockOrders,
  createMockInboundList,
  getMockManifests,
  getMockOrders,
  getMockWarehouseDeliveries,
  stageMockParcels,
} from "@/mock/store";
import type {
  AdminSession,
  AlertItem,
  AssignBlockResult,
  DashboardKpis,
  Driver,
  InboundManifest,
  Order,
  PodRecord,
  Vehicle,
  WarehouseDelivery,
} from "@/types/domain";
import type {
  AssignOrdersResult,
  CreateOrderDraft,
  CreateOrdersResult,
  InboundListPayload,
} from "@/types/orders";

export async function loginWithFirebaseToken(
  firebaseIdToken: string,
): Promise<AdminSession> {
  if (appConfig.useMock) {
    void firebaseIdToken;
    return mockLatency(mockSession);
  }

  const payload = await apiRequest<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: string;
    uid: string;
    role: AdminSession["role"];
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ firebaseIdToken }),
  });

  return {
    ...payload,
    refreshToken: payload.refreshToken ?? "",
    name: "Admin",
    title: "Operazioni",
    email: "",
  };
}

export async function mockOpsLogin(): Promise<AdminSession> {
  return mockLatency(mockSession, 180);
}

export async function fetchDashboard(): Promise<DashboardKpis> {
  if (appConfig.useMock) return mockLatency(mockKpis);
  return apiRequest("/admin/dashboard");
}

export async function fetchDrivers(): Promise<Driver[]> {
  if (appConfig.useMock) return mockLatency(mockDrivers);
  return apiRequest("/admin/drivers");
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  if (appConfig.useMock) return mockLatency(mockVehicles);
  return apiRequest("/admin/vehicles");
}

export async function fetchOrders(): Promise<Order[]> {
  if (appConfig.useMock) return mockLatency(getMockOrders());
  return apiRequest("/admin/deliveries");
}

export async function fetchManifests(): Promise<InboundManifest[]> {
  if (appConfig.useMock) return mockLatency(getMockManifests(), 180);
  return apiRequest("/admin/manifests");
}

export async function fetchPods(): Promise<PodRecord[]> {
  if (appConfig.useMock) return mockLatency(mockPods);
  return apiRequest("/admin/pods");
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  if (appConfig.useMock) return mockLatency(mockAlerts, 200);
  return apiRequest("/admin/alerts");
}

export async function fetchWarehouseDeliveries(): Promise<{
  deliveries: WarehouseDelivery[];
}> {
  if (appConfig.useMock) {
    return mockLatency({ deliveries: getMockWarehouseDeliveries() });
  }
  return apiRequest("/admin/deliveries/unassigned");
}

export async function assignBlock(
  blockId: string,
  driverProfileId: string,
): Promise<AssignBlockResult> {
  if (appConfig.useMock) {
    return mockLatency({
      blockId,
      driverProfileId,
      status: "ASSIGNED",
    });
  }
  return apiRequest(`/admin/blocks/${blockId}/assign/${driverProfileId}`, {
    method: "POST",
  });
}

export async function assignVehicle(vehicleId: string, driverId: string) {
  if (appConfig.useMock) {
    return mockLatency({ vehicleId, driverId, status: "ASSIGNED" as const });
  }
  return apiRequest(`/admin/vehicles/${vehicleId}/assign/${driverId}`, {
    method: "POST",
  });
}

export async function assignOrders(
  orderIds: string[],
  driverId: string,
): Promise<AssignOrdersResult> {
  if (appConfig.useMock) {
    assignMockOrders(orderIds, driverId);
    return mockLatency({ orderIds, driverId, status: "ASSIGNED" });
  }
  return apiRequest("/admin/deliveries/assign", {
    method: "POST",
    body: JSON.stringify({ orderIds, driverId }),
  });
}

export async function createOrders(
  drafts: CreateOrderDraft[],
): Promise<CreateOrdersResult> {
  return ingestInboundList({ merchantName: "Accettazione allo sportello", drafts });
}

export async function ingestInboundList(
  payload: InboundListPayload,
): Promise<CreateOrdersResult> {
  if (appConfig.useMock) {
    return mockLatency(createMockInboundList(payload));
  }
  return apiRequest("/admin/manifests/inbound", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function stageParcels(orderIds: string[]) {
  if (appConfig.useMock) {
    stageMockParcels(orderIds);
    return mockLatency({ orderIds, status: "STAGED" as const });
  }
  return apiRequest("/admin/parcels/stage", {
    method: "POST",
    body: JSON.stringify({ orderIds }),
  });
}
