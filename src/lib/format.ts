export function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("he-IL").format(n);
}

export function daysUntil(iso: string) {
  const now = new Date("2026-10-07T12:00:00");
  const target = new Date(iso);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
