import { formatDistanceToNow, format } from "date-fns";
import { it } from "date-fns/locale";

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it });
}

export function formatItDate(date: Date | string, pattern = "d MMM yyyy") {
  return format(new Date(date), pattern, { locale: it });
}
