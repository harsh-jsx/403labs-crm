import React from "react";
import ListShell from "../components/ListShell";
import RowActions from "../components/RowActions";
import { useCollectionList } from "../hooks/useCollectionList";
import { toJsDate } from "../lib/firestoreForm";

function formatDue(v) {
  const d = toJsDate(v);
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

export default function Activities() {
  const { items, isLoading, error } = useCollectionList("activities", {
    orderByField: "dueAt",
    order: "desc",
    max: 100,
  });

  return (
    <ListShell
      title="Activities"
      subtitle="Tasks and follow-ups (events on your dashboard)"
      createTo="/activities/create"
      createLabel="Create activity"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Title</th>
              <th className="px-5 py-3.5 font-semibold">Account</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Priority</th>
              <th className="px-5 py-3.5 font-semibold">Due</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-4 text-rose-600" colSpan={6}>
                  {String(error?.message ?? error)}
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>
                  No activities yet.
                </td>
              </tr>
            )}
            {items.map((a) => (
              <tr key={a.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {a.title ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {a.account ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{a.status ?? "—"}</td>
                <td className="px-5 py-3.5 text-slate-600">
                  {a.priority ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {formatDue(a.dueAt)}
                </td>
                <td className="px-5 py-3.5">
                  <RowActions
                    collectionName="activities"
                    id={a.id}
                    label={a.title}
                    editTo={`/activities/${a.id}/edit`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}
