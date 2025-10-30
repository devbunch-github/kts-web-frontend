import { useState } from "react";
import { updateAppointment } from "../api/appointment";

export default function AppointmentRescheduleModal({
  open,
  setOpen,
  appointment,
  onSaved,
}) {
  const initial = appointment?.StartDateTime
    ? new Date(appointment.StartDateTime)
    : null;

  const [date, setDate] = useState(initial ? initial.toISOString().slice(0, 10) : "");
  const [time, setTime] = useState(initial ? initial.toTimeString().slice(0, 5) : "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time)
      return alert("Please select both date and time for appointment.");

    try {
      setSaving(true);
      const newDateTime = new Date(`${date}T${time}`).toISOString();

      await updateAppointment(appointment.Id, {
        ...appointment,
        StartDateTime: newDateTime,
      });

      if (onSaved) onSaved();
      setOpen(false);
    } catch (err) {
      console.error("Failed to reschedule", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal container */}
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-2xl p-10 animate-fadeIn">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-10">
          Reschedule Appointment
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Appointment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-[46px] border border-gray-300 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-rose-200 focus:border-rose-300 transition"
                placeholder="e.g. 24/11/2024"
              />
            </div>

            {/* Appointment Time */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Appointment Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full h-[46px] border border-gray-300 rounded-md px-4 text-sm placeholder-gray-400 focus:ring-rose-200 focus:border-rose-300 transition"
                placeholder="e.g. 09:00 am"
              />
            </div>
          </div>

          {/* Centered Save button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={saving}
              className={`w-40 py-3 rounded-md text-white font-medium text-sm transition ${
                saving
                  ? "bg-rose-300 cursor-not-allowed"
                  : "bg-[#C47B7B] hover:bg-[#b06c6c]"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
