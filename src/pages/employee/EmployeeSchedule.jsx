// src/pages/employee/EmployeeSchedule.jsx
import { useEffect, useState } from "react";
import { getWeekSchedule, getEmployee } from "../../api/employee";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { createSchedule } from "../../api/employee";
import AddScheduleModal from "../../components/AddScheduleModal";


function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0 Sun
  const diff = date.getDate() - day + 1; // Monday as first (Mon=1)
  return new Date(date.setDate(diff));
}
function fmt(d) {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}
function toISO(d) {
  return d.toISOString().slice(0, 10);
}

export default function EmployeeSchedule() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [week, setWeek] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);


    const load = async (ws = weekStart) => {
    const iso = toISO(ws);
    const e = await getEmployee(id);
    setEmployee(e.data ?? e);
    const res = await getWeekSchedule(id, iso);
    setWeek(res.days ?? res);
};

useEffect(() => {
    load();
}, []);

  const prev = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    load(d);
  };
  const next = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    load(d);
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3 py-1.5 text-rose-700">
        <ChevronLeft size={16} /> Back
      </button>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Employee Schedule</h1>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-end gap-2">
          <button onClick={prev} className="rounded-full border border-gray-200 p-1 hover:bg-gray-50"><ChevronLeft size={18} /></button>
          <div className="rounded-xl border border-gray-200 px-4 py-1.5 text-sm text-gray-700">
            This week <span className="ml-3 text-gray-500">
              {fmt(weekStart)} - {fmt(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6))}
            </span>
          </div>
          <button onClick={next} className="rounded-full border border-gray-200 p-1 hover:bg-gray-50"><ChevronRight size={18} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="w-48 px-4 py-3">Employee</th>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    {fmt(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i))}
                    <div className="text-[11px] text-gray-400">18h</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img className="h-9 w-9 rounded-full object-cover" src={employee?.image || "/images/avatar-placeholder.png"} />
                    <div className="text-gray-800">{employee?.name}</div>
                  </div>
                </td>
                {week.map((day, idx) => (
                  <td key={idx} className="px-3 py-3">
                    <div className="min-h-[92px] rounded-xl border border-gray-200 p-2">
                      {day.items?.map((it, k) => (
                        <div
                          key={k}
                          className={`mb-2 rounded-lg px-2 py-1 text-xs ${
                            it.type === "timeoff" ? "bg-gray-200 text-gray-700" : "bg-rose-200/70 text-gray-800"
                          }`}
                          title={`${it.label} ${it.start}–${it.end}`}
                        >
                          <div className="font-medium">{it.label}</div>
                          <div>{it.start} - {it.end}</div>
                        </div>
                      ))}
                        <button
                            onClick={() => {
                                setSelectedDate(day.date);
                                setOpenAdd(true);
                            }}
                            className="mt-1 block w-full rounded-lg bg-rose-50 py-1 text-center text-gray-500 hover:bg-rose-100"
                            >
                            +
                        </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <AddScheduleModal
        open={openAdd}
        defaultDate={selectedDate}
        onClose={() => setOpenAdd(false)}
        onSave={async (form) => {
            try {
            await createSchedule(id, form);
            setOpenAdd(false);
            await load(); // reload week
            } catch (err) {
            alert("Failed to add schedule");
            console.error(err);
            }
        }}
        />

    </div>
  );
}
