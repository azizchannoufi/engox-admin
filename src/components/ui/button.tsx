import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-green-1 text-white hover:bg-green-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        navy: "bg-navy text-white hover:bg-navy-700",
        gold: "bg-gold text-navy-800 hover:bg-[#b8921c]",
        outline:
          "border border-gray-2 bg-white text-ink hover:bg-navy-50 hover:border-navy-100",
        ghost: "text-ink hover:bg-navy-50",
        danger: "bg-danger text-white hover:bg-[#c62828]",
        mint: "bg-green-soft text-green-3 border border-[#c8efe4] hover:bg-[#d9f5ee]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-3.5",
        lg: "h-11 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
