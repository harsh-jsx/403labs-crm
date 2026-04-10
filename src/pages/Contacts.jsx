import React from "react";
import ListShell from "../components/ListShell";
import RowActions from "../components/RowActions";
import { useCollectionList } from "../hooks/useCollectionList";

export default function Contacts() {
  const { items, isLoading, error } = useCollectionList("contacts", {
    orderByField: "createdAt",
    order: "desc",
    max: 100,
  });

  return (
    <ListShell
      title="Contacts"
      subtitle="All contacts stored in Firestore"
      createTo="/contacts/create"
      createLabel="Create contact"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Name</th>
              <th className="px-5 py-3.5 font-semibold">Account</th>
              <th className="px-5 py-3.5 font-semibold">Email</th>
              <th className="px-5 py-3.5 font-semibold">Phone</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
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
                <td className="px-4 py-6 text-slate-500" colSpan={5}>
                  No contacts yet.
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {c.name ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {c.accountName ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {c.email ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {c.mobile ?? c.phone ?? "—"}
                </td>
                <td className="px-5 py-3.5">
                  <RowActions
                    collectionName="contacts"
                    id={c.id}
                    label={c.name}
                    editTo={`/contacts/${c.id}/edit`}
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

