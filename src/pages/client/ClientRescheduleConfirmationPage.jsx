// src/pages/client/ClientRescheduleConfirmationPage.jsx

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

const bg = "bg-[#fffaf6]";

export default function ClientRescheduleConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${bg} px-6 py-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => navigate("/client/appointments")}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-[#f2e4d9] text-[#f28c38]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Reschedule Confirmation
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f2e4d9] px-10 py-16 text-center">
          <div className="mx-auto mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-[#fde5cf] text-[#f28c38]">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
            Your Appointment is Rescheduled
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            Thank you for choosing <span className="text-[#f28c38]">Octane</span>{" "}
            for your grooming needs. We look forward to seeing you!
          </p>

          <div className="mt-10">
            <button
              onClick={() => navigate("/client/appointments")}
              className="px-10 py-3 rounded-lg bg-[#f28c38] text-white text-sm font-semibold hover:bg-[#e17827]"
            >
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
