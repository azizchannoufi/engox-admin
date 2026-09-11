/**
 * Domain types aligned with Back-End Prisma enums / admin contracts.
 * Keep these stable so swapping mock → HTTP is a client change, not a UI rewrite.
 */

export type UserRole = "DRIVER" | "ADMIN" | "MERCHANT";
export type VehicleType = "CAR" | "VAN" | "SCOOTER" | "BIKE";
export type BackgroundCheckStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
export type BlockStatus =
  | "AVAILABLE"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";
export type DeliveryStatus = "PENDING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED";
export type DepotStatus =
  | "INBOUND"
  | "STAGED"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED";
export type MaintenanceStatus = "OK" | "DUE" | "IN_SHOP" | "OUT_OF_SERVICE";
export type AlertSeverity = "info" | "warning" | "critical";
export type PodFilter =
  | "all"
  | "verified"
  | "photo"
  | "flagged"
  | "missing-signature";
export type GeotagVerdict = "match" | "border" | "outlier";

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  uid: string;
  role: UserRole;
  name: string;
  title: string;
  email: string;
}

export interface Driver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType: VehicleType;
  licensePlate: string;
  vehicleId: string | null;
  isOnline: boolean;
  lastSeenAt: string;
  photoUrl: string | null;
  backgroundCheckStatus: BackgroundCheckStatus;
  batteryPct: number;
  speedKmh: number;
  headingDeg: number;
  lat: number;
  lng: number;
  stopsDone: number;
  stopsTotal: number;
  currentOrderId: string | null;
}

export interface Vehicle {
  id: string;
  unitCode: string;
  plateNumber: string;
  model: string;
  type: VehicleType;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  mileageKm: number;
  maintenanceStatus: MaintenanceStatus;
  lastServiceAt: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientCompany?: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignedUnit: string | null;
  status: DeliveryStatus;
  blockId: string;
  routeSequence: number;
  estimatedArrival: string | null;
  createdAt: string;
  qrCode: string;
  merchantName: string;
  manifestId: string | null;
  manifestRef: string | null;
  depotStatus: DepotStatus;
  weightKg: number | null;
  fragile: boolean;
}

export interface InboundManifest {
  id: string;
  reference: string;
  merchantName: string;
  receivedAt: string;
  notes?: string;
}

export type OrderSeed = Omit<
  Order,
  | "qrCode"
  | "merchantName"
  | "manifestId"
  | "manifestRef"
  | "depotStatus"
  | "weightKg"
  | "fragile"
>;

export interface PodRecord {
  id: string;
  orderId: string;
  trackingNumber: string;
  recipientName: string;
  address: string;
  driverId: string;
  driverName: string;
  unitCode: string;
  deliveredAt: string;
  photoUrl: string;
  signatureUrl: string | null;
  signerName: string;
  phoneMasked: string;
  lat: number;
  lng: number;
  geotagDeltaM: number;
  geotagVerdict: GeotagVerdict;
  aiVerifiedPct: number;
  sha256: string;
  smsVerified: boolean;
  flagged: boolean;
  missingSignature: boolean;
  photoOnly: boolean;
  notes: string;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  driverName?: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface DashboardKpis {
  deliveriesToday: number;
  activeDrivers: number;
  successRate: number;
  failedDeliveries: number;
  gpsMatchAccuracy: number;
  flaggedDisputes: number;
  auditedPods: number;
}

export interface LivePosition {
  driverId: string;
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  headingDeg: number | null;
  capturedAtMs: number;
}

export interface WarehouseDelivery {
  id: string;
  dropoffAddress: string;
  status: DeliveryStatus;
  customer: { firstName: string; lastName: string };
  block: { id: string; status: BlockStatus };
}

export interface AssignBlockResult {
  blockId: string;
  driverProfileId: string;
  status: "ASSIGNED";
}
