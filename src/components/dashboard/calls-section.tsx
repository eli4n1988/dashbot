"use client";

import { useMemo, useState } from "react";
import { Phone, MapPin } from "lucide-react";
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
  feedbackCalls as seedCalls,
  physicianById,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { CallStatus, FeedbackCall } from "@/lib/types";
import { StatusPill } from "./status-pill";
import { EmptyState, SectionHeader, StatChip } from "./workforce-section";

const statusLabel: Record<CallStatus, string> = {
  overdue: "באיחור",
  due: "קרוב למועד",
  upcoming: "בקרוב",
  done: "הושלם",
};

const statusTone: Record<CallStatus, "overdue" | "due" | "upcoming" | "done"> =
  {
    overdue: "overdue",
    due: "due",
    upcoming: "upcoming",
    done: "done",
  };

export function CallsSection() {
  const [calls, setCalls] = useState<FeedbackCall[]>(seedCalls);
  const [filter, setFilter] = useState<"all" | CallStatus>("all");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list =
      filter === "all" ? calls : calls.filter((c) => c.status === filter);
    const order: Record<CallStatus, number> = {
      overdue: 0,
      due: 1,
      upcoming: 2,
      done: 3,
    };
    return [...list].sort(
      (a, b) => order[a.status] - order[b.status] || a.dueDate.localeCompare(b.dueDate),
    );
  }, [calls, filter]);

  const counts = {
    overdue: calls.filter((c) => c.status === "overdue").length,
    due: calls.filter((c) => c.status === "due").length,
    upcoming: calls.filter((c) => c.status === "upcoming").length,
    done: calls.filter((c) => c.status === "done").length,
  };

  async function completeCall(id: string, mode: "phone" | "in_person") {
    setError(null);
    setSaving(id);
    try {
      await new Promise((r) => setTimeout(r, 450));
      setCalls((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "done",
                mode,
                lastCompletedAt: "2026-10-07",
              }
            : c,
        ),
      );
    } catch {
      setError("לא הצלחנו לשמור את השיחה. נסו שוב.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="מעקב שיחות ניהול"
        subtitle="שיחות משוב פיזיות או טלפוניות: פעם בשנה לרפואה ראשונית (משפחה, ילדים, נשים) ופעם בשנתיים ליועצים."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatChip label="באיחור" value={String(counts.overdue)} warn />
        <StatChip label="קרוב למועד" value={String(counts.due)} />
        <StatChip label="בקרוב" value={String(counts.upcoming)} />
        <StatChip label="הושלמו" value={String(counts.done)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as typeof filter)}
        >
          <SelectTrigger className="w-full bg-white/70 sm:w-56">
            <SelectValue placeholder="סינון לפי סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל השיחות</SelectItem>
            <SelectItem value="overdue">באיחור</SelectItem>
            <SelectItem value="due">קרוב למועד</SelectItem>
            <SelectItem value="upcoming">בקרוב</SelectItem>
            <SelectItem value="done">הושלמו</SelectItem>
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="אין שיחות במסנן שנבחר." />
      ) : (
        <ul className="space-y-3">
          {filtered.map((call) => {
            const physician = physicianById(call.physicianId);
            const clinic = physician
              ? clinicById(physician.clinicId)
              : undefined;
            const busy = saving === call.id;
            return (
              <li
                key={call.id}
                className="surface-elevated rounded-3xl p-4 md:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {physician?.name ?? "רופא לא ידוע"}
                      </p>
                      <StatusPill tone={statusTone[call.status]}>
                        {statusLabel[call.status]}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {physician?.specialty} · {clinic?.name} · כל{" "}
                      {call.cadenceYears === 1 ? "שנה" : "שנתיים"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      יעד: {formatDate(call.dueDate)}
                      {call.lastCompletedAt
                        ? ` · אחרונה: ${formatDate(call.lastCompletedAt)}`
                        : " · טרם בוצעה שיחה"}
                      {call.mode
                        ? ` · ${call.mode === "phone" ? "טלפון" : "פרונטלי"}`
                        : ""}
                    </p>
                  </div>
                  {call.status !== "done" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => completeCall(call.id, "phone")}
                        className="bg-white/70"
                      >
                        <Phone className="size-3.5" />
                        {busy ? "שומר…" : "סימון טלפוני"}
                      </Button>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => completeCall(call.id, "in_person")}
                      >
                        <MapPin className="size-3.5" />
                        {busy ? "שומר…" : "סימון פרונטלי"}
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
