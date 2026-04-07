import React, { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "@heroui/react";
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

export default function TasksCreate() {
  const [isSaving, setIsSaving] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

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

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.danger("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, "tasks"), {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Task created");
    } catch (e) {
      toast.danger(e?.message ?? "Failed to create task");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CrmShell
      title="Tasks • create"
      crumbs={[{ label: "Tasks", to: "/" }, { label: "create" }]}
      onSave={isSaving ? undefined : onSave}
      onCancelTo="/"
    >
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
              <TextArea value={form.description} onChange={set("description")} />
            </Field>
          </FormSection>

          <div className="mt-4">
            <FormSection title="Attachments">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <button
                  type="button"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
                >
                  📎
                </button>
                <button
                  type="button"
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50"
                >
                  📄
                </button>
                <span className="text-xs text-zinc-400">
                  (UI only for now)
                </span>
              </div>
            </FormSection>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4">
            <FormSection title="Assigned User">
              <Field label="Assigned User">
                <Select value={form.assignedUser} onChange={set("assignedUser")}>
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
    </CrmShell>
  );
}

