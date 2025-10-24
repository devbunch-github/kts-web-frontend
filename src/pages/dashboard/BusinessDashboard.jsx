import { useEffect, useMemo, useRef, useState } from "react";
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
  const [viewTitle, setViewTitle] = useState("Dashboard");

  useEffect(() => {
    fetchBusinessSummary()
      .then(setSummary)
      .catch(() =>
        setSummary({
          tax_and_ni: 0,
          current_profit: 0,
          current_income: 0,
          current_expenses: 0,
        })
      );
  }, []);

  const handleDatesSet = async (arg) => {
    const start = arg.startStr?.slice(0, 10);
    const end = arg.endStr?.slice(0, 10);
    const data = await fetchBusinessEvents(start, end);
    setEvents(data);
  };

  const handleDateClick = (info) => {
    const calendarApi = info.view.calendar;
    calendarApi.changeView("timeGridDay", info.dateStr);
    setViewTitle("Day View");
  };

  const handleBackToMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView("dayGridMonth");
    setViewTitle("Dashboard");
  };

  const metrics = useMemo(
    () => [
      { label: "Tax & NI", key: "tax_and_ni" },
      { label: "Current Profit", key: "current_profit" },
      { label: "Current Income", key: "current_income" },
      { label: "Current Expenses", key: "current_expenses" },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6 bg-rose-50/40 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2">
        {viewTitle !== "Dashboard" && (
          <button
            onClick={handleBackToMonth}
            className="bg-rose-200 text-rose-700 rounded-xl p-2 hover:bg-rose-300 transition"
          >
            &lt;
          </button>
        )}
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-200 text-rose-800">
          <Calendar size={18} />
        </span>
        <h1 className="text-2xl font-semibold text-gray-800">
          {viewTitle}
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.key}
            className="rounded-xl bg-white shadow-sm border border-gray-100"
          >
            <div className="px-6 pt-4 text-center text-sm text-gray-500">
              {m.label}
            </div>
            <div className="px-6 pb-4 text-center text-3xl font-semibold tracking-tight text-gray-900">
              {summary ? Number(summary[m.key] || 0).toLocaleString() : "—"}
            </div>
          </div>
        ))}
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
          dateClick={handleDateClick}
          eventDisplay="block"
          dayMaxEventRows={3}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        />
      </div>

      {/* Footer (matches your design) */}
      <div className="text-center text-sm text-gray-400 pt-6">
        Copyright © {new Date().getFullYear()} VRA
      </div>
    </div>
  );
}
