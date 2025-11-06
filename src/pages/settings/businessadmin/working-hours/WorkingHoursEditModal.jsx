import { useState } from "react";
import { updateBusinessSetting } from "@/api/settings";
import toast from "react-hot-toast";

export default function WorkingHoursEditModal({ open, setOpen, initialHours, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [scheduleType, setScheduleType] = useState("Every week");
  const [startDate, setStartDate] = useState("2025-04-21");
  const [endDate, setEndDate] = useState("2025-04-27");
  const [hours, setHours] = useState(initialHours);

  if (!open) return null;

  // ✅ update directly top-level start/end (no nested slots)
  const handleTimeChange = (day, field, value) => {
    const updated = hours.map((h) =>
      h.day === day ? { ...h, [field]: value } : h
    );
    setHours(updated);
  };

  const toggleClosed = (day) => {
    const updated = hours.map((h) =>
      h.day === day
        ? { ...h, closed: !h.closed, start: h.closed ? h.start : "", end: h.closed ? h.end : "" }
        : h
    );
    setHours(updated);
  };

  const save = async () => {
    try {
      setSaving(true);
      await updateBusinessSetting("working_hours", {
        schedule_type: scheduleType,
        start_date: startDate,
        end_date: endDate,
        hours,
      });
      toast.success("Working hours updated successfully");
      onUpdated(hours);
      setOpen(false);
    } catch (err) {
      console.error("❌ Failed to save working hours:", err);
      toast.error("Failed to update working hours");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Edit Working Hours
        </h2>

        {/* Schedule type & date range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Schedule Type
            </label>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            >
              <option>Every week</option>
              <option>Every 2 weeks</option>
              <option>Every 3 weeks</option>
              <option>Every 4 weeks</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            />
          </div>
        </div>

        {/* Days grid */}
        <div className="space-y-5">
          {hours.map((h) => (
            <div
              key={h.day}
              className="p-4 border border-rose-100 rounded-xl bg-rose-50/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!h.closed}
                    onChange={() => toggleClosed(h.day)}
                    className="accent-[#c98383] w-4 h-4"
                  />
                  <label className="font-medium text-gray-800">{h.day}</label>
                </div>
              </div>

              {!h.closed ? (
                <div className="flex items-center gap-3">
                  <select
                    value={h.start || ""}
                    onChange={(e) =>
                      handleTimeChange(h.day, "start", e.target.value)
                    }
                    className="border border-gray-200 rounded-xl px-3 py-2 flex-1 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                  >
                    {generateTimeOptions()}
                  </select>
                  <span className="text-gray-500">-</span>
                  <select
                    value={h.end || ""}
                    onChange={(e) =>
                      handleTimeChange(h.day, "end", e.target.value)
                    }
                    className="border border-gray-200 rounded-xl px-3 py-2 flex-1 focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                  >
                    {generateTimeOptions()}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-gray-500 ml-6">Closed</p>
              )}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-8 gap-3">
          <button
            onClick={() => setOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#c98383] text-white hover:bg-[#b17272] disabled:opacity-60 transition-all"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Helper to generate 12-hour formatted time options */
function generateTimeOptions() {
  const times = [];
  const periods = ["am", "pm"];
  for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 30) {
      for (const p of periods) {
        times.push(
          `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}${p}`
        );
      }
    }
  }
  return times.map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ));
}
