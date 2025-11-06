import { useState } from "react";
import { saveRegularShifts } from "@/api/rota";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const roseBtn =
  "px-5 py-2.5 rounded-2xl bg-[#c98383] text-white hover:opacity-90 disabled:opacity-50";
const whiteBtn =
  "px-5 py-2.5 rounded-2xl bg-white border hover:bg-gray-50";

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function SetRegularShiftsModal({ employeeId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [every, setEvery] = useState(1);
  const [start, setStart] = useState(dayjs().startOf("week").format("YYYY-MM-DD"));
  const [end, setEnd] = useState(dayjs().endOf("week").format("YYYY-MM-DD"));
  const [days, setDays] = useState(
    DAY_KEYS.map((d) => ({
      day: d,
      enabled: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
        d
      ),
      start_time: "10:00",
      end_time: "19:00",
    }))
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleDay = (i) =>
    setDays((arr) => arr.map((d, idx) => (idx === i ? { ...d, enabled: !d.enabled } : d)));

  const setTime = (i, field, val) =>
    setDays((arr) => arr.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)));

  const submit = async () => {
    if (!employeeId) return toast.error("Select an employee first.");
    try {
      setSaving(true);
      await saveRegularShifts({
        employee_id: Number(employeeId),
        start_date: start,
        end_date: end,
        every_n_weeks: every,
        days,
        note,
      });
      toast.success("Regular shifts saved.");
      setOpen(false);
      onSaved?.();
    } catch {
      toast.error("Failed to save shifts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className={whiteBtn} onClick={() => setOpen(true)}>
        Set regular shifts
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4">Set regular shifts</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Schedule type</label>
                  <select
                    value={every}
                    onChange={(e) => setEvery(Number(e.target.value))}
                    className="w-full rounded-xl border px-3 py-2"
                  >
                    <option value={1}>Every week</option>
                    <option value={2}>Every 2 weeks</option>
                    <option value={3}>Every 3 weeks</option>
                    <option value={4}>Every 4 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Start date</label>
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End date</label>
                  <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                {days.map((d, i) => (
                  <div key={d.day} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={() => toggleDay(i)}
                      className="w-5 h-5 accent-[#c98383]"
                    />
                    <div className="w-32 capitalize">{d.day}</div>
                    <input
                      type="time"
                      value={d.start_time}
                      onChange={(e) => setTime(i, "start_time", e.target.value)}
                      className="rounded-xl border px-3 py-2"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={d.end_time}
                      onChange={(e) => setTime(i, "end_time", e.target.value)}
                      className="rounded-xl border px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm mb-1">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className={whiteBtn} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button disabled={saving} onClick={submit} className={roseBtn}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
