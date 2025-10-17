import { useEffect, useMemo, useState } from "react";
import { listEmployees, deleteEmployee } from "../../api/employee";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Search } from "lucide-react";
import TimeOffModal from "../../components/TimeOffModal";
import "../../styles/forms.css";

export default function EmployeeIndex() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [openTO, setOpenTO] = useState(false);
  const [selected, setSelected] = useState(null);
  const [menuIdx, setMenuIdx] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch employees
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await listEmployees({ q, per_page: 50 });
      const data = res.data ?? res;
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search filtering
  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.title, r.email].some((v) =>
        (v || "").toLowerCase().includes(q.toLowerCase())
      )
    );
  }, [q, rows]);

  // Delete employee
  const remove = async (id) => {
    if (!confirm("Delete employee?")) return;
    try {
      await deleteEmployee(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete employee");
    }
  };

  const openTimeOff = (row) => {
    setSelected(row);
    setOpenTO(true);
    setMenuIdx(null);
  };

  const fullImageUrl = (imgPath) => {
    if (!imgPath) return "/images/avatar-placeholder.png";
    if (imgPath.startsWith("http")) return imgPath;
    return `${import.meta.env.VITE_API_BASE_URL}/${imgPath}`;
  };

  // Close menu on outside click
  useEffect(() => {
    const close = () => setMenuIdx(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Employees</h1>
        <button
          onClick={() => navigate("/dashboard/employees/new")}
          className="rounded-xl bg-rose-400 px-4 py-2 text-white shadow-sm hover:bg-rose-500"
        >
          + Add Employee
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        {/* Table Top Bar */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Show
            <select className="mx-2 rounded-lg border border-gray-200 px-2 py-1 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            Entries
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="w-64 rounded-xl border border-gray-200 bg-white px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Search employee"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Employee Name</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Services</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-400" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              )}

              {/* Employees */}
              {!loading &&
                filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* Employee Name & Avatar */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={fullImageUrl(r.image)}
                          alt="Employee"
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                        <span className="text-gray-800 font-medium">
                          {r.name || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-4 text-gray-700">{r.title || "-"}</td>

                    {/* Email */}
                    <td className="px-4 py-4">
                      {r.email ? (
                        <a
                          className="text-rose-500 hover:underline"
                          href={`mailto:${r.email}`}
                        >
                          {r.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Services */}
                    <td className="px-4 py-4 text-gray-700 truncate max-w-[280px]">
                      {Array.isArray(r.services_full) && r.services_full.length > 0
                        ? r.services_full
                            .map((s) => s.Name || s.name)
                            .filter(Boolean)
                            .join(", ")
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="relative px-4 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuIdx(menuIdx === i ? null : i);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Action <MoreVertical size={16} />
                      </button>

                      {/* Dropdown (auto-flips for last rows) */}
                      {menuIdx === i && (
                        <div
                          className={`absolute right-4 z-20 ${
                            i >= filtered.length - 2
                              ? "bottom-full mb-2"
                              : "mt-2"
                          } w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg`}
                        >
                          <Item
                            label="Edit"
                            onClick={() =>
                              navigate(`/dashboard/employees/${r.id}/edit`)
                            }
                          />
                          <Item
                            label="View Calendar"
                            onClick={() =>
                              navigate(`/dashboard/employees/${r.id}/calendar`)
                            }
                          />
                          <Item
                            label="View Scheduled Shifts"
                            onClick={() =>
                              navigate(`/dashboard/employees/${r.id}/schedule`)
                            }
                          />
                          <Item
                            label="Add Time Off"
                            onClick={() => openTimeOff(r)}
                          />
                          <Item
                            label="Delete"
                            danger
                            onClick={() => remove(r.id)}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

              {/* Empty State */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-sm text-gray-400 text-center"
                    colSpan={5}
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Off Modal */}
      <TimeOffModal
        open={openTO}
        defaultEmployee={selected}
        onClose={(ok) => {
          setOpenTO(false);
          if (ok) fetchData();
        }}
      />
    </div>
  );
}

/* Subcomponent */
function Item({ label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
        danger ? "text-red-600" : "text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
