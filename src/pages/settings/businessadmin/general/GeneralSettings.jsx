import { useEffect, useState } from "react";
import { getBusinessSetting, updateBusinessSetting } from "@/api/settings";
import toast from "react-hot-toast";

export default function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    allow_reschedule: false,
    reschedule_time: "24 hours",
    allow_cancellation: false,
    cancellation_time: "24 hours",
    allow_email_reminder: false,
    email_reminder_time: "24 hours",
    allow_review_reminder: false,
    review_reminder_time: "24 hours",
    fiscal_year: "2024-2025",
  });

  useEffect(() => {
    (async () => {
      try {
        const settings = await getBusinessSetting("general");
        console.log("✅ Loaded settings:", settings);

        if (Object.keys(settings).length) {
          setForm((prev) => ({ ...prev, ...settings }));
        } else {
          console.warn("⚠️ No settings data found");
        }
      } catch (err) {
        console.error("❌ Failed to load settings:", err);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const save = async () => {
    try {
      setSaving(true);
      await updateBusinessSetting("general", form);
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update settings");
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

  const hourOptions = ["1 hour", "3 hours", "6 hours", "12 hours", "24 hours"];
  const fiscalYears = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"];

  return (
    <div className="bg-[#fff7f7] rounded-2xl p-6 shadow-sm border border-rose-100/40">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Settings</h2>

      <div className="space-y-5">
        {/* Reschedule */}
        <div className="p-4 bg-white border border-rose-100 rounded-xl relative">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-800">Reschedule</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allow_reschedule"
                checked={!!form.allow_reschedule}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#c98383] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Customer can reschedule appointment up to
          </p>
          <select
            name="reschedule_time"
            value={form.reschedule_time || ""}
            onChange={handleChange}
            className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          >
            {hourOptions.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Cancellation */}
        <div className="p-4 bg-white border border-rose-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-800">Cancellation</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allow_cancellation"
                checked={!!form.allow_cancellation}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#c98383] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Customer can cancel appointment up to
          </p>
          <select
            name="cancellation_time"
            value={form.cancellation_time || ""}
            onChange={handleChange}
            className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          >
            {hourOptions.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Email Reminder */}
        <div className="p-4 bg-white border border-rose-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-800">Email Reminder</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allow_email_reminder"
                checked={!!form.allow_email_reminder}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#c98383] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 mb-2">Select Reminder Time</p>
          <select
            name="email_reminder_time"
            value={form.email_reminder_time || ""}
            onChange={handleChange}
            className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          >
            {hourOptions.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Reviews Reminder */}
        <div className="p-4 bg-white border border-rose-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-800">Reviews Reminder</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allow_review_reminder"
                checked={!!form.allow_review_reminder}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-[#c98383] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Select Reviews Reminder Time
          </p>
          <select
            name="review_reminder_time"
            value={form.review_reminder_time || ""}
            onChange={handleChange}
            className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          >
            {hourOptions.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Fiscal Year */}
        <div className="p-4 bg-white border border-rose-100 rounded-xl">
          <label className="font-medium text-gray-800 block mb-2">
            Select Fiscal Year
          </label>
          <select
            name="fiscal_year"
            value={form.fiscal_year || ""}
            onChange={handleChange}
            className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
          >
            {fiscalYears.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

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
