import React from "react";
import { Link } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { toast } from "@heroui/react";
import { db } from "../firebase";

export default function RowActions({
  collectionName,
  id,
  label,
  editTo,
}) {
  const onDelete = async () => {
    const name = label?.trim() || "this record";
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("Deleted");
    } catch (e) {
      toast.danger(e?.message ?? "Delete failed");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        to={editTo}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
      >
        Delete
      </button>
    </div>
  );
}
