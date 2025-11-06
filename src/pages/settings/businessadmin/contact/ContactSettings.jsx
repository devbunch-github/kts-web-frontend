import { useEffect, useState } from "react";
import { getBusinessSetting, updateBusinessSetting } from "@/api/settings";
import toast from "react-hot-toast";

export default function ContactSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    email: "",
    instagram: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getBusinessSetting("contact");
        if (Object.keys(data).length) setForm((p) => ({ ...p, ...data }));
      } catch {
        toast.error("Failed to load contact settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const save = async () => {
    try {
      setSaving(true);
      await updateBusinessSetting("contact", form);
      toast.success("Contact settings updated successfully");
    } catch {
      toast.error("Failed to update contact settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-rose-100/40">
        Loading…
      </div>
    );

  return (
    <div className="bg-[#fff7f7] rounded-2xl p-6 shadow-sm border border-rose-100/40">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Contact Settings
      </h2>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter Phone number"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            />
          </div>
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Instagram Link
          </label>
          <input
            type="text"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            placeholder="www.instagram.com/company123"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start md:justify-end mt-8">
        <button
          onClick={save}
          disabled={saving}
          className="px-8 py-2.5 rounded-xl bg-[#c98383] text-white hover:bg-[#b17272] disabled:opacity-60 transition-all"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
