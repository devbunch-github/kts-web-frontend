import { useEffect, useState } from "react";
import { fetchClientProfile, updateClientProfile } from "@/api/client";
import toast from "react-hot-toast";

export default function ClientProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const profile = await fetchClientProfile();
        setForm({
          email: profile.email || "",
          password: "",
          confirm_password: "",
        });
      } catch (err) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.email) {
      toast.error("Email is required");
      return;
    }

    if (form.password && form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await updateClientProfile(form);
      toast.success("Profile updated successfully!");

      setForm({ ...form, password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-10 text-gray-500 text-center">Loading profile…</div>;

  return (
    <div className="min-h-screen bg-[#fffaf6]">

      {/* Page Title */}
      <div className="flex items-center gap-2 mb-8">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow">
          <span className="h-2 w-2 rounded-full bg-[#f28c38]"></span>
        </span>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-md border p-8 max-w-4xl">

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Change Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Change Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700"
              placeholder="Enter new password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

        </div>

        {/* Confirm Password */}
        <div className="mt-8">
          <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700"
            placeholder="Re-enter password"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-10">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-12 py-3 bg-[#e28a47] text-white rounded-lg text-lg font-medium hover:bg-[#d07a39] transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

    </div>
  );
}
