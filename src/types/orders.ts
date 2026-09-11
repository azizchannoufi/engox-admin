import type { Order } from "@/types/domain";

export interface CreateOrderDraft {
  recipientName: string;
  address: string;
  neighborhood?: string;
  qrCode?: string;
  weightKg?: number;
  fragile?: boolean;
  assignedDriverId?: string | null;
}

export interface InboundListPayload {
  merchantName: string;
  manifestRef?: string;
  drafts: CreateOrderDraft[];
}

export interface CreateOrdersResult {
  orders: Order[];
  manifestId: string;
  manifestRef: string;
}

export interface AssignOrdersResult {
  orderIds: string[];
  driverId: string;
  status: "ASSIGNED";
}
