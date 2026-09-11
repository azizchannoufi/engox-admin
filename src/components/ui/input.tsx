import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border border-gray-2 bg-white px-3 text-sm text-ink outline-none placeholder:text-gray-1 focus:border-navy",
        className,
      )}
      {...props}
    />
  );
}
