"use client";

import { useMemo, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialTasks } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { Task, TaskKind, TaskPriority } from "@/lib/types";
import { StatusPill } from "./status-pill";
import { EmptyState, SectionHeader, StatChip } from "./workforce-section";

type Filter = "all" | "open" | "urgent" | "recurring" | "done";

export function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [kind, setKind] = useState<TaskKind>("one_off");
  const [dueDate, setDueDate] = useState("2026-10-15");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "open") return !t.completed;
      if (filter === "urgent") return !t.completed && t.priority === "urgent";
      if (filter === "recurring") return t.kind === "recurring";
      if (filter === "done") return t.completed;
      return true;
    });
  }, [tasks, filter]);

  function toggleComplete(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  async function createTask() {
    setFormError(null);
    if (!title.trim()) {
      setFormError("נא להזין כותרת למשימה.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    const task: Task = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "ללא פירוט נוסף",
      priority,
      kind,
      dueDate,
      completed: false,
      recurrence: kind === "recurring" ? "מותאם אישית" : undefined,
    };
    setTasks((prev) => [task, ...prev]);
    setSubmitting(false);
    setOpen(false);
    setTitle("");
    setDescription("");
    setPriority("normal");
    setKind("one_off");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          title="משימות"
          subtitle="משימות דחופות ומשימות חוזרות (למשל אישור דוחות נוכחות בתחילת כל חודש). יצירה, השלמה וסינון."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            משימה חדשה
          </Button>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>יצירת משימה</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="task-title">כותרת</Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="למשל: אישור דוחות נוכחות"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="task-desc">פירוט</Label>
                <Textarea
                  id="task-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>עדיפות</Label>
                  <div className="flex gap-1">
                    {(
                      [
                        ["urgent", "דחוף"],
                        ["normal", "רגיל"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPriority(id)}
                        className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-medium ${
                          priority === id
                            ? "bg-teal-800 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>סוג</Label>
                  <div className="flex gap-1">
                    {(
                      [
                        ["one_off", "חד־פעמי"],
                        ["recurring", "חוזר"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setKind(id)}
                        className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-medium ${
                          kind === id
                            ? "bg-teal-800 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="task-due">תאריך יעד</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              {formError && (
                <p className="text-sm text-rose-700" role="alert">
                  {formError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                ביטול
              </Button>
              <Button onClick={createTask} disabled={submitting}>
                {submitting ? "יוצר…" : "שמירה"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatChip
          label="פתוחות"
          value={String(tasks.filter((t) => !t.completed).length)}
        />
        <StatChip
          label="דחופות"
          value={String(
            tasks.filter((t) => !t.completed && t.priority === "urgent").length,
          )}
          warn
        />
        <StatChip
          label="חוזרות"
          value={String(tasks.filter((t) => t.kind === "recurring").length)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["all", "הכל"],
            ["open", "פתוחות"],
            ["urgent", "דחופות"],
            ["recurring", "חוזרות"],
            ["done", "הושלמו"],
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

      {filtered.length === 0 ? (
        <EmptyState text="אין משימות במסנן שנבחר. צרו משימה חדשה להתחלה." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((task) => (
            <li
              key={task.id}
              className={`surface-elevated flex gap-3 rounded-3xl p-4 transition ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleComplete(task.id)}
                className="mt-1"
                aria-label={`סמן השלמה: ${task.title}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`font-medium ${
                      task.completed
                        ? "text-slate-500 line-through"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.priority === "urgent" && !task.completed && (
                    <StatusPill tone="overdue">דחוף</StatusPill>
                  )}
                  {task.kind === "recurring" && (
                    <StatusPill tone="muted">
                      <span className="inline-flex items-center gap-1">
                        <RotateCcw className="size-3" />
                        {task.recurrence ?? "חוזר"}
                      </span>
                    </StatusPill>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                <p className="mt-2 text-xs text-slate-400">
                  יעד: {formatDate(task.dueDate)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
