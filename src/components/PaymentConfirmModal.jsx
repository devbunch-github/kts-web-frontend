import React from "react";
import { CheckCircle2, X } from "lucide-react";

export default function PaymentConfirmModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-[95%] max-w-md p-10 relative text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-[#b77272]/20 flex items-center justify-center">
            <CheckCircle2 className="text-[#b77272]" size={48} />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-lg font-semibold text-gray-900">
          Your Payment is Confirmed
        </h3>
      </div>
    </div>
  );
}
