// src/pages/employee/EmployeeCalendar.jsx
import { useEffect, useMemo, useState } from "react";
import { getMonthCalendar, getEmployee } from "../../api/employee";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year, month) {
  return new Date(year, month, 1).getDay(); // 0-6
}

export default function EmployeeCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const [y, setY] = useState(today.getFullYear());
  const [m, setM] = useState(today.getMonth());
  const [employee, setEmployee] = useState(null);
  const [events, setEvents] = useState([]);

  const label = useMemo(() => new Date(y, m).toLocaleString(undefined, { month: "long", year: "numeric" }), [y, m]);

  const load = async (yy = y, mm = m) => {
    const e = await getEmployee(id);
    setEmployee(e.data ?? e);
    const res = await getMonthCalendar(id, yy, mm + 1);
    setEvents(res.data ?? res);
  };

  useEffect(() => {
    load();
  }, []);

  const prev = () => {
    let yy = y, mm = m - 1;
    if (mm < 0) { mm = 11; yy -= 1; }
    setY(yy); setM(mm); load(yy, mm);
  };
  const next = () => {
    let yy = y, mm = m + 1;
    if (mm > 11) { mm = 0; yy += 1; }
    setY(yy); setM(mm); load(yy, mm);
  };

  const days = daysInMonth(y, m);
  const startPad = firstWeekday(y, m); // Sun-based grid

  // events indexed by day
  const byDay = useMemo(() => {
    const map = {};
    (events || []).forEach((ev) => {
      const d = new Date(ev.date).getDate();
      map[d] = map[d] || [];
      map[d].push(ev);
    });
    return map;
  }, [events]);

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3 py-1.5 text-rose-700">
        <ChevronLeft size={16} /> Back
      </button>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Employee Calendar</h1>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-gray-800 font-medium">{employee?.name}</div>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="rounded-full border border-gray-200 p-1 hover:bg-gray-50"><ChevronLeft size={18} /></button>
            <div className="min-w-[180px] rounded-xl border border-gray-200 px-4 py-1.5 text-center text-sm text-gray-700">
              {label}
            </div>
            <button onClick={next} className="rounded-full border border-gray-200 p-1 hover:bg-gray-50"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px rounded-2xl bg-gray-200">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="bg-white py-2 text-center text-sm text-gray-500">{d}</div>
          ))}
          {[...Array(startPad)].map((_, i) => (
            <div key={`pad-${i}`} className="h-28 bg-white" />
          ))}
          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const evs = byDay[day] || [];
            return (
              <div key={day} className="h-28 bg-white p-2">
                <div className="mb-1 text-xs text-gray-400">{day}</div>
                <div className="space-y-1">
                  {evs.map((ev) => (
                    <div key={ev.id} className="rounded-lg bg-rose-300/70 px-2 py-1 text-xs text-white">
                      <div className="font-medium">{ev.title}</div>
                      <div className="opacity-90">{ev.start_time?.slice(0,5)} {ev.subtitle ? ` · ${ev.subtitle}` : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
