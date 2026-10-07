"use client";

import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { clinicById, qualityMetrics } from "@/lib/mock-data";
import { SectionHeader, StatChip } from "./workforce-section";
import { StatusPill } from "./status-pill";

export function QualitySection() {
  const [selected, setSelected] = useState(qualityMetrics[0]?.id ?? "");
  const [loading] = useState(false);

  const metric = useMemo(
    () => qualityMetrics.find((m) => m.id === selected) ?? qualityMetrics[0],
    [selected],
  );

  const below = qualityMetrics.filter((m) =>
    m.unit === "ימים" ? m.value > m.target : m.value < m.target,
  ).length;
  const onTrack = qualityMetrics.length - below;

  if (loading) {
    return (
      <div className="space-y-5">
        <SectionHeader title="איכות קלינית" subtitle="טוען מדדים…" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="surface-elevated h-28 animate-pulse rounded-3xl bg-white/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!metric) {
    return (
      <div className="space-y-5">
        <SectionHeader
          title="איכות קלינית"
          subtitle="אין מדדי איכות זמינים כרגע."
        />
      </div>
    );
  }

  const inverted = metric.unit === "ימים";
  const ratio = inverted
    ? Math.min(100, (metric.target / Math.max(metric.value, 1)) * 100)
    : Math.min(100, (metric.value / metric.target) * 100);
  const meeting = inverted
    ? metric.value <= metric.target
    : metric.value >= metric.target;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="איכות קלינית"
        subtitle="מדדי איכות ו־KPI רלוונטיים למנהל רפואי אזורי — כרוניים, מניעה, נגישות ורצף טיפול."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatChip label="מדדים במעקב" value={String(qualityMetrics.length)} />
        <StatChip label="עומדים ביעד" value={String(onTrack)} />
        <StatChip label="מתחת ליעד" value={String(below)} warn />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {qualityMetrics.map((m) => {
          const inv = m.unit === "ימים";
          const ok = inv ? m.value <= m.target : m.value >= m.target;
          const active = m.id === metric.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              className={`surface-interactive rounded-3xl p-4 text-start transition ${
                active ? "ring-2 ring-teal-700/40 shadow-lg" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">{m.category}</p>
                  <p className="mt-1 font-medium text-slate-900">{m.name}</p>
                </div>
                <StatusPill tone={ok ? "done" : "due"}>
                  {ok ? "ביעד" : "פער"}
                </StatusPill>
              </div>
              <div className="mt-4 flex items-end justify-between gap-2">
                <p className="font-display text-3xl font-semibold text-slate-900">
                  {m.value}
                  <span className="ms-1 text-sm font-normal text-slate-500">
                    {m.unit}
                  </span>
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    m.trend >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {m.trend >= 0 ? (
                    <TrendingUp className="size-3.5" />
                  ) : (
                    <TrendingDown className="size-3.5" />
                  )}
                  {m.trend > 0 ? "+" : ""}
                  {m.trend}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                יעד: {m.target}
                {m.unit}
              </p>
            </button>
          );
        })}
      </div>

      <div className="surface-elevated rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold text-teal-950">
              {metric.name}
            </h3>
            <p className="text-sm text-slate-600">
              פירוט לפי מרפאה · יעד אזורי {metric.target}
              {metric.unit}
            </p>
          </div>
          <StatusPill tone={meeting ? "done" : "due"}>
            {meeting ? "עומד ביעד" : "דורש שיפור"}
          </StatusPill>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>התקדמות ליעד</span>
            <span className="tabular-nums">{Math.round(ratio)}%</span>
          </div>
          <Progress value={ratio} className="h-2" />
        </div>
        <ul className="mt-5 space-y-2">
          {[...metric.clinicBreakdown]
            .sort((a, b) =>
              inverted ? b.value - a.value : a.value - b.value,
            )
            .map((row) => {
              const clinic = clinicById(row.clinicId);
              const ok = inverted
                ? row.value <= metric.target
                : row.value >= metric.target;
              const bar = inverted
                ? Math.min(100, (metric.target / Math.max(row.value, 1)) * 100)
                : Math.min(100, (row.value / metric.target) * 100);
              return (
                <li
                  key={row.clinicId}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-white/45 px-3 py-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        {clinic?.name}
                      </p>
                      <p className="text-sm tabular-nums text-slate-700">
                        {row.value}
                        {metric.unit}
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ok ? "bg-teal-600" : "bg-amber-500"
                        }`}
                        style={{ width: `${bar}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
