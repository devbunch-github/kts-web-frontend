import React from "react";

const ConfirmModal = ({ open, title, onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6">
        <div className="text-center">
          <h3 className="text-[18px] font-semibold text-gray-900">
            {title || "Are you sure you want to delete this package?"}
          </h3>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-rose-300 text-rose-600 bg-white hover:bg-rose-50 transition"
            disabled={loading}
          >
            No
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-rose-400 hover:bg-rose-500 text-white transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait…" : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
