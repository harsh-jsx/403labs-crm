import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
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

export default function ContactsCreate() {
  const [isSaving, setIsSaving] = useState(false);
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

  const onSave = async () => {
    if (!form.firstName.trim() && !form.lastName.trim()) {
      toast.danger("Please enter a name");
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, "contacts"), {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Contact created");
    } catch (e) {
      toast.danger(e?.message ?? "Failed to create contact");
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const getUsers = async () => {
    const users = await getDocs(collection(db, "users"));
    const usersData = users.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const usersToSet = usersData.filter((user) => user.isAdmin);
    console.log(usersToSet);
    setUsers(usersToSet);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <CrmShell
      title="Contacts • create"
      crumbs={[{ label: "Contacts", to: "/contacts" }, { label: "create" }]}
      onSave={isSaving ? undefined : onSave}
      onCancelTo="/contacts"
    >
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
    </CrmShell>
  );
}
