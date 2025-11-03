import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar } from "lucide-react";
import { fetchBusinessSummary, fetchBusinessEvents } from "@/api/dashboard";

export default function BusinessDashboard() {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchBusinessSummary()
      .then((res) => setSummary(res.data ?? res))
      .catch(() =>
        setSummary({
          current: {
            taxLiability: 0,
            profit: 0,
            revenue: 0,
            expenses: 0,
          },
        })
      );
  }, []);

  const handleDatesSet = async (arg) => {
    const start = arg.startStr?.slice(0, 10);
    const end = arg.endStr?.slice(0, 10);
    const data = await fetchBusinessEvents(start, end);
    setEvents(data);
  };

  // ✅ Format with £ symbol and 2 decimal places
  const formatGBP = (value) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <div className="space-y-6 p-6 bg-[#fff5f5] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-200 text-rose-800">
          <Calendar size={18} />
        </span>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      {/* Summary cards (same design, with £) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 text-center p-4">
          <div className="text-sm text-gray-500 mb-1">Tax & NI</div>
          <div className="text-2xl font-semibold text-gray-900">
            {summary ? formatGBP(summary.current?.taxLiability) : "£0.00"}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-gray-100 text-center p-4">
          <div className="text-sm text-gray-500 mb-1">Current Profit</div>
          <div className="text-2xl font-semibold text-gray-900">
            {summary ? formatGBP(summary.current?.profit) : "£0.00"}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-gray-100 text-center p-4">
          <div className="text-sm text-gray-500 mb-1">Current Income</div>
          <div className="text-2xl font-semibold text-gray-900">
            {summary ? formatGBP(summary.current?.revenue) : "£0.00"}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-gray-100 text-center p-4">
          <div className="text-sm text-gray-500 mb-1">Current Expenses</div>
          <div className="text-2xl font-semibold text-gray-900">
            {summary ? formatGBP(summary.current?.expenses) : "£0.00"}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
          events={events}
          datesSet={handleDatesSet}
          eventDisplay="block"
          dayMaxEventRows={3}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 pt-6">
        Copyright © {new Date().getFullYear()} appt.live. All rights reserved.
      </div>
    </div>
  );
}
