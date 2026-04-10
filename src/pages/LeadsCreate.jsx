import React, { useEffect, useState } from "react";
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

function mapDocToForm(data) {
  const addr = data.address ?? {};
  const teams = Array.isArray(data.teams) ? data.teams[0] ?? "" : data.teams ?? "";
  return {
    name: data.name ?? "",
    accountName: data.company ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    title: data.title ?? "",
    website: data.website ?? "",
    addressStreet: addr.street ?? "",
    addressCity: addr.city ?? "",
    addressState: addr.state ?? "",
    addressPostalCode: addr.postalCode ?? "",
    addressCountry: addr.country ?? "",
    status: data.stage ?? "New",
    source: data.source && data.source !== "Unknown" ? data.source : "",
    opportunityAmount: data.value != null ? String(data.value) : "",
    campaign: data.campaign ?? "",
    industry: data.industry ?? "",
    description: data.description ?? "",
    assignedUser: data.assignedUser ?? "",
    teams: typeof teams === "string" ? teams : "",
  };
}

export default function LeadsCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadState, setLoadState] = useState(isEdit ? "loading" : "ready");
  const [users, setUsers] = useState([]);
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
        const ref = doc(db, "leads", id);
        const snap = await getDoc(ref);
        if (cancelled) return;
        if (!snap.exists()) {
          toast.danger("Lead not found");
          navigate("/leads", { replace: true });
          return;
        }
        setForm(mapDocToForm(snap.data()));
        setLoadState("ready");
      } catch (e) {
        if (!cancelled) {
          toast.danger(e?.message ?? "Failed to load lead");
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
        await updateDoc(doc(db, "leads", id), payload);
        toast.success("Lead updated");
      } else {
        await addDoc(collection(db, "leads"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Lead created");
        navigate("/leads");
      }
    } catch (e) {
      toast.danger(e?.message ?? "Failed to save lead");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    if (
      !window.confirm(
        "Delete this lead? This cannot be undone.",
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "leads", id));
      toast.success("Lead deleted");
      navigate("/leads", { replace: true });
    } catch (e) {
      toast.danger(e?.message ?? "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const shellTitle = isEdit ? "Leads • edit" : "Leads • create";
  const crumbs = [
    { label: "Leads", to: "/leads" },
    { label: isEdit ? "edit" : "create" },
  ];

  return (
    <CrmShell
      title={shellTitle}
      crumbs={crumbs}
      onSave={loadState === "ready" && !isSaving ? onSave : undefined}
      onDelete={isEdit ? onDelete : undefined}
      deleteDisabled={isDeleting || loadState !== "ready"}
      onCancelTo="/leads"
    >
      {loadState === "loading" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading…
        </div>
      )}
      {loadState === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          Could not load this lead.
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
                      <Select value="INR" onChange={() => {}}>
                        <option>INR</option>
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
