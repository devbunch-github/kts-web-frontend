import { useState } from "react";

/**
 * AppointmentCancelModal
 * ---------------------------------
 * Step 1 of appointment cancellation flow.
 * Lets user select or write a cancellation reason before confirmation.
 *
 * Props:
 * - open (boolean): controls modal visibility
 * - setOpen (function): function to close modal
 * - onConfirm (function): callback to proceed to confirmation modal
 */
export default function AppointmentCancelModal({ open, setOpen, onConfirm }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  /**
   * 🔹 Handle next step (confirmation)
   */
  const handleNext = () => {
    if (!reason.trim()) {
      alert("Please select or enter a reason for cancellation");
      return;
    }
    // Save reason temporarily to localStorage (shared across modals)
    localStorage.setItem("cancel_reason", reason);
    setOpen(false);
    onConfirm(); // trigger next modal
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Cancel Appointment
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          Please select a reason for cancellation.
        </p>

        {/* Predefined reasons */}
        <div className="space-y-2 mb-4">
          {[
            "Customer no-show",
            "Scheduling conflict",
            "Emergency",
            "Weather issues",
          ].map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={(e) => setReason(e.target.value)}
              />
              {r}
            </label>
          ))}
        </div>

        {/* Custom reason */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Other Reason
          </label>
          <textarea
            value={reason.startsWith("Other:") ? reason.replace("Other:", "") : ""}
            onChange={(e) => setReason("Other: " + e.target.value)}
            placeholder="Write custom reason..."
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500 min-h-[80px]"
          ></textarea>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2 text-sm text-white bg-rose-600 hover:bg-rose-700 rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
