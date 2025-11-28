// src/pages/client/ClientRescheduleAppointmentPage.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { rescheduleClientAppointment } from "@/api/client";

const bg = "bg-[#fffaf6]";

export default function ClientRescheduleAppointmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!date || !time) {
      toast.error("Please select date and time.");
      return;
    }

    try {
      setLoading(true);
      await rescheduleClientAppointment(id, { date, time });
      navigate(`/client/appointments/reschedule/${id}/confirmation`);
    } catch (e) {
      console.error(e);
      toast.error("Unable to reschedule appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bg} px-6 py-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-[#f2e4d9] text-[#f28c38]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Reschedule Appointment
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#f2e4d9] px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Appointment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full border border-[#e6ded7] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#f28c38]"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. 24/11/2024"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-xs">
                  <i className="fa-regular fa-calendar" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Appointment Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  className="w-full border border-[#e6ded7] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#f28c38]"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 09:00 am"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-xs">
                  <i className="fa-regular fa-clock" />
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center md:justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="w-full md:w-auto px-16 py-3 rounded-lg bg-[#f28c38] text-white text-sm font-semibold hover:bg-[#e17827] disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
