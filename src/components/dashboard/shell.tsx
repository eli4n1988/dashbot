"use client";

import { useState } from "react";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  Menu,
  MessageSquareHeart,
  Phone,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SectionId } from "@/lib/types";
import { regionMeta } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import { OverviewSection } from "./overview-section";
import { WorkforceSection } from "./workforce-section";
import { CallsSection } from "./calls-section";
import { TasksSection } from "./tasks-section";
import { QualitySection } from "./quality-section";
import { InquiriesSection } from "./inquiries-section";

const nav: { id: SectionId; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "סקירה", icon: LayoutDashboard },
  { id: "workforce", label: "כוח אדם", icon: Users },
  { id: "calls", label: "שיחות ניהול", icon: Phone },
  { id: "tasks", label: "משימות", icon: ClipboardList },
  { id: "quality", label: "איכות קלינית", icon: Activity },
  { id: "inquiries", label: "פניות ציבור", icon: MessageSquareHeart },
];

export function DashboardShell() {
  const [section, setSection] = useState<SectionId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(true);

  const go = (id: SectionId) => {
    setLoaded(false);
    setMobileOpen(false);
    window.setTimeout(() => {
      setSection(id);
      setLoaded(true);
    }, 120);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,#c5e4e8_0%,transparent_45%),radial-gradient(ellipse_at_90%_10%,#d4e0f0_0%,transparent_40%),radial-gradient(ellipse_at_50%_100%,#e8f0e9_0%,transparent_50%),linear-gradient(165deg,#eef4f6_0%,#f4f7f8_40%,#e9eef2_100%)]" />
        <div className="absolute -start-24 top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl animate-float-slow" />
        <div className="absolute -end-16 top-64 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-0 start-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1440px] gap-0 lg:gap-5 lg:p-5">
        {/* Desktop nav */}
        <aside className="surface-elevated hidden w-64 shrink-0 flex-col rounded-3xl p-4 lg:flex animate-rise">
          <BrandBlock />
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-teal-800 text-white shadow-[0_10px_30px_-12px_rgba(15,118,110,0.7)] translate-y-[-1px]"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900 hover:translate-x-[-2px]",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 transition-transform duration-200",
                      active ? "scale-110" : "group-hover:scale-105",
                    )}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl bg-white/55 p-3 text-xs text-slate-600 ring-1 ring-white/60">
            <p className="font-medium text-slate-800">{regionMeta.director}</p>
            <p className="mt-1">מנהלת רפואית אזורית</p>
            <p className="mt-2 tabular-nums">
              {formatNumber(regionMeta.members)} מבוטחים ·{" "}
              {regionMeta.clinicCount} מרפאות
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="surface-elevated sticky top-0 z-20 flex items-center justify-between gap-3 rounded-none px-4 py-3 lg:static lg:rounded-3xl lg:px-6 lg:py-4 animate-rise">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="פתח תפריט"
              >
                <Menu className="size-5" />
              </Button>
              <div>
                <p className="font-display text-lg font-semibold tracking-tight text-teal-950 md:text-xl">
                  DashBot
                </p>
                <p className="text-xs text-slate-500 md:text-sm">
                  {regionMeta.name}
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-teal-800/8 px-3 py-1 text-xs font-medium text-teal-900 ring-1 ring-teal-800/10">
                דמו מקומי · ללא הזדהות
              </span>
            </div>
          </header>

          <main
            className={cn(
              "flex-1 px-4 py-5 transition-all duration-300 lg:px-0 lg:py-5",
              loaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2",
            )}
          >
            {section === "overview" && <OverviewSection onNavigate={go} />}
            {section === "workforce" && <WorkforceSection />}
            {section === "calls" && <CallsSection />}
            {section === "tasks" && <TasksSection />}
            {section === "quality" && <QualitySection />}
            {section === "inquiries" && <InquiriesSection />}
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            aria-label="סגור תפריט"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 flex w-[82%] max-w-xs flex-col bg-[#f3f7f8] p-4 shadow-2xl animate-slide-in">
            <div className="mb-4 flex items-center justify-between">
              <BrandBlock compact />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="סגור"
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                      active
                        ? "bg-teal-800 text-white"
                        : "text-slate-700 hover:bg-white/80",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandBlock({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-cyan-800 text-white shadow-[0_12px_28px_-10px_rgba(15,118,110,0.65)]">
        <span className="font-display text-lg font-bold">DB</span>
        <span className="absolute -bottom-1 -end-1 size-3 rounded-full bg-cyan-300 ring-2 ring-[#f3f7f8]" />
      </div>
      <div>
        <p className="font-display text-base font-semibold text-teal-950">
          DashBot
        </p>
        {!compact && (
          <p className="text-[11px] text-slate-500">לוח בקרה למנהל רפואי</p>
        )}
      </div>
    </div>
  );
}
