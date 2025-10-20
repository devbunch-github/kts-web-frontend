import { useState } from "react";
import { updateAppointment } from "../api/appointment";

/**
 * AppointmentRescheduleModal
 * ---------------------------------
 * Allows a user to update the StartDateTime (and optionally EndDateTime)
 * for an existing appointment. This component is rendered as a modal overlay.
 *
 * Props:
 * - open (boolean): controls modal visibility
 * - setOpen (function): function to close modal
 * - appointment (object): current appointment details
 * - onSaved (function): callback to refresh parent list after successful save
 */
export default function AppointmentRescheduleModal({
  open,
  setOpen,
  appointment,
  onSaved,
}) {
  const [newDateTime, setNewDateTime] = useState(
    appointment?.StartDateTime
      ? new Date(appointment.StartDateTime).toISOString().slice(0, 16)
      : ""
  );
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  /**
   * 🔹 Handle rescheduling submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDateTime) return alert("Please select a new date and time");

    try {
      setSaving(true);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Modal container */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Reschedule Appointment
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Appointment info */}
          <div className="mb-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">Customer:</span>{" "}
              {appointment?.customer?.Name ?? "—"}
            </p>
            <p>
              <span className="font-medium">Service:</span>{" "}
              {appointment?.service?.Name ?? "—"}
            </p>
          </div>

          {/* New date/time input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 text-sm rounded-md text-white ${
                saving
                  ? "bg-rose-300 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
