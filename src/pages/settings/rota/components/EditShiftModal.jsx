import { useState, useEffect } from "react";
import { updateRota } from "@/api/rota";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function EditShiftModal({ open, onClose, shift, onSaved }) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shift) {
      setStartTime(shift.start_time || "");
      setEndTime(shift.end_time || "");
      setNote(shift.note || "");
    }
  }, [shift]);

  if (!open || !shift) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateRota(shift.id, {
        start_time: startTime,
        end_time: endTime,
        note,
      });
      toast.success("Shift updated successfully.");
      onSaved?.();
      onClose();
    } catch {
      toast.error("Failed to update shift.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Edit Shift
        </h3>

        {/* ✅ Show shift date */}
        <div className="mb-4 text-sm">
          <div className="font-medium text-gray-600 mb-1">Date</div>
          <div className="bg-gray-50 border rounded-xl px-3 py-2 text-gray-800">
            {dayjs(shift.shift_date || shift.date).format("dddd, DD MMMM YYYY")}
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="2"
              className="w-full border rounded-xl px-3 py-2 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-2xl bg-[#c98383] text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
