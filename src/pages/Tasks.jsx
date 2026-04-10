import React from "react";
import ListShell from "../components/ListShell";
import RowActions from "../components/RowActions";
import { useCollectionList } from "../hooks/useCollectionList";

function asDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v?.toDate === "function") return v.toDate();
  return null;
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export default function Tasks() {
  const { items, isLoading, error } = useCollectionList("tasks", {
    orderByField: "dueAt",
    order: "asc",
    max: 100,
  });

  return (
    <ListShell
      title="Tasks"
      subtitle="All tasks stored in Firestore"
      createTo="/tasks/create"
      createLabel="Create task"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Name</th>
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
                  No tasks yet.
                </td>
              </tr>
            )}
            {items.map((t) => {
              const due = asDate(t.dueAt);
              return (
                <tr key={t.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {t.name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {t?.parent?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{t.status ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {t.priority ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{formatDate(due)}</td>
                  <td className="px-5 py-3.5">
                    <RowActions
                      collectionName="tasks"
                      id={t.id}
                      label={t.name}
                      editTo={`/tasks/${t.id}/edit`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

