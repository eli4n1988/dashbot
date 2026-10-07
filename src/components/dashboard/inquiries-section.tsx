"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  clinicById,
  physicianById,
  physicians,
  publicInquiries as seed,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { InquiryStage, PublicInquiry } from "@/lib/types";
import { StatusPill } from "./status-pill";
import { EmptyState, SectionHeader, StatChip } from "./workforce-section";

const STAGES: InquiryStage[] = [
  "התקבלה",
  "הועברה לרופא",
  "הועברה למחוז",
  "מענה בכתב",
  "מענה טלפוני",
  "נסגרה",
];

export function InquiriesSection() {
  const [items, setItems] = useState<PublicInquiry[]>(seed);
  const [typeFilter, setTypeFilter] = useState<"all" | "complaint" | "thanks">(
    "all",
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items
      .filter((i) => (typeFilter === "all" ? true : i.type === typeFilter))
      .sort((a, b) => b.daysOpen - a.daysOpen);
  }, [items, typeFilter]);

  const openComplaints = items.filter(
    (i) => i.type === "complaint" && i.stage !== "נסגרה",
  );
  const slaRisk = openComplaints.filter((i) => i.daysOpen >= 10).length;
  const thanks = items.filter((i) => i.type === "thanks").length;

  const physicianStats = useMemo(() => {
    const map = new Map<
      string,
      { complaints: number; thanks: number; open: number }
    >();
    for (const p of physicians.filter((x) => x.status !== "vacancy")) {
      map.set(p.id, { complaints: 0, thanks: 0, open: 0 });
    }
    for (const i of items) {
      if (!i.physicianId) continue;
      const row = map.get(i.physicianId) ?? {
        complaints: 0,
        thanks: 0,
        open: 0,
      };
      if (i.type === "complaint") {
        row.complaints += 1;
        if (i.stage !== "נסגרה") row.open += 1;
      } else {
        row.thanks += 1;
      }
      map.set(i.physicianId, row);
    }
    return [...map.entries()]
      .map(([id, stats]) => ({
        id,
        name: physicianById(id)?.name ?? id,
        ...stats,
      }))
      .filter((r) => r.complaints + r.thanks > 0)
      .sort((a, b) => b.complaints - a.complaints || b.open - a.open);
  }, [items]);

  async function advance(id: string, stage: InquiryStage) {
    setError(null);
    setBusyId(id);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, stage } : i)),
      );
    } catch {
      setError("עדכון השלב נכשל. נסו שוב.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="פניות ציבור"
        subtitle="מעקב מתקבלת הפנייה → העברה למחוז/רופא → מענה בכתב או טלפוני. יעד SLA: עד שבועיים. כולל מכתבי תודה וסטטיסטיקה לפי רופא."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatChip label="תלונות פתוחות" value={String(openComplaints.length)} />
        <StatChip label="בסיכון SLA (≥10י׳)" value={String(slaRisk)} warn />
        <StatChip label="מכתבי תודה" value={String(thanks)} />
        <StatChip
          label="נסגרו"
          value={String(items.filter((i) => i.stage === "נסגרה").length)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "הכל"],
              ["complaint", "תלונות"],
              ["thanks", "תודות"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTypeFilter(id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                typeFilter === id
                  ? "bg-teal-800 text-white"
                  : "bg-white/70 text-slate-600 ring-1 ring-slate-200/80 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="אין פניות במסנן שנבחר." />
      ) : (
        <ul className="space-y-3">
          {filtered.map((inq) => {
            const clinic = clinicById(inq.clinicId);
            const physician = inq.physicianId
              ? physicianById(inq.physicianId)
              : undefined;
            const risk =
              inq.type === "complaint" &&
              inq.stage !== "נסגרה" &&
              inq.daysOpen >= 10;
            const overdue =
              inq.type === "complaint" &&
              inq.stage !== "נסגרה" &&
              inq.daysOpen > inq.slaDays;
            return (
              <li key={inq.id} className="surface-elevated rounded-3xl p-4 md:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill
                        tone={inq.type === "thanks" ? "thanks" : "complaint"}
                      >
                        {inq.type === "thanks" ? "תודה" : "תלונה"}
                      </StatusPill>
                      {overdue && (
                        <StatusPill tone="overdue">חריגת SLA</StatusPill>
                      )}
                      {!overdue && risk && (
                        <StatusPill tone="due">סיכון SLA</StatusPill>
                      )}
                      <StatusPill tone="muted">{inq.stage}</StatusPill>
                    </div>
                    <p className="mt-2 font-medium text-slate-900">
                      {inq.subject}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {clinic?.name}
                      {physician ? ` · ${physician.name}` : ""} ·{" "}
                      {inq.channel} · התקבל {formatDate(inq.receivedAt)}
                    </p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                        <span>
                          ימים פתוחים: {inq.daysOpen} / {inq.slaDays}
                        </span>
                        <span>
                          {Math.min(
                            100,
                            Math.round((inq.daysOpen / inq.slaDays) * 100),
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className={`h-full rounded-full transition-all ${
                            overdue
                              ? "bg-rose-500"
                              : risk
                                ? "bg-amber-500"
                                : "bg-teal-600"
                          }`}
                          style={{
                            width: `${Math.min(100, (inq.daysOpen / inq.slaDays) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {inq.stage !== "נסגרה" && (
                    <div className="flex w-full flex-col gap-2 sm:w-56">
                      <Select
                        value={inq.stage}
                        onValueChange={(v) =>
                          advance(inq.id, v as InquiryStage)
                        }
                        disabled={busyId === inq.id}
                      >
                        <SelectTrigger className="w-full bg-white/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/70"
                        disabled={busyId === inq.id}
                        onClick={() => advance(inq.id, "נסגרה")}
                      >
                        {busyId === inq.id ? "מעדכן…" : "סגירת פנייה"}
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="surface-elevated rounded-3xl p-5">
        <h3 className="font-display text-lg font-semibold text-teal-950">
          סטטיסטיקה לפי רופא
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          מכתבי תלונה ומכתבי תודה שיוחסו לרופא ספציפי.
        </p>
        {physicianStats.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">אין נתונים להצגה.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 text-start text-xs text-slate-500">
                  <th className="px-2 py-2 font-medium">רופא/ה</th>
                  <th className="px-2 py-2 font-medium">תלונות</th>
                  <th className="px-2 py-2 font-medium">פתוחות</th>
                  <th className="px-2 py-2 font-medium">תודות</th>
                </tr>
              </thead>
              <tbody>
                {physicianStats.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100/80 last:border-0"
                  >
                    <td className="px-2 py-2.5 font-medium text-slate-800">
                      {row.name}
                    </td>
                    <td className="px-2 py-2.5 tabular-nums">{row.complaints}</td>
                    <td className="px-2 py-2.5 tabular-nums">
                      {row.open > 0 ? (
                        <span className="text-amber-800">{row.open}</span>
                      ) : (
                        row.open
                      )}
                    </td>
                    <td className="px-2 py-2.5 tabular-nums text-emerald-800">
                      {row.thanks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
