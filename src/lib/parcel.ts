import type { Order } from "@/types/domain";

export function parcelQr(order: Pick<Order, "qrCode" | "trackingNumber">) {
  return order.qrCode || order.trackingNumber;
}
