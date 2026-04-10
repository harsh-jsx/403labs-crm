import React, { useEffect, useMemo, useState } from "react";
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
import {
  Field,
  FieldRow,
  Select,
  TextArea,
  TextInput,
} from "../components/Field";
import { toDateInputValue, toJsDate } from "../lib/firestoreForm";

function mapDocToForm(data) {
  const parent = data.parent ?? {};
  const teams = Array.isArray(data.teams) ? data.teams[0] ?? "" : "";
  const start = toJsDate(data.startAt);
  const due = toJsDate(data.dueAt);
  return {
    name: data.name ?? "",
    parentType: parent.type ?? "Account",
    parentName: parent.name ?? "",
    assignedUser: data.assignedUser ?? "Jack Adams",
    teams,
    status: data.status ?? "Not Started",
    priority: data.priority ?? "Normal",
    dateStart: toDateInputValue(start),
    dateDue: toDateInputValue(due) || "",
    description: data.description ?? "",
  };
}

export default function TasksCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const today = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadState, setLoadState] = useState(isEdit ? "loading" : "ready");
  const [form, setForm] = useState({
    name: "",
    parentType: "Account",
    parentName: "",
    assignedUser: "Jack Adams",
    teams: "",
    status: "Not Started",
    priority: "Normal",
    dateStart: "",
    dateDue: today,
    description: "",
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
        const snap = await getDoc(doc(db, "tasks", id));
        if (cancelled) return;
        if (!snap.exists()) {
          toast.danger("Task not found");
          navigate("/tasks", { replace: true });
          return;
        }
        setForm(mapDocToForm(snap.data()));
        setLoadState("ready");
      } catch (e) {
        if (!cancelled) {
          toast.danger(e?.message ?? "Failed to load task");
          setLoadState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  function buildPayload() {
    return {
      name: form.name.trim(),
      parent: {
        type: form.parentType,
        name: form.parentName.trim() || null,
      },
      assignedUser: form.assignedUser || null,
      teams: form.teams ? [form.teams] : [],
      status: form.status,
      priority: form.priority,
      startAt: form.dateStart ? new Date(form.dateStart) : null,
      dueAt: form.dateDue ? new Date(form.dateDue) : null,
      description: form.description.trim(),
      updatedAt: serverTimestamp(),
    };
  }

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.danger("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateDoc(doc(db, "tasks", id), payload);
        toast.success("Task updated");
      } else {
        await addDoc(collection(db, "tasks"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Task created");
        navigate("/tasks");
      }
    } catch (e) {
      toast.danger(e?.message ?? "Failed to save task");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "tasks", id));
      toast.success("Task deleted");
      navigate("/tasks", { replace: true });
    } catch (e) {
      toast.danger(e?.message ?? "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CrmShell
      title={isEdit ? "Tasks • edit" : "Tasks • create"}
      crumbs={[
        { label: "Tasks", to: "/tasks" },
        { label: isEdit ? "edit" : "create" },
      ]}
      onSave={loadState === "ready" && !isSaving ? onSave : undefined}
      onDelete={isEdit ? onDelete : undefined}
      deleteDisabled={isDeleting || loadState !== "ready"}
      onCancelTo="/tasks"
    >
      {loadState === "loading" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading…
        </div>
      )}
      {loadState === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          Could not load this task.
        </div>
      )}
      {loadState === "ready" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FormSection title="Overview">
              <FieldRow cols={2}>
                <Field label="Name" required>
                  <TextInput value={form.name} onChange={set("name")} />
                </Field>
                <Field label="Parent">
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={form.parentType} onChange={set("parentType")}>
                      <option>Account</option>
                      <option>Contact</option>
                      <option>Lead</option>
                    </Select>
                    <TextInput
                      className="col-span-2"
                      value={form.parentName}
                      onChange={set("parentName")}
                      placeholder="Select"
                    />
                  </div>
                </Field>
              </FieldRow>

              <FieldRow cols={2}>
                <Field label="Status">
                  <Select value={form.status} onChange={set("status")}>
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Deferred</option>
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

              <FieldRow cols={2}>
                <Field label="Date Start">
                  <TextInput
                    type="date"
                    value={form.dateStart}
                    onChange={set("dateStart")}
                  />
                </Field>
                <Field label="Date Due">
                  <TextInput
                    type="date"
                    value={form.dateDue}
                    onChange={set("dateDue")}
                  />
                </Field>
              </FieldRow>

              <Field label="Description">
                <TextArea
                  value={form.description}
                  onChange={set("description")}
                />
              </Field>
            </FormSection>

            <div className="mt-4">
              <FormSection title="Attachments">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                  >
                    📎
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                  >
                    📄
                  </button>
                  <span className="text-xs text-slate-400">(UI only)</span>
                </div>
              </FormSection>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-4">
              <FormSection title="Assigned User">
                <Field label="Assigned User">
                  <Select
                    value={form.assignedUser}
                    onChange={set("assignedUser")}
                  >
                    <option>Jack Adams</option>
                    <option>Harsh</option>
                  </Select>
                </Field>
              </FormSection>
              <FormSection title="Teams">
                <Field label="Teams">
                  <Select value={form.teams} onChange={set("teams")}>
                    <option value="">Select</option>
                    <option>Sales</option>
                    <option>Support</option>
                  </Select>
                </Field>
              </FormSection>
            </div>
          </div>
        </div>
      )}
    </CrmShell>
  );
}
