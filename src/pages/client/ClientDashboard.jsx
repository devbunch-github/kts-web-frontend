import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar } from "lucide-react";
import { fetchClientAppointments } from "../../api/client";

export default function ClientDashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetchClientAppointments();
      setEvents(
        res.data.map((a) => ({
          id: a.id,
          title: a.service_name,
          start: a.appointment_date + "T" + a.appointment_time,
          backgroundColor: "#e58c45",
          borderColor: "#e58c45",
          textColor: "#ffffff",
        }))
      );
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  };

  return (
    <div className="w-full">
      {/* PAGE HEADER (matches design) */}
      <div className="bg-[#fff6f0] border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f28c38] flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        </div>
      </div>

      {/* CALENDAR WRAPPER */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          height="auto"
          events={events}
          dayMaxEvents={true}
          eventDisplay="block"
          displayEventTime={true}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          buttonText={{
            today: "today",
          }}
        />
      </div>
    </div>
  );
}
