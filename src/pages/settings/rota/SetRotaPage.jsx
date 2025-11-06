import { useEffect, useMemo, useState } from "react";
import { listRota, listTimeOff, deleteRota } from "@/api/rota";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";
import AddTimeOffModal from "./components/AddTimeOffModal";
import SetRegularShiftsModal from "./components/SetRegularShiftsModal";

dayjs.extend(isoWeek);
dayjs.extend(weekday);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-rose-100/40 rounded-2xl p-4 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default function SetRotaPage() {
  const [weekStart, setWeekStart] = useState(dayjs().startOf("week"));
  const [employeeId, setEmployeeId] = useState("");
  const [rota, setRota] = useState([]);
  const [timeOffs, setTimeOffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const weekDays = useMemo(() => {
    const start = weekStart.startOf("week");
    return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
  }, [weekStart]);

  const normalize = (payload) => {
    const d = payload?.data ?? [];
    const arr = Array.isArray(d) ? d : Object.values(d || {}).flat();

    return arr.map((item) => ({
      ...item,
      date: dayjs(item.date).format("YYYY-MM-DD"),
      start_time: item.start_time?.substring(0, 5),
      end_time: item.end_time?.substring(0, 5),
    }));
  };

  const fetchData = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const from = weekDays[0].format("YYYY-MM-DD");
      const to = weekDays[6].format("YYYY-MM-DD");
      const [rotaRes, offsRes] = await Promise.all([
        listRota({ employee_id: employeeId, from, to }),
        listTimeOff({ employee_id: employeeId, from, to }),
      ]);
      setRota(normalize(rotaRes));
      setTimeOffs(normalize(offsRes));
    } catch {
      toast.error("Failed to load rota data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weekStart, employeeId]);

  const groupedRota = useMemo(() => {
    const g = {};
    for (const r of Array.isArray(rota) ? rota : []) {
      const key = r.date;
      g[key] = g[key] || [];
      g[key].push(r);
    }
    return g;
  }, [rota]);

  const groupedOffs = useMemo(() => {
    const g = {};
    for (const r of Array.isArray(timeOffs) ? timeOffs : []) {
      const key = r.date;
      g[key] = g[key] || [];
      g[key].push(r);
    }
    return g;
  }, [timeOffs]);

  const nextWeek = () => setWeekStart((d) => d.add(7, "day"));
  const prevWeek = () => setWeekStart((d) => d.subtract(7, "day"));

  const handleDeleteShift = async (recurrenceId) => {
    try {
      await deleteRota({ recurrence_id: recurrenceId });
      toast.success("Shift deleted.");
      setConfirmDelete(null);
      fetchData();
    } catch {
      toast.error("Failed to delete shift.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Set Rota</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="px-3 py-2 rounded-xl border">
            ‹
          </button>
          <div className="px-4 py-2 rounded-xl bg-white border text-sm">
            {weekDays[0].format("DD MMM")} – {weekDays[6].format("DD MMM, YYYY")}
          </div>
          <button onClick={nextWeek} className="px-3 py-2 rounded-xl border">
            ›
          </button>
        </div>
      </div>

      <Card>
        {/* Employee selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Employee:</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm"
            >
              <option value="">-- Select Employee --</option>
              <option value="1">Olivia Ferid</option>
              <option value="2">Ivy Ferid</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <SetRegularShiftsModal employeeId={employeeId} onSaved={fetchData} />
            <AddTimeOffModal employeeId={employeeId} onSaved={fetchData} />
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-600 mb-2">
          <div>Day</div>
          {weekDays.map((d) => (
            <div key={d.toString()} className="text-center">
              <div>{d.format("ddd")}</div>
              <div className="text-gray-400">{d.format("DD MMM")}</div>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-8 gap-2">
          <div className="font-medium">Shifts</div>
          {weekDays.map((d) => {
            const dateKey = d.format("YYYY-MM-DD");
            const shifts = groupedRota[dateKey] || [];
            const offs = groupedOffs[dateKey] || [];

            return (
              <div
                key={dateKey}
                className="min-h-[80px] border rounded-xl bg-rose-50/30 flex flex-col items-center justify-start text-xs p-1 relative"
              >
                {loading ? (
                  <div className="text-gray-400 text-sm">Loading...</div>
                ) : (
                  <>
                    {/* Shift cards */}
                    {shifts.map((s) => (
                      <div
                        key={`s-${s.id}`}
                        className="bg-[#fde5e5] border border-[#f1caca] rounded-md px-2 py-1 mb-1 text-gray-700 relative group w-full"
                      >
                        {dayjs(`2000-01-01 ${s.start_time}`).format("h:mma")}–
                        {dayjs(`2000-01-01 ${s.end_time}`).format("h:mma")}

                        {/* 3-dot menu */}
                        <button
                          onClick={() =>
                            setMenuOpen(menuOpen === s.id ? null : s.id)
                          }
                          className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                        >
                          ⋮
                        </button>

                        {/* Dropdown menu */}
                        {menuOpen === s.id && (
                          <div className="absolute right-0 mt-4 bg-white border rounded-xl shadow-lg text-sm z-20">
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                              onClick={() => {
                                toast("Regular shift setup coming soon!");
                                setMenuOpen(null);
                              }}
                            >
                              Set regular shift
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-50"
                              onClick={() => {
                                setConfirmDelete(s.recurrence_id);
                                setMenuOpen(null);
                              }}
                            >
                              Delete shift
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Time off blocks */}
                    {offs.map((o) => (
                      <div
                        key={`o-${o.id}`}
                        className="bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-gray-500 w-full"
                      >
                        {dayjs(`2000-01-01 ${o.start_time}`).format("h:mma")}–
                        {dayjs(`2000-01-01 ${o.end_time}`).format("h:mma")}
                        <div className="text-[10px] text-gray-400">Time off</div>
                      </div>
                    ))}

                    {/* Empty cell */}
                    {shifts.length === 0 && offs.length === 0 && (
                      <div className="text-rose-400 text-lg mt-3">+</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Delete this shift?
            </h3>
            <p className="text-gray-500 mb-5 text-sm">
              This will remove all instances of this recurring shift.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2 rounded-2xl border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteShift(confirmDelete)}
                className="px-5 py-2 rounded-2xl bg-[#c98383] text-white hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
