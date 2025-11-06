import { useState } from "react";
import { saveTimeOff } from "@/api/rota";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const roseBtn =
  "px-5 py-2.5 rounded-2xl bg-[#c98383] text-white hover:opacity-90 disabled:opacity-50";
const whiteBtn =
  "px-5 py-2.5 rounded-2xl bg-white border hover:bg-gray-50";

export default function AddTimeOffModal({ employeeId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("19:00");
  const [repeat, setRepeat] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState(dayjs().format("YYYY-MM-DD"));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!employeeId) return toast.error("Select an employee first.");
    try {
      setSaving(true);
      await saveTimeOff({
        employee_id: Number(employeeId),
        date,
        start_time: start,
        end_time: end,
        repeat,
        repeat_until: repeat ? repeatUntil : null,
        note,
      });
      toast.success("Time off saved.");
      setOpen(false);
      onSaved?.();
    } catch {
      toast.error("Failed to save time off.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className={roseBtn} onClick={() => setOpen(true)}>
        + Add time off
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4">Add time off</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Repeat until</label>
                <input
                  type="date"
                  value={repeatUntil}
                  onChange={(e) => setRepeatUntil(e.target.value)}
                  disabled={!repeat}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Start time</label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End time</label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={repeat}
                  onChange={(e) => setRepeat(e.target.checked)}
                  className="w-5 h-5 accent-[#c98383]"
                />
                <span>Repeat</span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                  rows={3}
                />
              </div>
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
