import { useEffect, useMemo, useState } from "react";
import { getMonthCalendar, getEmployee } from "../../api/employee";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay(); // 0–6
}

// ✅ Expand repeated Time Offs (includes final repeat_until day)
function expandRepeats(events) {
  const expanded = [];
  const startOfMonth = new Date(events.year, events.month, 1);
  const endOfMonth = new Date(events.year, events.month + 1, 0);

  for (const ev of events.data) {
    if (ev.type === "off" && ev.is_repeat && ev.repeat_until) {
      const startDate = new Date(ev.date);
      const repeatUntil = new Date(ev.repeat_until);

      // clamp within current month
      const loopStart = startDate > startOfMonth ? startDate : startOfMonth;
      const loopEnd = repeatUntil < endOfMonth ? repeatUntil : endOfMonth;

      // ✅ Include the repeat_until day
      for (
        let d = new Date(loopStart);
        d <= new Date(loopEnd.getTime() + 24 * 60 * 60 * 1000);
        d.setDate(d.getDate() + 1)
      ) {
        if (d >= startDate && d <= repeatUntil)
          expanded.push({
            ...ev,
            id: `${ev.id}-${d.toISOString().slice(0, 10)}`,
            date: d.toISOString().slice(0, 10),
          });
      }
    } else {
      expanded.push(ev);
    }
  }
  return expanded;
}

export default function EmployeeCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const [employee, setEmployee] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const label = useMemo(
    () =>
      new Date(y, m).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [y, m]
  );

  const load = async (yy = y, mm = m) => {
    setLoading(true);
    try {
      const e = await getEmployee(id);
      setEmployee(e.data ?? e);
      const res = await getMonthCalendar(id, yy, mm + 1);
      const rawData = res.data ?? res;

      const expanded = expandRepeats({ data: rawData, year: yy, month: mm });
      setEvents(expanded);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const prev = () => {
    let yy = y,
      mm = m - 1;
    if (mm < 0) {
      mm = 11;
      yy -= 1;
    }
    setY(yy);
    setM(mm);
    load(yy, mm);
  };

  const next = () => {
    let yy = y,
      mm = m + 1;
    if (mm > 11) {
      mm = 0;
      yy += 1;
    }
    setY(yy);
    setM(mm);
    load(yy, mm);
  };

  const days = daysInMonth(y, m);
  const startPad = firstWeekday(y, m);

  const byDay = useMemo(() => {
    const map = {};
    (events || []).forEach((ev) => {
      const d = new Date(ev.date).getDate();
      map[d] = map[d] || [];
      map[d].push(ev);
    });
    return map;
  }, [events]);

  const openDayModal = (day) => {
    setSelectedDay(day);
    setDayEvents(byDay[day] || []);
  };
  const closeDayModal = () => {
    setSelectedDay(null);
    setDayEvents([]);
  };

  return (
    <div className="p-6 min-h-screen bg-[#faf8f8] relative">
      {/* Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
          <Loader2 className="h-10 w-10 animate-spin text-[#b26d6d]" />
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 rounded-xl bg-[#f6e9e9] px-3 py-1.5 text-[#b26d6d] hover:bg-[#ead9d9]"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="mb-6 text-2xl font-semibold text-gray-800">
        Employee Calendar
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-sm relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-gray-800 font-medium text-lg">
            {employee?.name}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="rounded-full border border-gray-200 p-1 hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-[180px] rounded-xl border border-gray-200 px-4 py-1.5 text-center text-sm text-gray-700">
              {label}
            </div>
            <button
              onClick={next}
              className="rounded-full border border-gray-200 p-1 hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px rounded-2xl bg-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="bg-[#fefafa] py-2 text-center text-sm font-medium text-[#b26d6d]"
            >
              {d}
            </div>
          ))}

          {[...Array(startPad)].map((_, i) => (
            <div key={`pad-${i}`} className="h-28 bg-white" />
          ))}

          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const evs = byDay[day] || [];
            return (
              <div
                key={day}
                onClick={() => openDayModal(day)}
                className="h-28 bg-white p-2 cursor-pointer hover:bg-[#fdf4f4] transition rounded-md"
              >
                <div className="mb-1 text-xs text-gray-400">{day}</div>
                <div className="space-y-1">
                  {evs.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`rounded-lg px-2 py-1 text-xs text-white ${
                        ev.type === "appointment"
                          ? "bg-[#c98383]/90"
                          : "bg-[#e5bebe]"
                      }`}
                    >
                      <div className="font-medium truncate">{ev.title}</div>
                      <div className="opacity-90 truncate">
                        {ev.start_time?.slice(0, 5)}{" "}
                        {ev.subtitle ? `· ${ev.subtitle}` : ""}
                      </div>
                    </div>
                  ))}
                  {evs.length > 2 && (
                    <div className="text-[11px] text-[#b26d6d]/80 font-medium mt-1">
                      +{evs.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
          onClick={closeDayModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#b26d6d]">
                {new Date(y, m, selectedDay).toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={closeDayModal}
                className="rounded-full p-1.5 hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {dayEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No appointments or time offs on this day.
              </p>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-xl p-3 text-white ${
                      ev.type === "appointment"
                        ? "bg-[#c98383]"
                        : "bg-[#e5bebe]"
                    }`}
                  >
                    <div className="font-semibold text-sm">{ev.title}</div>
                    <div className="text-xs opacity-90">
                      {ev.start_time?.slice(0, 5)} – {ev.end_time?.slice(0, 5)}
                    </div>
                    {ev.subtitle && (
                      <div className="text-xs italic mt-0.5 opacity-90">
                        {ev.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
