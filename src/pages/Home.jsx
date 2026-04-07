import React, { useMemo } from "react";
import { Button } from "@heroui/react";
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
    zinc: "bg-white/7 text-zinc-200 ring-white/10",
    green: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20",
    amber: "bg-amber-500/15 text-amber-200 ring-amber-400/20",
    rose: "bg-rose-500/15 text-rose-200 ring-rose-400/20",
    cyan: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/20",
    violet: "bg-violet-500/15 text-violet-200 ring-violet-400/20",
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
    <section className="rounded-2xl border border-white/8 bg-[#0c0c0f]/80 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
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
    "#60A5FA", // blue
    "#34D399", // green
    "#FBBF24", // amber
    "#A78BFA", // violet
    "#F87171", // red
    "#22D3EE", // cyan
    "#FB7185", // rose
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

  // SVG “progress circles” technique: each segment is a circle with dasharray.
  // Rotate by cumulative percentage to place segments around the ring.
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
      <div className="mx-auto w-[200px]">
        <svg viewBox="0 0 44 44" className="h-[200px] w-[200px]">
          <circle
            cx="22"
            cy="22"
            r="16"
            fill="transparent"
            stroke="rgba(255,255,255,0.08)"
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
          <circle
            cx="22"
            cy="22"
            r="12"
            fill="rgba(0,0,0,0.35)"
          />
          <text
            x="22"
            y="21.5"
            textAnchor="middle"
            fontSize="4.2"
            fill="rgba(255,255,255,0.9)"
            fontWeight="600"
          >
            {total}
          </text>
          <text
            x="22"
            y="26.5"
            textAnchor="middle"
            fontSize="2.6"
            fill="rgba(161,161,170,0.9)"
          >
            leads
          </text>
        </svg>
      </div>
      <div className="space-y-2">
        {segments.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/3 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-sm text-zinc-200">{s.label}</span>
            </div>
            <span className="text-xs text-zinc-400">
              {total ? Math.round((s.value / total) * 100) : 0}% ({s.value})
            </span>
          </div>
        ))}
        {segments.length === 0 && (
          <div className="text-sm text-zinc-500">No data yet.</div>
        )}
      </div>
    </div>
  );
}

const Home = () => {
  const { user, signOut } = useAdminAuth();
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
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return map;
  }, [upcomingMeetings]);

  return (
    <div className="min-h-screen bg-[#050506] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Welcome{user?.email ? `, ${user.email}` : ""}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Activities, meetings, and lead insights (live from Firestore).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="flat" color="danger" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {String(error?.message ?? error)}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* left: activities */}
          <div className="lg:col-span-4">
            <Card
              title="My Activities"
              right={<span className="text-xs text-zinc-500">{activities.length}</span>}
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
                      className="rounded-xl bg-white/3 px-4 py-3 ring-1 ring-white/6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-zinc-100">
                            {a.title ?? "Untitled"}
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">
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
                  <div className="text-sm text-zinc-500">No activities yet.</div>
                )}
              </div>
            </Card>
          </div>

          {/* right: calendar */}
          <div className="lg:col-span-8">
            <Card
              title="Calendar (next 7 days)"
              right={
                <span className="text-xs text-zinc-500">
                  {new Intl.DateTimeFormat(undefined, {
                    month: "long",
                    year: "numeric",
                  }).format(new Date())}
                </span>
              }
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
                {next7Days.map((d) => {
                  const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                  const items = meetingsByDay.get(key) ?? [];
                  const dayLabel = new Intl.DateTimeFormat(undefined, {
                    weekday: "short",
                  }).format(d);
                  return (
                    <div
                      key={key}
                      className="min-h-[120px] rounded-xl bg-white/3 p-3 ring-1 ring-white/6"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="text-xs font-semibold text-zinc-200">
                          {dayLabel}
                        </div>
                        <div className="text-[11px] text-zinc-500">
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
                              className="rounded-lg bg-black/25 px-2 py-1.5 ring-1 ring-white/5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="truncate text-[11px] font-medium text-zinc-100">
                                  {m.title ?? "Meeting"}
                                </div>
                                <Badge tone={tone}>{start ? formatTime(start) : "—"}</Badge>
                              </div>
                              <div className="mt-0.5 truncate text-[11px] text-zinc-400">
                                {m.account ?? "—"}
                              </div>
                            </div>
                          );
                        })}
                        {items.length === 0 && (
                          <div className="text-[11px] text-zinc-500">—</div>
                        )}
                        {items.length > 3 && (
                          <div className="text-[11px] text-zinc-500">
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

          {/* bottom left: leads list */}
          <div className="lg:col-span-6">
            <Card
              title="My Leads"
              right={<span className="text-xs text-zinc-500">{leads.length}</span>}
            >
              <div className="divide-y divide-white/6 overflow-hidden rounded-xl ring-1 ring-white/6">
                {leads.slice(0, 8).map((l) => (
                  <div key={l.id} className="flex items-center justify-between bg-white/3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-100">
                        {l.name ?? "Untitled"}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-zinc-400">
                        {l.company ?? "—"} • {l.source ?? "Unknown"}
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <Badge tone="zinc">{l.stage ?? "—"}</Badge>
                      <span className="text-xs font-semibold text-zinc-200">
                        ${Number(l.value ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <div className="bg-white/3 px-4 py-6 text-sm text-zinc-500">
                    No leads yet.
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs text-zinc-500">
                Tip: run <span className="font-mono">npm run seed</span> to generate dummy data.
              </div>
            </Card>
          </div>

          {/* bottom right: lead source pie */}
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
