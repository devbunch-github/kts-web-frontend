import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSmsPackage,
  updateSmsPackage,
  getSmsPackageById,
} from "../../api/publicApi";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";

const AddSmsPackagePage = () => {
  const nav = useNavigate();
  const { id } = useParams(); // if present → edit mode

  const [form, setForm] = useState({
    name: "",
    total_sms: "",
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isEditMode = Boolean(id);

    // If editing, fetch existing data
  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          const res = await getSmsPackageById(id);
          if (res.success && res.data) {
            setForm({
              name: res.data.name || "",
              total_sms: res.data.total_sms || "",
              price: res.data.price || "",
              description: res.data.description || "",
            });
          }
        } catch (err) {
          console.error("Error fetching package", err);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      let res;
      if (isEditMode) {
        res = await updateSmsPackage(id, form);
      } else {
        res = await createSmsPackage(form);
      }

      if (res.success) {
        setMessage(
          isEditMode
            ? "Package updated successfully!"
            : "Package added successfully!"
        );
        setTimeout(() => nav("/admin/sms-packages"), 1500);
      }
    } catch (err) {
      console.error("Error saving package", err);
      setMessage("Something went wrong, please try again.");
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
          {/* Heading */}
          <div className="flex items-center gap-2 mb-10">
            <button
              onClick={() => nav(-1)}
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
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {isEditMode ? "Edit Package" : "Add new Package"}
            </h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-transparent p-4 w-full max-w-3xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Package Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter package name"
                  required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-rose-300 outline-none"
                />
              </div>

              {/* Number of SMS */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Number of SMS
                </label>
                <input
                  type="number"
                  name="total_sms"
                  value={form.total_sms}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-rose-300 outline-none"
                />
              </div>

              {/* Package Price */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Package Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. £100.00"
                  required
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-rose-300 outline-none"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter package details"
                  rows={3}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-rose-300 outline-none resize-none"
                />
              </div>
            </div>

            {message && (
              <p className="text-sm text-green-600 font-medium">{message}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="mt-2 px-6 py-2 text-sm bg-[#c57a7a] text-white rounded-md hover:bg-[#b46868] transition"
              >
                {loading
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Save"}
              </button>
            </div>
          </form>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default AddSmsPackagePage;
