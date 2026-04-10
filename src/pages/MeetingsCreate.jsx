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
import { toDatetimeLocalValue, toJsDate } from "../lib/firestoreForm";

function mapDocToForm(data) {
  const parent = data.parent ?? {};
  const start = toJsDate(data.startAt);
  const end = toJsDate(data.endAt);
  const teams = Array.isArray(data.teams) ? data.teams[0] ?? "" : "";
  return {
    name: data.title ?? "",
    parentType: parent.type ?? "Account",
    parentName: parent.name ?? data.account ?? "",
    status: data.status ?? "Planned",
    startAt: toDatetimeLocalValue(start) || "",
    endAt: toDatetimeLocalValue(end) || "",
    duration: data.duration ?? "1h",
    description: data.description ?? "",
    assignedUser: data.assignedUser ?? "",
    teams,
    attendees: Array.isArray(data.attendees) ? data.attendees[0] ?? "" : "",
    users: Array.isArray(data.users) ? data.users[0] ?? "" : "",
    contacts: Array.isArray(data.contacts) ? data.contacts[0] ?? "" : "",
    leads: Array.isArray(data.leads) ? data.leads[0] ?? "" : "",
  };
}

export default function MeetingsCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const now = useMemo(() => new Date(), []);
  const later = useMemo(() => new Date(now.getTime() + 60 * 60 * 1000), [now]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadState, setLoadState] = useState(isEdit ? "loading" : "ready");
  const [form, setForm] = useState({
    name: "",
    parentType: "Account",
    parentName: "",
    status: "Planned",
    startAt: toDatetimeLocalValue(now),
    endAt: toDatetimeLocalValue(later),
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

  useEffect(() => {
    if (!id) {
      setLoadState("ready");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      try {
        const snap = await getDoc(doc(db, "meetings", id));
        if (cancelled) return;
        if (!snap.exists()) {
          toast.danger("Meeting not found");
          navigate("/meetings", { replace: true });
          return;
        }
        setForm(mapDocToForm(snap.data()));
        setLoadState("ready");
      } catch (e) {
        if (!cancelled) {
          toast.danger(e?.message ?? "Failed to load meeting");
          setLoadState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  function buildPayload() {
    const start = form.startAt ? new Date(form.startAt) : null;
    const end = form.endAt ? new Date(form.endAt) : null;
    return {
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
      color: "violet",
      account: form.parentName.trim() || null,
      updatedAt: serverTimestamp(),
    };
  }

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.danger("Name is required");
      return;
    }
    const start = form.startAt ? new Date(form.startAt) : null;
    const end = form.endAt ? new Date(form.endAt) : null;
    if (
      !start ||
      !end ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      toast.danger("Please select valid start/end dates");
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateDoc(doc(db, "meetings", id), payload);
        toast.success("Meeting updated");
      } else {
        await addDoc(collection(db, "meetings"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Meeting created");
        navigate("/meetings");
      }
    } catch (e) {
      toast.danger(e?.message ?? "Failed to save meeting");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm("Delete this meeting? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "meetings", id));
      toast.success("Meeting deleted");
      navigate("/meetings", { replace: true });
    } catch (e) {
      toast.danger(e?.message ?? "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CrmShell
      title={isEdit ? "Meetings • edit" : "Meetings • create"}
      crumbs={[
        { label: "Meetings", to: "/meetings" },
        { label: isEdit ? "edit" : "create" },
      ]}
      onSave={loadState === "ready" && !isSaving ? onSave : undefined}
      onDelete={isEdit ? onDelete : undefined}
      deleteDisabled={isDeleting || loadState !== "ready"}
      onCancelTo="/meetings"
    >
      {loadState === "loading" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading…
        </div>
      )}
      {loadState === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          Could not load this meeting.
        </div>
      )}
      {loadState === "ready" && (
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
                  <Select
                    value={form.assignedUser}
                    onChange={set("assignedUser")}
                  >
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
                  <TextInput placeholder="+" value="" readOnly onChange={() => {}} />
                </Field>
              </FieldRow>

              <Field label="Description">
                <TextArea
                  value={form.description}
                  onChange={set("description")}
                />
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
      )}
    </CrmShell>
  );
}
