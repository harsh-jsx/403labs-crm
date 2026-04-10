import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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
  const addr = data.address ?? {};
  const teams = Array.isArray(data.teams)
    ? data.teams[0] ?? ""
    : data.teams ?? "";
  const b = toJsDate(data.birthday);
  return {
    salutation: data.salutation ?? "Mr.",
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    accountName: data.accountName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    mobile: data.mobile ?? "",
    title: data.title ?? "",
    website: data.website ?? "",
    addressStreet: addr.street ?? "",
    addressCity: addr.city ?? "",
    addressState: addr.state ?? "",
    addressPostalCode: addr.postalCode ?? "",
    addressCountry: addr.country ?? "",
    birthday: toDateInputValue(b),
    description: data.description ?? "",
    assignedUser: data.assignedUser ?? "",
    teams: typeof teams === "string" ? teams : "",
  };
}

export default function ContactsCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadState, setLoadState] = useState(isEdit ? "loading" : "ready");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    salutation: "Mr.",
    firstName: "",
    lastName: "",
    accountName: "",
    email: "",
    phone: "",
    mobile: "",
    title: "",
    website: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressPostalCode: "",
    addressCountry: "",
    birthday: "",
    description: "",
    assignedUser: "",
    teams: "",
  });

  const fullName = useMemo(() => {
    return [form.firstName, form.lastName].filter(Boolean).join(" ").trim();
  }, [form.firstName, form.lastName]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.isAdmin);
      if (!cancelled) setUsers(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id) {
      setLoadState("ready");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      try {
        const snap = await getDoc(doc(db, "contacts", id));
        if (cancelled) return;
        if (!snap.exists()) {
          toast.danger("Contact not found");
          navigate("/contacts", { replace: true });
          return;
        }
        setForm(mapDocToForm(snap.data()));
        setLoadState("ready");
      } catch (e) {
        if (!cancelled) {
          toast.danger(e?.message ?? "Failed to load contact");
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
      salutation: form.salutation,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: fullName || "Unnamed",
      accountName: form.accountName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      mobile: form.mobile.trim(),
      title: form.title.trim(),
      website: form.website.trim(),
      address: {
        street: form.addressStreet.trim(),
        city: form.addressCity.trim(),
        state: form.addressState.trim(),
        postalCode: form.addressPostalCode.trim(),
        country: form.addressCountry.trim(),
      },
      birthday: form.birthday ? new Date(form.birthday) : null,
      description: form.description.trim(),
      assignedUser: form.assignedUser || null,
      teams: form.teams ? [form.teams] : [],
      updatedAt: serverTimestamp(),
    };
  }

  const onSave = async () => {
    if (!form.firstName.trim() && !form.lastName.trim()) {
      toast.danger("Please enter a name");
      return;
    }
    setIsSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateDoc(doc(db, "contacts", id), payload);
        toast.success("Contact updated");
      } else {
        await addDoc(collection(db, "contacts"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Contact created");
        navigate("/contacts");
      }
    } catch (e) {
      toast.danger(e?.message ?? "Failed to save contact");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (!window.confirm("Delete this contact? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast.success("Contact deleted");
      navigate("/contacts", { replace: true });
    } catch (e) {
      toast.danger(e?.message ?? "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CrmShell
      title={isEdit ? "Contacts • edit" : "Contacts • create"}
      crumbs={[
        { label: "Contacts", to: "/contacts" },
        { label: isEdit ? "edit" : "create" },
      ]}
      onSave={loadState === "ready" && !isSaving ? onSave : undefined}
      onDelete={isEdit ? onDelete : undefined}
      deleteDisabled={isDeleting || loadState !== "ready"}
      onCancelTo="/contacts"
    >
      {loadState === "loading" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading…
        </div>
      )}
      {loadState === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          Could not load this contact.
        </div>
      )}
      {loadState === "ready" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FormSection title="Overview">
              <FieldRow cols={4}>
                <Field label="Name" required>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={form.salutation} onChange={set("salutation")}>
                      <option>Mr.</option>
                      <option>Ms.</option>
                      <option>Mrs.</option>
                      <option>Dr.</option>
                    </Select>
                    <TextInput
                      value={form.firstName}
                      onChange={set("firstName")}
                      placeholder="First Name"
                    />
                    <TextInput
                      value={form.lastName}
                      onChange={set("lastName")}
                      placeholder="Last Name"
                    />
                  </div>
                </Field>
                <Field label="Accounts">
                  <Select value={form.accountName} onChange={set("accountName")}>
                    <option value="">Select</option>
                    <option>Acme Corp</option>
                    <option>National Lumber</option>
                    <option>Stop & Shop</option>
                  </Select>
                </Field>
              </FieldRow>

              <FieldRow cols={2}>
                <Field label="Email">
                  <TextInput value={form.email} onChange={set("email")} />
                </Field>
                <Field label="Phone">
                  <div className="grid grid-cols-3 gap-2">
                    <Select value="Mobile" onChange={() => {}}>
                      <option>Mobile</option>
                      <option>Work</option>
                      <option>Home</option>
                    </Select>
                    <TextInput
                      className="col-span-2"
                      value={form.mobile}
                      onChange={set("mobile")}
                    />
                  </div>
                </Field>
              </FieldRow>

              <FieldRow cols={2}>
                <Field label="Address">
                  <div className="space-y-2">
                    <TextInput
                      value={form.addressStreet}
                      onChange={set("addressStreet")}
                      placeholder="Street"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <TextInput
                        value={form.addressCity}
                        onChange={set("addressCity")}
                        placeholder="City"
                      />
                      <TextInput
                        value={form.addressState}
                        onChange={set("addressState")}
                        placeholder="State"
                      />
                      <TextInput
                        value={form.addressPostalCode}
                        onChange={set("addressPostalCode")}
                        placeholder="Postal Code"
                      />
                    </div>
                    <TextInput
                      value={form.addressCountry}
                      onChange={set("addressCountry")}
                      placeholder="Country"
                    />
                  </div>
                </Field>
                <div className="space-y-3">
                  <Field label="Title">
                    <TextInput value={form.title} onChange={set("title")} />
                  </Field>
                  <Field label="Website">
                    <TextInput value={form.website} onChange={set("website")} />
                  </Field>
                  <Field label="Birthday">
                    <TextInput
                      type="date"
                      value={form.birthday}
                      onChange={set("birthday")}
                    />
                  </Field>
                </div>
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
              <FormSection title="Assigned User">
                <Field label="Assigned User">
                  <Select
                    value={form.assignedUser}
                    onChange={set("assignedUser")}
                  >
                    <option value="">Select</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
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
