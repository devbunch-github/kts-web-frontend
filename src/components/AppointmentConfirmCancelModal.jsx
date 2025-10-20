import { useState } from "react";
import { updateAppointment } from "../api/appointment";

/**
 * AppointmentConfirmCancelModal
 * ---------------------------------
 * Step 2 of the cancellation flow.
 * Confirms with the user and triggers cancellation API request.
 *
 * Props:
 * - open (boolean): controls modal visibility
 * - setOpen (function): function to close modal
 * - appointment (object): the selected appointment
 * - onSaved (function): callback after successful cancellation
 */
export default function AppointmentConfirmCancelModal({
  open,
  setOpen,
  appointment,
  onSaved,
}) {
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  // Retrieve reason saved from previous modal
  const reason = localStorage.getItem("cancel_reason") || "No reason provided";

  /**
   * 🔹 Perform cancellation
   */
  const handleConfirm = async () => {
    try {
      setSaving(true);
      await updateAppointment(appointment.Id, {
        ...appointment,
        Status: "Cancelled",
        CancellationDate: new Date().toISOString(),
        Note: reason, // optional field if backend supports it
      });

      // Clear local storage after success
      localStorage.removeItem("cancel_reason");

      if (onSaved) onSaved();
      setOpen(false);
    } catch (err) {
      console.error("Failed to cancel appointment", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Cancellation
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to cancel this appointment?
        </p>

        <div className="bg-gray-50 border rounded-md p-3 mb-4 text-sm text-gray-700">
          <p>
            <span className="font-medium">Customer:</span>{" "}
            {appointment?.customer?.Name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Service:</span>{" "}
            {appointment?.service?.Name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(appointment?.StartDateTime).toLocaleDateString()}{" "}
            {new Date(appointment?.StartDateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            <span className="font-medium">Reason:</span> {reason}
          </p>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Close
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className={`px-5 py-2 text-sm rounded-md text-white ${
              saving
                ? "bg-rose-300 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {saving ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
