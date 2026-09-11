import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export function ParcelQr({
  value,
  size = 88,
  label = true,
  className,
}: {
  value: string;
  size?: number;
  label?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-1 rounded-md border border-[#e7ebf0] bg-white p-1.5",
        className,
      )}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={false}
        fgColor="#002366"
        bgColor="#ffffff"
      />
      {label ? (
        <span className="max-w-full truncate font-mono text-[9px] font-semibold tracking-wide text-navy">
          {value}
        </span>
      ) : null}
    </div>
  );
}
