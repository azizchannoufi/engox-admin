import type { CreateOrderDraft } from "@/types/orders";

function looksLikeQr(value: string) {
  return /^(ENX|TRK|DLV|QR|PKG)[-_]/i.test(value) || /^[A-Z]{2,5}-\d{3,}/i.test(value);
}

/** List line: `QR, Name, Address, Neighborhood` — QR is optional and auto-issued. */
export function parseOrderList(raw: string): CreateOrderDraft[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const parts = line
        .split(/[|,;\t]/)
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts[0] && looksLikeQr(parts[0])) {
        return {
          qrCode: parts[0].toUpperCase(),
          recipientName: parts[1] ?? "",
          address: parts[2] ?? "",
          neighborhood: parts[3] || "Queens",
        };
      }

      return {
        recipientName: parts[0] ?? "",
        address: parts[1] ?? "",
        neighborhood: parts[2] || "Queens",
      };
    })
    .filter((draft) => draft.recipientName.length > 0 && draft.address.length > 0);
}
