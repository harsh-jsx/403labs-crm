import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { toast } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import CrmShell from "../components/CrmShell";
import FormSection from "../components/FormSection";
import { Field, FieldRow, Select, TextInput } from "../components/Field";
import { toDatetimeLocalValue, toJsDate } from "../lib/firestoreForm";

function mapDocToForm(data) {
  const due = toJsDate(data.dueAt);
  return {
    title: data.title ?? "",
    status: data.status ?? "Not Started",
    priority: data.priority ?? "Normal",
    account: data.account ?? "",
    dueAt: toDatetimeLocalValue(due) || "",
  };
}

export default function ActivitiesCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadState, setLoadState] = useState(isEdit ? "loading" : "ready");
  const [form, setForm] = useState({
    title: "",
    status: "Not Started",
    priority: "Normal",
    account: "",
    dueAt: "",
  });

  const set = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    if (!id) {
      setLoadState("ready");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      try {
        const snap = await getDoc(doc(db, "activities", id));
        if (cancelled) return;
        if (!snap.exists()) {
          toast.danger("Activity not found");
          navigate("/activities", { replace: true });
          return;
        }
        setForm(mapDocToForm(snap.data()));
        setLoadState("ready");
      } catch (e) {
        if (!cancelled) {
          toast.danger(e?.message ?? "Failed to load activity");
          setLoadState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const onSave = async () => {
    if (!form.title.trim()) {
      toast.danger("Title is required");
      return;
    }
    const due = form.dueAt ? new Date(form.dueAt) : null;
    if (due && Number.isNaN(due.getTime())) {
      toast.danger("Invalid due date");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        status: form.status,
        priority: form.priority,
        account: form.account.trim() || null,
        dueAt: due,
        updatedAt: serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, "activities", id), payload);
        toast.success("Activity updated");
      } else {
        await addDoc(collection(db, "activities"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Activity created");
        navigate("/activities");
      }
    } catch (e) {
      toast.danger(e?.message ?? "Failed to save activity");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm("Delete this activity? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "activities", id));
      toast.success("Activity deleted");
      navigate("/activities", { replace: true });
    } catch (e) {
      toast.danger(e?.message ?? "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CrmShell
      title={isEdit ? "Activities • edit" : "Activities • create"}
      crumbs={[
        { label: "Activities", to: "/activities" },
        { label: isEdit ? "edit" : "create" },
      ]}
      onSave={loadState === "ready" && !isSaving ? onSave : undefined}
      onDelete={isEdit ? onDelete : undefined}
      deleteDisabled={isDeleting || loadState !== "ready"}
      onCancelTo="/activities"
    >
      {loadState === "loading" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading…
        </div>
      )}
      {loadState === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          Could not load this activity.
        </div>
      )}
      {loadState === "ready" && (
        <FormSection title="Activity">
          <FieldRow cols={2}>
            <Field label="Title" required>
              <TextInput value={form.title} onChange={set("title")} />
            </Field>
            <Field label="Related account / record">
              <TextInput value={form.account} onChange={set("account")} />
            </Field>
          </FieldRow>
          <FieldRow cols={2}>
            <Field label="Status">
              <Select value={form.status} onChange={set("status")}>
                <option>Not Started</option>
                <option>Planned</option>
                <option>Started</option>
                <option>Done</option>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={set("priority")}>
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </Select>
            </Field>
          </FieldRow>
          <Field label="Due">
            <TextInput
              type="datetime-local"
              value={form.dueAt}
              onChange={set("dueAt")}
            />
          </Field>
        </FormSection>
      )}
    </CrmShell>
  );
}
