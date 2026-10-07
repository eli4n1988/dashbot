import { cn } from "@/lib/utils";

const tones = {
  overdue: "bg-rose-500/15 text-rose-800 ring-rose-500/25",
  due: "bg-amber-500/15 text-amber-900 ring-amber-500/25",
  upcoming: "bg-sky-500/12 text-sky-900 ring-sky-500/20",
  done: "bg-emerald-500/15 text-emerald-900 ring-emerald-500/25",
  vacancy: "bg-orange-500/15 text-orange-900 ring-orange-500/25",
  active: "bg-teal-500/12 text-teal-900 ring-teal-500/20",
  muted: "bg-slate-500/10 text-slate-700 ring-slate-500/15",
  thanks: "bg-emerald-500/12 text-emerald-900 ring-emerald-500/20",
  complaint: "bg-rose-500/12 text-rose-800 ring-rose-500/20",
} as const;

export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: keyof typeof tones;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
