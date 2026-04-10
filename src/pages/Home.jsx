import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useDashboardData } from "../hooks/useDashboardData";

function formatShortDate(d) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

function formatTime(d) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

function Badge({ children, tone = "zinc" }) {
  const tones = {
    zinc: "bg-slate-100 text-slate-700 ring-slate-200/80",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
    amber: "bg-amber-50 text-amber-900 ring-amber-200/80",
    rose: "bg-rose-50 text-rose-800 ring-rose-200/80",
    cyan: "bg-cyan-50 text-cyan-900 ring-cyan-200/80",
    violet: "bg-violet-50 text-violet-900 ring-violet-200/80",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${tones[tone] ?? tones.zinc}`}
    >
      {children}
    </span>
  );
}

function Card({ title, right, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">
          {title}
        </h2>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function DonutChart({ data }) {
  const palette = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
    "#f43f5e",
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  const segments = useMemo(() => {
    let acc = 0;
    return data.map((d, i) => {
      const frac = total ? d.value / total : 0;
      const start = acc;
      acc += frac;
      return {
        ...d,
        color: palette[i % palette.length],
        start,
        frac,
      };
    });
  }, [data, total]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
      <div className="mx-auto w-[200px]">
        <svg viewBox="0 0 44 44" className="h-[200px] w-[200px]">
          <circle
            cx="22"
            cy="22"
            r="16"
            fill="transparent"
            stroke="rgb(226 232 240)"
            strokeWidth="6"
          />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx="22"
              cy="22"
              r="16"
              fill="transparent"
              stroke={s.color}
              strokeWidth="6"
              strokeLinecap="butt"
              strokeDasharray={`${(s.frac * 100).toFixed(3)} ${(100 - s.frac * 100).toFixed(3)}`}
              transform={`rotate(${s.start * 360 - 90} 22 22)`}
            />
          ))}
          <circle cx="22" cy="22" r="12" fill="white" />
          <text
            x="22"
            y="21.5"
            textAnchor="middle"
            fontSize="4.2"
            fill="rgb(15 23 42)"
            fontWeight="600"
          >
            {total}
          </text>
          <text
            x="22"
            y="26.5"
            textAnchor="middle"
            fontSize="2.6"
            fill="rgb(100 116 139)"
          >
            leads
          </text>
        </svg>
      </div>
      <div className="space-y-2">
        {segments.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-sm text-slate-800">{s.label}</span>
            </div>
            <span className="text-xs text-slate-500">
              {total ? Math.round((s.value / total) * 100) : 0}% ({s.value})
            </span>
          </div>
        ))}
        {segments.length === 0 && (
          <div className="text-sm text-slate-500">No data yet.</div>
        )}
      </div>
    </div>
  );
}

const Home = () => {
  const { user } = useAdminAuth();
  const { activities, upcomingMeetings, leads, leadSourceCounts, error } =
    useDashboardData();

  const next7Days = useMemo(() => {
    const days = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const meetingsByDay = useMemo(() => {
    const map = new Map();
    for (const m of upcomingMeetings) {
      const d = m.startAtDate;
      if (!d) continue;
      const key = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return map;
  }, [upcomingMeetings]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Welcome{user?.email ? `, ${user.email}` : ""}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Activities, meetings, and lead insights from Firestore. Use the
              nav to manage records.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/leads/create"
              className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              New lead
            </Link>
            <Link
              to="/contacts/create"
              className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              New contact
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {String(error?.message ?? error)}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Card
              title="My Activities"
              right={
                <span className="text-xs font-medium text-slate-500">
                  {activities.length}
                </span>
              }
            >
              <div className="space-y-3">
                {activities.map((a) => {
                  const due = a?.dueAt?.toDate?.() ?? null;
                  const statusTone =
                    a.status === "Done"
                      ? "green"
                      : a.status === "Started"
                        ? "cyan"
                        : a.status === "Planned"
                          ? "violet"
                          : "zinc";
                  const priorityTone =
                    a.priority === "Urgent"
                      ? "rose"
                      : a.priority === "High"
                        ? "amber"
                        : "zinc";
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {a.title ?? "Untitled"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {a.account ?? "—"}
                            {due ? ` • ${formatShortDate(due)}` : ""}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge tone={statusTone}>{a.status ?? "—"}</Badge>
                          <Badge tone={priorityTone}>{a.priority ?? "—"}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activities.length === 0 && (
                  <div className="text-sm text-slate-500">No activities yet.</div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card
              title="Calendar (next 7 days)"
              right={
                <span className="text-xs font-medium text-slate-500">
                  {new Intl.DateTimeFormat(undefined, {
                    month: "long",
                    year: "numeric",
                  }).format(new Date())}
                </span>
              }
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
                {next7Days.map((d) => {
                  const key = new Date(
                    d.getFullYear(),
                    d.getMonth(),
                    d.getDate(),
                  ).getTime();
                  const items = meetingsByDay.get(key) ?? [];
                  const dayLabel = new Intl.DateTimeFormat(undefined, {
                    weekday: "short",
                  }).format(d);
                  return (
                    <div
                      key={key}
                      className="min-h-[120px] rounded-xl border border-slate-100 bg-slate-50/40 p-3"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="text-xs font-semibold text-slate-800">
                          {dayLabel}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {d.getDate()}
                        </div>
                      </div>
                      <div className="mt-2 space-y-2">
                        {items.slice(0, 3).map((m) => {
                          const tone = m.color ?? "violet";
                          const start = m.startAtDate;
                          return (
                            <div
                              key={m.id}
                              className="rounded-lg border border-slate-100 bg-white px-2 py-1.5 shadow-sm"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="truncate text-[11px] font-medium text-slate-900">
                                  {m.title ?? "Meeting"}
                                </div>
                                <Badge tone={tone}>
                                  {start ? formatTime(start) : "—"}
                                </Badge>
                              </div>
                              <div className="mt-0.5 truncate text-[11px] text-slate-500">
                                {m.account ?? "—"}
                              </div>
                            </div>
                          );
                        })}
                        {items.length === 0 && (
                          <div className="text-[11px] text-slate-400">—</div>
                        )}
                        {items.length > 3 && (
                          <div className="text-[11px] text-slate-400">
                            +{items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card
              title="My Leads"
              right={
                <Link
                  to="/leads"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View all
                </Link>
              }
            >
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                {leads.slice(0, 8).map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {l.name ?? "Untitled"}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {l.company ?? "—"} • {l.source ?? "Unknown"}
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <Badge tone="zinc">{l.stage ?? "—"}</Badge>
                      <span className="text-xs font-semibold text-slate-800">
                        ₹{Number(l.value ?? 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No leads yet.{" "}
                    <Link
                      to="/leads/create"
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      Create one
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card title="Opportunities by Lead Source">
              <DonutChart data={leadSourceCounts.slice(0, 7)} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
