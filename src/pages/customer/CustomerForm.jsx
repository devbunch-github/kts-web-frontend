import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCustomer, getCustomer, updateCustomer } from "../../api/customer";

export default function CustomerForm({ viewOnly = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id) && !viewOnly;

  const [form, setForm] = useState({
    Name: "",
    MobileNumber: "",
    Email: "",
    DateOfBirth: "",
    Note: ""
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (id) {
      setLoading(true);
      getCustomer(id)
        .then((data) => setForm(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    if (viewOnly) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await updateCustomer(id, form);
      else await createCustomer(form);
      navigate("/dashboard/customers");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading customer details...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* ✅ Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Themed Back Button — on the LEFT side of title */}
          <button
            onClick={() => navigate("/dashboard/customers")}
            className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-200 transition text-sm font-medium"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {viewOnly
              ? "View Customer"
              : isEdit
              ? "Edit Customer"
              : "Add Customer"}
          </h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6">
        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium text-sm">Full Name</label>
            <input
              name="Name"
              value={form.Name}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2 disabled:bg-gray-100"
              placeholder="Enter full name"
              required
              disabled={viewOnly}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Mobile Number</label>
            <input
              name="MobileNumber"
              value={form.MobileNumber}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2 disabled:bg-gray-100"
              placeholder="Enter mobile number"
              disabled={viewOnly}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Email</label>
            <input
              name="Email"
              value={form.Email}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2 disabled:bg-gray-100"
              placeholder="Enter email"
              disabled={viewOnly}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Date of Birth</label>
            <input
              type="date"
              name="DateOfBirth"
              value={form.DateOfBirth || ""}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2 disabled:bg-gray-100"
              disabled={viewOnly}
            />
          </div>
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">Note</label>
          <textarea
            name="Note"
            value={form.Note}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2 disabled:bg-gray-100"
            placeholder="E.g. hair colour, lash combo, makeup shades"
            disabled={viewOnly}
          />
        </div>

        {/* Save Button */}
        {!viewOnly && (
          <div className="flex justify-end">
            <button
              disabled={saving}
              type="submit"
              className="bg-rose-600 text-white px-6 py-2 rounded-md hover:bg-rose-700 disabled:opacity-60 transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
