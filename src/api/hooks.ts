import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignBlock,
  assignOrders,
  assignVehicle,
  createOrders,
  fetchAlerts,
  fetchDashboard,
  fetchDrivers,
  fetchManifests,
  fetchOrders,
  fetchPods,
  fetchVehicles,
  fetchWarehouseDeliveries,
  ingestInboundList,
  stageParcels,
} from "@/api/services";
import type { CreateOrderDraft, InboundListPayload } from "@/types/orders";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  drivers: ["drivers"] as const,
  vehicles: ["vehicles"] as const,
  orders: ["orders"] as const,
  pods: ["pods"] as const,
  alerts: ["alerts"] as const,
  warehouse: ["warehouse-deliveries"] as const,
  manifests: ["manifests"] as const,
};

export function useDashboardQuery() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: fetchDashboard });
}

export function useDriversQuery() {
  return useQuery({ queryKey: queryKeys.drivers, queryFn: fetchDrivers });
}

export function useVehiclesQuery() {
  return useQuery({ queryKey: queryKeys.vehicles, queryFn: fetchVehicles });
}

export function useOrdersQuery() {
  return useQuery({ queryKey: queryKeys.orders, queryFn: fetchOrders });
}

export function usePodsQuery() {
  return useQuery({ queryKey: queryKeys.pods, queryFn: fetchPods });
}

export function useAlertsQuery() {
  return useQuery({ queryKey: queryKeys.alerts, queryFn: fetchAlerts });
}

export function useWarehouseQuery() {
  return useQuery({
    queryKey: queryKeys.warehouse,
    queryFn: fetchWarehouseDeliveries,
  });
}

export function useManifestsQuery() {
  return useQuery({ queryKey: queryKeys.manifests, queryFn: fetchManifests });
}

export function useAssignBlockMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      blockId,
      driverId,
    }: {
      blockId: string;
      driverId: string;
    }) => assignBlock(blockId, driverId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.orders });
      void client.invalidateQueries({ queryKey: queryKeys.warehouse });
    },
  });
}

export function useAssignVehicleMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      vehicleId,
      driverId,
    }: {
      vehicleId: string;
      driverId: string;
    }) => assignVehicle(vehicleId, driverId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.vehicles });
      void client.invalidateQueries({ queryKey: queryKeys.drivers });
    },
  });
}

export function useAssignOrdersMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderIds,
      driverId,
    }: {
      orderIds: string[];
      driverId: string;
    }) => assignOrders(orderIds, driverId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.orders });
      void client.invalidateQueries({ queryKey: queryKeys.warehouse });
      void client.invalidateQueries({ queryKey: queryKeys.manifests });
    },
  });
}

export function useCreateOrdersMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (drafts: CreateOrderDraft[]) => createOrders(drafts),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.orders });
      void client.invalidateQueries({ queryKey: queryKeys.warehouse });
      void client.invalidateQueries({ queryKey: queryKeys.manifests });
    },
  });
}

export function useIngestInboundMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: InboundListPayload) => ingestInboundList(payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.orders });
      void client.invalidateQueries({ queryKey: queryKeys.warehouse });
      void client.invalidateQueries({ queryKey: queryKeys.manifests });
    },
  });
}

export function useStageParcelsMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (orderIds: string[]) => stageParcels(orderIds),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.orders });
      void client.invalidateQueries({ queryKey: queryKeys.warehouse });
    },
  });
}
