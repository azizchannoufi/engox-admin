import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  wide?: boolean;
  children: ReactNode;
}

export function Modal({ open, onClose, title, wide, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        className="absolute inset-0 bg-[rgba(0,35,102,0.45)]"
        aria-label="Chiudi finestra"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[min(90vh,100dvh)] w-full overflow-auto rounded-xl bg-white shadow-xl",
          "max-sm:max-h-[100dvh] max-sm:rounded-none",
          wide ? "max-w-4xl" : "max-w-lg",
        )}
      >
        {title ? (
          <div className="flex items-center justify-between gap-3 border-b border-[#eef1f4] px-4 py-3 sm:px-5">
            <h2 className="min-w-0 text-base font-semibold text-navy">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-1 hover:bg-navy-50 hover:text-navy"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
