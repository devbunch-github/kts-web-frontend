import { useState } from "react";

export default function AppointmentCancelModal({ open, setOpen, onConfirm }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleConfirm = () => setStep(2);
  const handleSubmit = async () => {
    if (!reason.trim()) return alert("Please provide a reason for cancellation");

    try {
      setSaving(true);
      // save reason for next modal or backend call
      localStorage.setItem("cancel_reason", reason);
      setOpen(false);
      setStep(1);
      onConfirm();
    } catch (err) {
      console.error("Cancel reason submit failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-lg p-10 animate-fadeIn">
        {/* Step 1: Confirmation */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Are You Sure You Want to Cancel
            </h2>
            <p className="text-gray-900 font-semibold mb-8">
              this appointment?
            </p>

            <div className="flex justify-center gap-5">
              <button
                onClick={() => {
                  setStep(1);
                  setOpen(false);
                }}
                className="w-28 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition"
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                className="w-28 py-2.5 rounded-md bg-[#C47B7B] text-white text-sm font-medium hover:bg-[#b06c6c] transition"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Provide reason */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-lg font-semibold text-gray-900">
                You're About to Cancel This Appointment
              </h2>
              <p className="text-gray-900 font-medium mt-1">
                Please Provide a Reason
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Write your reason here..."
                required
                className="w-full min-h-[120px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-rose-100 focus:border-rose-300"
              ></textarea>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={saving}
                className={`w-32 py-2.5 rounded-md text-white text-sm font-medium transition ${
                  saving
                    ? "bg-rose-300 cursor-not-allowed"
                    : "bg-[#C47B7B] hover:bg-[#b06c6c]"
                }`}
              >
                {saving ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
