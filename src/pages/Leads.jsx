import React from "react";
import ListShell from "../components/ListShell";
import { useCollectionList } from "../hooks/useCollectionList";

function formatINR(value) {
  const n = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${n.toLocaleString("en-IN")}`;
  }
}

export default function Leads() {
  const { items, isLoading, error } = useCollectionList("leads", {
    orderByField: "createdAt",
    order: "desc",
    max: 100,
  });

  return (
    <ListShell
      title="Leads"
      subtitle="All leads stored in Firestore"
      createTo="/leads/create"
      createLabel="Create lead"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Name</th>
              <th className="px-5 py-3.5 font-semibold">Account</th>
              <th className="px-5 py-3.5 font-semibold">Source</th>
              <th className="px-5 py-3.5 font-semibold">Stage</th>
              <th className="px-5 py-3.5 text-right font-semibold">Value (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-zinc-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-4 py-4 text-rose-600" colSpan={5}>
                  {String(error?.message ?? error)}
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  No leads yet.
                </td>
              </tr>
            )}
            {items.map((l) => (
              <tr key={l.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {l.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {l.company ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {l.source ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{l.stage ?? "—"}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                  {formatINR(l.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListShell>
  );
}

