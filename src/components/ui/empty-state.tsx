import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy">
        <Inbox size={22} />
      </div>
      <h3 className="text-sm font-semibold text-navy">{title}</h3>
      <p className="max-w-sm text-sm text-gray-1">{description}</p>
      {action}
    </div>
  );
}
