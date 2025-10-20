import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";
import {
  createSubscriptionPackage,
  getSubscriptionPlan,
  updateSubscriptionPackage,
} from "../../api/publicApi";

const AddSubscriptionPackage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // if present → edit mode

  const [form, setForm] = useState({
    name: "",
    duration: "monthly",
    price: "",
    features: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error'

  // Prefill if editing
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getSubscriptionPlan(id);
        const p = res?.data || res; // resource or plain
        setForm({
          name: p.name ?? "",
          duration: (p.duration ?? "monthly").toLowerCase(),
          price: p.price_minor ? (p.price_minor / 100).toFixed(2) : "",
          features: Array.isArray(p.features) ? p.features.join(", ") : (p.features ?? ""),
        });
      } catch (e) {
        setMessage({ text: "Failed to load plan for edit.", type: "error" });
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration)
      return setMessage({
        text: "Please fill all required fields.",
        type: "error",
      });

    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = {
        name: form.name,
        duration: form.duration,
        price: parseFloat(form.price.replace(/[^\d.]/g, "")),
        features: form.features,
      };

      if (id) {
        await updateSubscriptionPackage(id, payload);
        setMessage({ text: "Package updated successfully!", type: "success" });
      } else {
        await createSubscriptionPackage(payload);
        setMessage({ text: "Package created successfully!", type: "success" });
      }
      // Delay navigation slightly to show success message
      setTimeout(() => navigate("/admin/subscription"), 1200);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while creating the package.";

      setMessage({
        text: errorMsg,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />
      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 hover:bg-rose-200 transition"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {id ? "Edit Package" : "Add new Package"}
            </h1>
          </div>

          {/* FORM CARD */}
          <div className="p-8 w-full md:w-[90%] lg:w-[80%] mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Package Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter package name"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                {/* Package Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    placeholder="e.g. £6.00"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                    required
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features
                  </label>
                  <textarea
                    name="features"
                    placeholder="Enter features separated by commas"
                    value={form.features}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                  />
                </div>
              </div>
                {/* Message */}
              {message.text && (
                <div
                  className={`mt-6 p-3 rounded-md text-sm font-medium ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}
              {/* Save Button */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-rose-400 hover:bg-rose-500 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? (id ? "Updating..." : "Saving...") : (id ? "Update" : "Save")}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default AddSubscriptionPackage;
