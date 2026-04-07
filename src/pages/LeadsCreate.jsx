import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "@heroui/react";
import { db } from "../firebase";
import CrmShell from "../components/CrmShell";
import FormSection from "../components/FormSection";
import { Field, FieldRow, Select, TextArea, TextInput } from "../components/Field";

export default function LeadsCreate() {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    accountName: "",
    email: "",
    phone: "",
    title: "",
    website: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressPostalCode: "",
    addressCountry: "",
    status: "New",
    source: "",
    opportunityAmount: "",
    campaign: "",
    industry: "",
    description: "",
    assignedUser: "",
    teams: "",
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
      await addDoc(collection(db, "leads"), {
        name: form.name.trim(),
        company: form.accountName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        title: form.title.trim(),
        website: form.website.trim(),
        address: {
          street: form.addressStreet.trim(),
          city: form.addressCity.trim(),
          state: form.addressState.trim(),
          postalCode: form.addressPostalCode.trim(),
          country: form.addressCountry.trim(),
        },
        stage: form.status,
        source: form.source || "Unknown",
        value: form.opportunityAmount ? Number(form.opportunityAmount) : 0,
        campaign: form.campaign || null,
        industry: form.industry || null,
        description: form.description.trim(),
        assignedUser: form.assignedUser || null,
        teams: form.teams ? [form.teams] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Lead created");
    } catch (e) {
      toast.danger(e?.message ?? "Failed to create lead");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CrmShell
      title="Leads • create"
      crumbs={[{ label: "Leads", to: "/" }, { label: "create" }]}
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
              <Field label="Account Name">
                <TextInput
                  value={form.accountName}
                  onChange={set("accountName")}
                />
              </Field>
            </FieldRow>

            <FieldRow cols={2}>
              <Field label="Email">
                <TextInput value={form.email} onChange={set("email")} />
              </Field>
              <Field label="Phone">
                <TextInput value={form.phone} onChange={set("phone")} />
              </Field>
            </FieldRow>

            <FieldRow cols={2}>
              <Field label="Title">
                <TextInput value={form.title} onChange={set("title")} />
              </Field>
              <Field label="Website">
                <TextInput value={form.website} onChange={set("website")} />
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
                <Field label="Status">
                  <Select value={form.status} onChange={set("status")}>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                    <option>Proposal</option>
                    <option>Won</option>
                    <option>Lost</option>
                  </Select>
                </Field>
                <Field label="Source">
                  <Select value={form.source} onChange={set("source")}>
                    <option value="">Select</option>
                    <option>Call</option>
                    <option>Partner</option>
                    <option>Campaign</option>
                    <option>Email</option>
                    <option>Public Relations</option>
                    <option>Web Site</option>
                    <option>Existing Customer</option>
                  </Select>
                </Field>
              </div>
            </FieldRow>
          </FormSection>

          <div className="mt-4">
            <FormSection title="Details">
              <FieldRow cols={2}>
                <Field label="Opportunity Amount">
                  <div className="grid grid-cols-3 gap-2">
                    <TextInput
                      className="col-span-2"
                      type="number"
                      value={form.opportunityAmount}
                      onChange={set("opportunityAmount")}
                      placeholder="0"
                    />
                    <Select value="USD" onChange={() => {}}>
                      <option>USD</option>
                    </Select>
                  </div>
                </Field>
                <Field label="Campaign">
                  <Select value={form.campaign} onChange={set("campaign")}>
                    <option value="">Select</option>
                    <option>Q2 Launch</option>
                    <option>Spring Promo</option>
                  </Select>
                </Field>
              </FieldRow>

              <FieldRow cols={2}>
                <Field label="Industry">
                  <Select value={form.industry} onChange={set("industry")}>
                    <option value="">Select</option>
                    <option>Retail</option>
                    <option>Manufacturing</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                  </Select>
                </Field>
                <div />
              </FieldRow>

              <Field label="Description">
                <TextArea
                  value={form.description}
                  onChange={set("description")}
                />
              </Field>
            </FormSection>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="space-y-4">
            <FormSection title="Assigned User">
              <Field label="Assigned User">
                <Select value={form.assignedUser} onChange={set("assignedUser")}>
                  <option value="">Select</option>
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

