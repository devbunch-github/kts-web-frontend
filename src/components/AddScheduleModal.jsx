import { useState, useEffect } from "react";

export default function AddScheduleModal({ open, onClose, onSave, defaultDate }) {
  const [form, setForm] = useState({
    date: defaultDate || "",
    start_time: "",
    end_time: "",
    note: "",
  });

  useEffect(() => {
    if (defaultDate) {
      setForm((f) => ({ ...f, date: defaultDate }));
    }
  }, [defaultDate]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={submit}
        className="w-96 rounded-2xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Add Schedule
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Start Time</label>
              <input
                type="time"
                className="input-field"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">End Time</label>
              <input
                type="time"
                className="input-field"
                value={form.end_time}
                onChange={(e) =>
                  setForm({ ...form, end_time: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Note</label>
            <input
              className="input-field"
              placeholder="Optional note"
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-rose-400 px-4 py-2 text-sm text-white hover:bg-rose-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
