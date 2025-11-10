import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getBusinessProfile,
  updateBusinessProfile,
} from "@/api/businessProfile";

export default function BusinessAdminProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    password: "",
    password_confirmation: "",
    image: null,
  });
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBusinessProfile();
        let dob = "";
        if (data?.date_of_birth) {
          // ✅ Fix: Trim SQL-style timestamp to "YYYY-MM-DD"
          dob = data.date_of_birth.split(" ")[0];
        }

        setForm({
          name: data?.name || "",
          email: data?.email || "",
          phone_number: data?.phone_number || "",
          date_of_birth: dob || "",
          password: "",
          password_confirmation: "",
        });
        setPreview(data?.image_url || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.length > 0) {
      setForm({ ...form, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    setSaving(true);
    try {
      const res = await updateBusinessProfile(fd);
      toast.success(res.message);
      setForm({
        ...form,
        password: "",
        password_confirmation: "",
      });
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading profile...
      </div>
    );

  return (
    <div className="bg-[#faf7f7] min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-[#fdf9f9] rounded-2xl shadow-sm border border-rose-100 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
            <i className="fa-regular fa-user text-lg"></i>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* === Basic Info Section === */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:border-rose-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:border-rose-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:border-rose-300"
              />
            </div>
          </div>

          {/* === Change Password Section === */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Change Password
            </label>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:border-rose-300"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:border-rose-300"
                />
              </div>
            </div>
          </div>

          {/* === Image Upload Section === */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <div className="mt-2 border-2 border-dashed border-rose-100 rounded-2xl p-8 text-center bg-white">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto h-28 w-28 rounded-full object-cover mb-3 border border-rose-200"
                />
              ) : (
                <p className="text-xs text-gray-400 mb-3">
                  Drag image to upload or click below
                </p>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="block mx-auto text-xs"
              />
            </div>
          </div>

          {/* === Save Button === */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-12 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
