import React, { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "@heroui/react";
import { db } from "../firebase";
import CrmShell from "../components/CrmShell";
import FormSection from "../components/FormSection";
import { Field, FieldRow, Select, TextArea, TextInput } from "../components/Field";

function toLocalInputValue(d) {
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MeetingsCreate() {
  const [isSaving, setIsSaving] = useState(false);
  const now = useMemo(() => new Date(), []);
  const later = useMemo(() => new Date(now.getTime() + 60 * 60 * 1000), [now]);

  const [form, setForm] = useState({
    name: "",
    parentType: "Account",
    parentName: "",
    status: "Planned",
    startAt: toLocalInputValue(now),
    endAt: toLocalInputValue(later),
    duration: "1h",
    description: "",
    assignedUser: "Jack Adams",
    teams: "",
    attendees: "",
    users: "",
    contacts: "",
    leads: "",
  });

  const set = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.danger("Name is required");
      return;
    }
    const start = form.startAt ? new Date(form.startAt) : null;
    const end = form.endAt ? new Date(form.endAt) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.danger("Please select valid start/end dates");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "meetings"), {
        title: form.name.trim(),
        parent: {
          type: form.parentType,
          name: form.parentName.trim() || null,
        },
        status: form.status,
        startAt: start,
        endAt: end,
        duration: form.duration,
        description: form.description.trim(),
        assignedUser: form.assignedUser || null,
        teams: form.teams ? [form.teams] : [],
        attendees: form.attendees ? [form.attendees] : [],
        users: form.users ? [form.users] : [],
        contacts: form.contacts ? [form.contacts] : [],
        leads: form.leads ? [form.leads] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        color: "violet",
        account: form.parentName.trim() || null,
      });
      toast.success("Meeting created");
    } catch (e) {
      toast.danger(e?.message ?? "Failed to create meeting");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CrmShell
      title="Meetings • create"
      crumbs={[{ label: "Meetings", to: "/meetings" }, { label: "create" }]}
      onSave={isSaving ? undefined : onSave}
      onCancelTo="/meetings"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <FormSection title="Overview">
            <Field label="Name" required>
              <TextInput value={form.name} onChange={set("name")} />
            </Field>

            <FieldRow cols={2}>
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
              <Field label="Assigned User">
                <Select value={form.assignedUser} onChange={set("assignedUser")}>
                  <option>Jack Adams</option>
                  <option>Harsh</option>
                </Select>
              </Field>
            </FieldRow>

            <FieldRow cols={2}>
              <Field label="Status">
                <Select value={form.status} onChange={set("status")}>
                  <option>Planned</option>
                  <option>Held</option>
                  <option>Not Held</option>
                </Select>
              </Field>
              <Field label="Teams">
                <Select value={form.teams} onChange={set("teams")}>
                  <option value="">Select</option>
                  <option>Sales</option>
                  <option>Support</option>
                </Select>
              </Field>
            </FieldRow>

            <FieldRow cols={2}>
              <Field label="Date Start" required>
                <TextInput
                  type="datetime-local"
                  value={form.startAt}
                  onChange={set("startAt")}
                />
              </Field>
              <Field label="Date End" required>
                <TextInput
                  type="datetime-local"
                  value={form.endAt}
                  onChange={set("endAt")}
                />
              </Field>
            </FieldRow>

            <FieldRow cols={2}>
              <Field label="Duration">
                <Select value={form.duration} onChange={set("duration")}>
                  <option value="30m">30m</option>
                  <option value="1h">1h</option>
                  <option value="2h">2h</option>
                </Select>
              </Field>
              <Field label="Reminders">
                <TextInput placeholder="+" value="" onChange={() => {}} />
              </Field>
            </FieldRow>

            <Field label="Description">
              <TextArea value={form.description} onChange={set("description")} />
            </Field>
          </FormSection>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4">
            <FormSection title="Attendees">
              <Field label="Attendees">
                <Select value={form.attendees} onChange={set("attendees")}>
                  <option value="">Select</option>
                  <option>Jack Adams</option>
                  <option>Sales Team</option>
                </Select>
              </Field>
              <Field label="Users">
                <Select value={form.users} onChange={set("users")}>
                  <option value="">Select</option>
                  <option>Jack Adams</option>
                  <option>Harsh</option>
                </Select>
              </Field>
              <Field label="Contacts">
                <Select value={form.contacts} onChange={set("contacts")}>
                  <option value="">Select</option>
                  <option>Lead 1</option>
                  <option>Lead 2</option>
                </Select>
              </Field>
              <Field label="Leads">
                <Select value={form.leads} onChange={set("leads")}>
                  <option value="">Select</option>
                  <option>Lead 1</option>
                  <option>Lead 2</option>
                </Select>
              </Field>
            </FormSection>
          </div>
        </div>
      </div>
    </CrmShell>
  );
}

