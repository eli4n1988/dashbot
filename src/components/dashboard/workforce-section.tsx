"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RECRUIT_STAGES,
  clinicById,
  physicians,
  recruits,
} from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import { StatusPill } from "./status-pill";
import type { PhysicianStatus } from "@/lib/types";

const statusLabel: Record<PhysicianStatus, string> = {
  active: "פעיל",
  part_time: "חלקי",
  on_leave: "בחופשה",
  vacancy: "משרה פנויה",
};

const statusTone: Record<
  PhysicianStatus,
  "active" | "muted" | "due" | "vacancy"
> = {
  active: "active",
  part_time: "muted",
  on_leave: "due",
  vacancy: "vacancy",
};

export function WorkforceSection() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "primary" | "specialty" | "gap">(
    "all",
  );

  const filtered = useMemo(() => {
    return physicians.filter((p) => {
      const clinic = clinicById(p.clinicId);
      const hay = `${p.name} ${p.specialty} ${clinic?.name ?? ""}`.toLowerCase();
      if (query && !hay.includes(query.toLowerCase())) return false;
      if (filter === "primary") return p.careType === "primary";
      if (filter === "specialty") return p.careType === "specialty";
      if (filter === "gap")
        return p.status === "vacancy" || p.status === "on_leave";
      return true;
    });
  }, [query, filter]);

  const gaps = physicians.filter(
    (p) => p.status === "vacancy" || p.status === "on_leave",
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="כוח אדם"
        subtitle="כל הרופאים באזור, פערי שיבוץ, וצינור גיוס עם שלבים ברורים לכל מועמד."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatChip
          label="רופאים פעילים"
          value={String(
            physicians.filter((p) => p.status !== "vacancy").length,
          )}
        />
        <StatChip label="פערי שיבוץ" value={String(gaps.length)} warn />
        <StatChip label="מועמדים בגיוס" value={String(recruits.length)} />
      </div>

      <Tabs defaultValue="roster">
        <TabsList className="bg-white/60">
          <TabsTrigger value="roster">רשימת רופאים</TabsTrigger>
          <TabsTrigger value="gaps">פערים</TabsTrigger>
          <TabsTrigger value="pipeline">צינור גיוס</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש לפי שם, התמחות או מרפאה…"
                className="bg-white/70 ps-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "הכל"],
                  ["primary", "ראשונית"],
                  ["specialty", "יועצים"],
                  ["gap", "פערים"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    filter === id
                      ? "bg-teal-800 text-white"
                      : "bg-white/70 text-slate-600 ring-1 ring-slate-200/80 hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState text="לא נמצאו רופאים התואמים לחיפוש." />
          ) : (
            <div className="surface-elevated overflow-hidden rounded-3xl">
              <div className="hidden grid-cols-[1.4fr_0.8fr_1fr_0.6fr_0.7fr] gap-3 border-b border-slate-200/70 px-4 py-3 text-xs font-medium text-slate-500 md:grid">
                <span>רופא/ה</span>
                <span>התמחות</span>
                <span>מרפאה</span>
                <span>משרה</span>
                <span>סטטוס</span>
              </div>
              <ul className="divide-y divide-slate-200/60">
                {filtered.map((p) => {
                  const clinic = clinicById(p.clinicId);
                  return (
                    <li
                      key={p.id}
                      className="grid gap-2 px-4 py-3 transition hover:bg-white/50 md:grid-cols-[1.4fr_0.8fr_1fr_0.6fr_0.7fr] md:items-center md:gap-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        {p.panelSize ? (
                          <p className="text-xs text-slate-500">
                            פאנל: {formatNumber(p.panelSize)}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-700">{p.specialty}</p>
                      <p className="text-sm text-slate-600">
                        {clinic?.name ?? "—"}
                      </p>
                      <p className="text-sm tabular-nums text-slate-700">
                        {p.fte} משרה
                      </p>
                      <div>
                        <StatusPill tone={statusTone[p.status]}>
                          {statusLabel[p.status]}
                        </StatusPill>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gaps" className="mt-4">
          {gaps.length === 0 ? (
            <EmptyState text="אין פערי שיבוץ כרגע — כל המשרות מאוישות." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {gaps.map((p) => {
                const clinic = clinicById(p.clinicId);
                return (
                  <div
                    key={p.id}
                    className="surface-interactive rounded-3xl p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {p.specialty} · {clinic?.name}
                        </p>
                      </div>
                      <StatusPill tone={statusTone[p.status]}>
                        {statusLabel[p.status]}
                      </StatusPill>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {p.status === "vacancy"
                        ? "נדרש גיוס — בדקו את צינור הגיוס לשלב הנוכחי של המועמדים."
                        : "כיסוי זמני נדרש עד חזרה מחופשה."}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4 space-y-4">
          {recruits.map((r) => {
            const clinic = clinicById(r.targetClinicId);
            return (
              <div key={r.id} className="surface-elevated rounded-3xl p-4 md:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{r.name}</p>
                    <p className="text-sm text-slate-600">
                      {r.specialty} → {clinic?.name}
                    </p>
                  </div>
                  <StatusPill tone="active">{r.stage}</StatusPill>
                </div>
                <ol className="mt-4 flex flex-wrap gap-2">
                  {RECRUIT_STAGES.map((stage, idx) => {
                    const done = idx < r.stageIndex;
                    const current = idx === r.stageIndex;
                    return (
                      <li
                        key={stage}
                        className={`rounded-xl px-2.5 py-1.5 text-[11px] font-medium ring-1 ${
                          current
                            ? "bg-teal-800 text-white ring-teal-800 shadow-md"
                            : done
                              ? "bg-teal-700/10 text-teal-900 ring-teal-700/15"
                              : "bg-white/50 text-slate-400 ring-slate-200/70"
                        }`}
                      >
                        {idx + 1}. {stage}
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-3 text-sm text-slate-600">{r.notes}</p>
                <p className="mt-2 text-xs text-slate-400">
                  אחראי/ת: {r.owner}
                </p>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-teal-950">
        {title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

function StatChip({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="surface-elevated rounded-2xl px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-semibold ${
          warn ? "text-orange-800" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="surface-elevated rounded-3xl px-6 py-12 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

export { SectionHeader, StatChip, EmptyState };
