import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger" | "navy" | "mint";
}) {
  const tones = {
    neutral: "bg-[#f1f3f6] text-[#4b5563] border-[#e5e7eb]",
    success: "bg-green-soft text-green-3 border-[#b7eadc]",
    warning: "bg-[#fff6e5] text-[#9a6b10] border-[#f3e0b3]",
    danger: "bg-[#fdecea] text-danger border-[#f5c6c4]",
    navy: "bg-navy text-white border-navy",
    mint: "bg-white text-green-3 border-[#b7eadc]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
