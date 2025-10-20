import React, { useEffect, useState } from "react";
import {
  createEmployee,
  getEmployee,
  listServices,
  updateEmployee,
} from "../../api/employee";
import { uploadGeneric } from "../../api/common";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Upload } from "lucide-react";
import MultiSelect from "../../components/MultiSelect";
import "../../styles/forms.css";

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayISO = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    title: "",
    phone: "+92",
    email: "",
    image: "",
    start_date: todayISO,
    start_year: new Date().getFullYear(),
    end_date: todayISO,
    end_year: new Date().getFullYear(),
    service_ids: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const svc = await listServices();
        setServices(svc.data ?? svc);

        if (isEdit) {
          const r = await getEmployee(id);
          const e = r.data ?? r;
          setForm({
            ...form,
            name: e.name || "",
            title: e.title || "",
            phone: e.phone || "+92",
            email: e.email || "",
            image: e.image || "",
            start_date: e.start_date || todayISO,
            start_year: e.start_date
                ? new Date(e.start_date).getFullYear()
                : new Date().getFullYear(),
            end_date: e.end_date || todayISO,
            end_year: e.end_date
                ? new Date(e.end_date).getFullYear()
                : new Date().getFullYear(),
            service_ids:
                e.services_full?.map((s) => s.Id) ||
                e.services?.map((s) => s.id || s.Id) ||
                [],
            });

        }
      } catch (err) {
        console.error("Failed to load employee data", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await updateEmployee(id, form);
      else await createEmployee(form);
      navigate("/dashboard/employees");
    } catch (err) {
      console.error(err);
      alert("Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3 py-1.5 text-rose-700"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEdit ? "Edit Employee" : "Add New Employee"}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="rounded-2xl bg-white p-8 shadow-sm space-y-8"
      >
        {/* Profile */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Profile</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Employee Name">
              <input
                className="input-field"
                placeholder="Enter employee name"
                value={form.name}
                onChange={(e) => change("name", e.target.value)}
                required
              />
            </Field>

            <Field label="Title">
              <input
                className="input-field"
                placeholder="Enter title"
                value={form.title}
                onChange={(e) => change("title", e.target.value)}
              />
            </Field>

            <Field label="Phone Number">
              <input
                className="input-field"
                placeholder="+92"
                value={form.phone}
                onChange={(e) => change("phone", e.target.value)}
              />
            </Field>

            <Field label="Email">
              <input
                className="input-field"
                placeholder="Enter email"
                type="email"
                value={form.email}
                onChange={(e) => change("email", e.target.value)}
              />
            </Field>

            <div className="md:col-span-2">
              <Label>Upload Image</Label>
              <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  onClick={() =>
                    document.getElementById("emp-image-input").click()
                  }
                >
                  <Upload size={16} /> Browse
                </button>
                <input
                  id="emp-image-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await uploadGeneric(file, "employees");
                      if (res?.path) change("image", res.path);
                    } catch (err) {
                      console.error(err);
                      alert("Failed to upload image");
                    }
                  }}
                />
                <img
                  src={
                    form.image
                      ? form.image.startsWith("http")
                        ? form.image
                        : `${import.meta.env.VITE_API_BASE_URL}/${form.image}`
                      : "/images/avatar-placeholder.png"
                  }
                  alt="preview"
                  className="absolute right-4 h-20 w-20 rounded-full object-cover border"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Services</h2>
          <Field label="Select Service">
            <MultiSelect
              options={(services || []).map((s) => ({
                id: s.Id,
                name: s.Name,
              }))}
              value={form.service_ids || []}
              onChange={(v) => change("service_ids", v)}
            />
          </Field>
        </section>

        {/* Work Details */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Work Details
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Start Date">
              <input
                type="date"
                className="input-field"
                value={form.start_date}
                onChange={(e) => change("start_date", e.target.value)}
              />
            </Field>
            <Field label="Year">
              <input
                className="input-field"
                value={form.start_year}
                onChange={(e) => change("start_year", e.target.value)}
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                className="input-field"
                value={form.end_date}
                onChange={(e) => change("end_date", e.target.value)}
              />
            </Field>
            <Field label="Year">
              <input
                className="input-field"
                value={form.end_year}
                onChange={(e) => change("end_year", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center rounded-2xl bg-rose-400 px-6 font-medium text-white hover:bg-rose-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Subcomponents */
function Field({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="mb-1 block text-sm text-gray-600 font-medium">
      {children}
    </label>
  );
}
