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

function formatDateTime(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export default function Meetings() {
  const { items, isLoading, error } = useCollectionList("meetings", {
    orderByField: "startAt",
    order: "asc",
    max: 100,
  });

  return (
    <ListShell
      title="Meetings"
      subtitle="All meetings stored in Firestore"
      createTo="/meetings/create"
      createLabel="Create meeting"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Name</th>
              <th className="px-5 py-3.5 font-semibold">Account</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Start</th>
              <th className="px-5 py-3.5 font-semibold">End</th>
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
                  No meetings yet.
                </td>
              </tr>
            )}
            {items.map((m) => {
              const start = asDate(m.startAt);
              const end = asDate(m.endAt);
              return (
                <tr key={m.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {m.title ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {m.account ?? m?.parent?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{m.status ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {formatDateTime(start)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {formatDateTime(end)}
                  </td>
                  <td className="px-5 py-3.5">
                    <RowActions
                      collectionName="meetings"
                      id={m.id}
                      label={m.title}
                      editTo={`/meetings/${m.id}/edit`}
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

