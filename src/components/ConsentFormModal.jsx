import React from "react";

export default function ConsentFormModal({ open, setOpen, appointment }) {
  if (!open) return null;

  const url = appointment?.consent?.url;
  const status = appointment?.consent?.status;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[95%] max-w-4xl h-[80vh] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-3 bg-rose-600 text-white">
          <h3 className="text-lg font-semibold">
            {appointment?.customer?.Name || "Consent Form"}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="text-white hover:text-rose-100 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 bg-white overflow-auto">
          {status === "submitted" && url ? (
            <iframe
              src={url}
              title="Consent Form"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {status === "pending"
                ? "Consent form is pending submission."
                : "No consent form available."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
