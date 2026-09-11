import { mockDrivers, mockOrders, mockVehicles } from "@/mock/data";
import type {
  DepotStatus,
  Driver,
  InboundManifest,
  Order,
  OrderSeed,
  WarehouseDelivery,
} from "@/types/domain";
import type { CreateOrderDraft, InboundListPayload } from "@/types/orders";

let nextOrderNum = 88450;
let nextEnx = 300;
let nextLot = 2;

function driverById(id: string | null | undefined): Driver | null {
  if (!id) return null;
  return mockDrivers.find((driver) => driver.id === id) ?? null;
}

function unitFor(driver: Driver | null) {
  if (!driver) return null;
  return (
    mockVehicles.find((vehicle) => vehicle.id === driver.vehicleId)?.unitCode ??
    driver.licensePlate
  );
}

function driverName(driver: Driver) {
  return `${driver.firstName} ${driver.lastName}`;
}

function depotFromSeed(order: OrderSeed): DepotStatus {
  if (order.status === "DELIVERED") return "DELIVERED";
  if (order.status === "FAILED") return "FAILED";
  if (order.status === "OUT_FOR_DELIVERY") return "OUT_FOR_DELIVERY";
  if (order.assignedDriverId) return "ASSIGNED";
  return "INBOUND";
}

function hydrate(order: OrderSeed): Order {
  return {
    ...order,
    qrCode: order.trackingNumber,
    merchantName: "Apex Commerce",
    manifestId: "lot-seed-apex",
    manifestRef: "LOT-QNS-APEX-001",
    depotStatus: depotFromSeed(order),
    weightKg: 1.4,
    fragile: false,
  };
}

function nextQr(explicit?: string) {
  if (explicit?.trim()) return explicit.trim().toUpperCase();
  nextEnx += 1;
  return `ENX-${String(nextEnx).padStart(3, "0")}-2026`;
}

let orders: Order[] = mockOrders.map(hydrate);
let manifests: InboundManifest[] = [
  {
    id: "lot-seed-apex",
    reference: "LOT-QNS-APEX-001",
    merchantName: "Apex Commerce",
    receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    notes: "Ingresso subappalto mattutino — Hub Queens",
  },
];

const seedInbound: CreateOrderDraft[] = [
  {
    qrCode: "ENX-118-2026",
    recipientName: "Nadia Belkacem",
    address: "55-21 31st Ave",
    neighborhood: "Astoria",
  },
  {
    qrCode: "ENX-119-2026",
    recipientName: "Tom Alvarez",
    address: "78-02 Roosevelt Ave",
    neighborhood: "Jackson Heights",
    fragile: true,
  },
  {
    qrCode: "ENX-120-2026",
    recipientName: "Hana Kim",
    address: "136-21 41st Ave",
    neighborhood: "Flushing",
  },
];

createMockInboundList({
  merchantName: "Vandelay Imports",
  manifestRef: "LOT-QNS-VANDELAY-014",
  drafts: seedInbound,
});

export function getMockOrders(): Order[] {
  return structuredClone(orders);
}

export function getMockManifests(): InboundManifest[] {
  return structuredClone(manifests);
}

export function getMockWarehouseDeliveries(): WarehouseDelivery[] {
  return getMockOrders()
    .filter((order) => order.depotStatus === "INBOUND" || order.depotStatus === "STAGED")
    .map((order) => {
      const [firstName, ...rest] = order.recipientName.split(" ");
      return {
        id: order.id,
        dropoffAddress: order.address,
        status: order.status,
        customer: { firstName, lastName: rest.join(" ") || "—" },
        block: { id: order.blockId, status: "AVAILABLE" as const },
      };
    });
}

export function createMockInboundList(payload: InboundListPayload): {
  orders: Order[];
  manifestId: string;
  manifestRef: string;
} {
  const merchantName = payload.merchantName.trim() || "Commerciante in subappalto";
  nextLot += 1;
  const manifestId = `lot-${Date.now()}-${nextLot}`;
  const manifestRef =
    payload.manifestRef?.trim() ||
    `LOT-QNS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(nextLot).padStart(3, "0")}`;

  manifests = [
    {
      id: manifestId,
      reference: manifestRef,
      merchantName,
      receivedAt: new Date().toISOString(),
      notes: `${payload.drafts.length} colli ricevuti per la distribuzione last-mile`,
    },
    ...manifests,
  ];

  const created: Order[] = payload.drafts.map((draft, index) => {
    nextOrderNum += 1;
    const driver = driverById(draft.assignedDriverId);
    const qrCode = nextQr(draft.qrCode);
    const existingStops = driver
      ? orders.filter((order) => order.assignedDriverId === driver.id).length
      : 0;

    return {
      id: `ord-${nextOrderNum}`,
      trackingNumber: qrCode,
      qrCode,
      recipientName: draft.recipientName.trim(),
      address: draft.address.trim(),
      neighborhood: draft.neighborhood?.trim() || "Queens",
      lat: 40.7505 + (Math.random() - 0.5) * 0.08,
      lng: -73.835 + (Math.random() - 0.5) * 0.14,
      assignedDriverId: driver?.id ?? null,
      assignedDriverName: driver ? driverName(driver) : null,
      assignedUnit: unitFor(driver),
      status: driver ? "OUT_FOR_DELIVERY" : "PENDING",
      blockId: driver ? `blk-${driver.id}` : `blk-unassigned-${nextOrderNum}`,
      routeSequence: existingStops + index + 1,
      estimatedArrival: driver
        ? new Date(Date.now() + (index + 1) * 15 * 60 * 1000).toISOString()
        : null,
      createdAt: new Date().toISOString(),
      merchantName,
      manifestId,
      manifestRef,
      depotStatus: driver ? "ASSIGNED" : "INBOUND",
      weightKg: draft.weightKg ?? 1.2,
      fragile: draft.fragile ?? false,
    };
  });

  orders = [...created, ...orders];
  return {
    orders: structuredClone(created),
    manifestId,
    manifestRef,
  };
}

export function createMockOrders(drafts: CreateOrderDraft[]): Order[] {
  return createMockInboundList({
    merchantName: "Accettazione allo sportello",
    drafts,
  }).orders;
}

export function stageMockParcels(orderIds: string[]): Order[] {
  const idSet = new Set(orderIds);
  orders = orders.map((order) => {
    if (!idSet.has(order.id)) return order;
    if (order.depotStatus !== "INBOUND") return order;
    return { ...order, depotStatus: "STAGED" };
  });
  return structuredClone(orders.filter((order) => idSet.has(order.id)));
}

export function assignMockOrders(orderIds: string[], driverId: string): Order[] {
  const driver = driverById(driverId);
  if (!driver) throw new Error("Autista non trovato");

  const name = driverName(driver);
  const unit = unitFor(driver);
  let sequence = orders.filter((order) => order.assignedDriverId === driverId)
    .length;

  const idSet = new Set(orderIds);
  orders = orders.map((order) => {
    if (!idSet.has(order.id)) return order;
    if (order.status === "DELIVERED" || order.status === "FAILED") return order;
    sequence += 1;
    return {
      ...order,
      assignedDriverId: driver.id,
      assignedDriverName: name,
      assignedUnit: unit,
      status: "OUT_FOR_DELIVERY",
      depotStatus: "ASSIGNED",
      routeSequence: sequence,
      estimatedArrival:
        order.estimatedArrival ??
        new Date(Date.now() + sequence * 12 * 60 * 1000).toISOString(),
    };
  });

  return structuredClone(orders.filter((order) => idSet.has(order.id)));
}
