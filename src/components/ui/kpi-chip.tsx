import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KpiChip({
  icon,
  label,
  value,
  hint,
  tone = "mint",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "mint" | "gold" | "navy";
}) {
  const tones = {
    mint: "text-green-3",
    gold: "text-[#b45309]",
    navy: "text-navy",
  };

  return (
    <div className="flex min-w-[168px] items-start gap-2.5 rounded-lg border border-[#e7ebf0] bg-white px-3.5 py-2.5">
      <div className={cn("mt-0.5", tones[tone])}>{icon}</div>
      <div>
        <p className="text-[11px] font-medium text-gray-1">{label}</p>
        <p className={cn("text-lg font-bold leading-tight", tones[tone])}>
          {value}
        </p>
        {hint ? (
          <p className="text-[10px] font-medium text-gray-1">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
