// src/components/TimeOffModal.jsx
import { useEffect, useState } from "react";
import { createTimeOff, listEmployees } from "../api/employee";
import { X } from "lucide-react";

export default function TimeOffModal({ open, onClose, defaultEmployee }) {
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employee_id: defaultEmployee?.id || "",
    date: "",
    start_time: "10:00",
    end_time: "19:00",
    is_repeat: false,
    repeat_until: "",
    note: "",
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await listEmployees({ per_page: 999 });
        setEmployees(data.data ?? data); // resource or plain
      } catch {}
    })();
  }, [open]);

  useEffect(() => {
    if (defaultEmployee?.id) {
      setForm((f) => ({ ...f, employee_id: defaultEmployee.id }));
    }
  }, [defaultEmployee]);

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTimeOff(form);
      onClose(true); // success
    } catch (err) {
      console.error(err);
      onClose(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
      <div className="relative w-[640px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-center w-full text-lg font-semibold text-gray-800">Add time off</h3>
          <button onClick={() => onClose(false)} className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">Employee</label>
              <select
                value={form.employee_id}
                onChange={(e) => change("employee_id", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                required
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => change("date", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div />

            <div>
              <label className="mb-1 block text-sm text-gray-600">Start time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => change("start_time", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">End time</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => change("end_time", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="col-span-2 flex items-center gap-2 pt-2">
              <input
                id="repeat"
                type="checkbox"
                checked={form.is_repeat}
                onChange={(e) => change("is_repeat", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="repeat" className="text-sm text-gray-700">
                Repeat
              </label>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">Repeat until</label>
              <input
                type="date"
                value={form.repeat_until}
                onChange={(e) => change("repeat_until", e.target.value)}
                disabled={!form.is_repeat}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">Note</label>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => change("note", e.target.value)}
                placeholder="Add note (optional)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center rounded-xl bg-rose-400 px-5 font-medium text-white hover:bg-rose-500 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
