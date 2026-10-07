"use client";

import {
  Activity,
  AlertTriangle,
  ClipboardList,
  MessageSquareHeart,
  Phone,
  Users,
} from "lucide-react";
import {
  feedbackCalls,
  physicians,
  publicInquiries,
  qualityMetrics,
  recruits,
  regionMeta,
  initialTasks,
} from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import type { SectionId } from "@/lib/types";

export function OverviewSection({
  onNavigate,
}: {
  onNavigate: (id: SectionId) => void;
}) {
  const vacancies = physicians.filter((p) => p.status === "vacancy").length;
  const overdueCalls = feedbackCalls.filter((c) => c.status === "overdue").length;
  const openUrgent = initialTasks.filter(
    (t) => !t.completed && t.priority === "urgent",
  ).length;
  const slaRisk = publicInquiries.filter(
    (i) => i.type === "complaint" && i.stage !== "נסגרה" && i.daysOpen >= 10,
  ).length;
  const belowTarget = qualityMetrics.filter((m) =>
    m.unit === "ימים" ? m.value > m.target : m.value < m.target,
  ).length;

  const tiles = [
    {
      id: "workforce" as const,
      title: "כוח אדם",
      value: `${physicians.filter((p) => p.status !== "vacancy").length} רופאים`,
      meta: `${vacancies} משרות פנויות · ${recruits.length} בגיוס`,
      icon: Users,
      accent: "from-teal-600/20 to-transparent",
    },
    {
      id: "calls" as const,
      title: "שיחות ניהול",
      value: `${overdueCalls} באיחור`,
      meta: "פעם בשנה לרפואה ראשונית · פעם בשנתיים ליועצים",
      icon: Phone,
      accent: "from-amber-500/20 to-transparent",
    },
    {
      id: "tasks" as const,
      title: "משימות",
      value: `${openUrgent} דחופות`,
      meta: `${initialTasks.filter((t) => !t.completed).length} פתוחות בסך הכל`,
      icon: ClipboardList,
      accent: "from-rose-500/15 to-transparent",
    },
    {
      id: "quality" as const,
      title: "איכות קלינית",
      value: `${belowTarget} מתחת ליעד`,
      meta: `${qualityMetrics.length} מדדים במעקב`,
      icon: Activity,
      accent: "from-sky-500/20 to-transparent",
    },
    {
      id: "inquiries" as const,
      title: "פניות ציבור",
      value: `${slaRisk} בסיכון SLA`,
      meta: "יעד מענה ≤ 14 ימים",
      icon: MessageSquareHeart,
      accent: "from-cyan-500/20 to-transparent",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="surface-elevated relative overflow-hidden rounded-3xl p-6 md:p-8 animate-rise">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-teal-700/10 via-transparent to-cyan-500/5" />
        <div className="relative max-w-2xl">
          <p className="font-display text-3xl font-semibold tracking-tight text-teal-950 md:text-4xl">
            DashBot
          </p>
          <h1 className="mt-2 text-lg font-medium text-slate-700 md:text-xl">
            בוקר טוב, {regionMeta.director}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
            לוח בקרה אזורי לניהול כוח אדם, שיחות משוב, משימות, איכות קלינית
            ופניות ציבור — עבור {formatNumber(regionMeta.members)} מבוטחים ב־
            {regionMeta.clinicCount} מרפאות.
          </p>
          {(overdueCalls > 0 || slaRisk > 0 || vacancies > 0) && (
            <div className="mt-5 inline-flex items-start gap-2 rounded-2xl bg-amber-500/10 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-500/20">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                יש {overdueCalls} שיחות באיחור, {slaRisk} פניות בסיכון SLA, ו־
                {vacancies} משרות פנויות שדורשות תשומת לב היום.
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onNavigate(tile.id)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="surface-interactive group relative overflow-hidden rounded-3xl p-5 text-start animate-rise-stagger"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tile.accent} opacity-80 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{tile.title}</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-slate-900">
                    {tile.value}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {tile.meta}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-2xl bg-white/70 text-teal-800 shadow-sm ring-1 ring-white/80 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <Icon className="size-4" />
                </span>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
