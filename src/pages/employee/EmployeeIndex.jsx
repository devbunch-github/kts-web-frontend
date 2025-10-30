import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { listEmployees, deleteEmployee } from "../../api/employee";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Search } from "lucide-react";
import toast from "react-hot-toast";
import TimeOffModal from "../../components/TimeOffModal";
import "../../styles/forms.css";

export default function EmployeeIndex() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [openTO, setOpenTO] = useState(false);
  const [selected, setSelected] = useState(null);
  const [menuIdx, setMenuIdx] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch employees
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await listEmployees({ q, per_page: 50 });
      const data = res.data ?? res;
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load employees", err);
      toast.error("Failed to load employees.");
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

  // Open confirm modal
  const openConfirm = (id) => {
    setConfirmId(id);
    setMenuIdx(null);
  };

  // Close confirm modal
  const closeConfirm = () => {
    if (!deleting) setConfirmId(null);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await deleteEmployee(confirmId);
      setRows((prev) => prev.filter((x) => (x.id ?? x.Id) !== confirmId));
      toast.success("Employee deleted.");
    } catch (err) {
      console.error("Failed to delete employee:", err);
      toast.error("Failed to delete employee.");
    } finally {
      setDeleting(false);
      setConfirmId(null);
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

  const toggleMenu = (e, i) => {
    e.stopPropagation();

    if (menuIdx === i) {
      setMenuIdx(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.right - 192, // dropdown width = 192px
    });
    setMenuIdx(i);
  };

  // Close menu on outside click
  useEffect(() => {
    const close = () => setMenuIdx(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="p-6 min-h-screen bg-[#faf8f8]">
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
      <div className="rounded-2xl bg-white p-4 shadow-sm overflow-visible relative">
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
        <div className="overflow-x-auto overflow-visible relative">
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
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-400" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              )}

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
                        onClick={(e) => toggleMenu(e, i)}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Action <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

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

      {/* Dropdown Portal */}
      {menuIdx !== null &&
        createPortal(
          <div
            className="fixed z-[9999] w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
            }}
          >
            <Item
              label="Edit"
              onClick={() =>
                navigate(`/dashboard/employees/${filtered[menuIdx].id}/edit`)
              }
            />
            <Item
              label="View Calendar"
              onClick={() =>
                navigate(`/dashboard/employees/${filtered[menuIdx].id}/calendar`)
              }
            />
            <Item
              label="View Scheduled Shifts"
              onClick={() =>
                navigate(`/dashboard/employees/${filtered[menuIdx].id}/schedule`)
              }
            />
            <Item
              label="Add Time Off"
              onClick={() => openTimeOff(filtered[menuIdx])}
            />
            <Item
              label="Delete"
              danger
              onClick={() => openConfirm(filtered[menuIdx].id)}
            />
          </div>,
          document.body
        )}

      {/* Confirm Delete Modal */}
      {confirmId !== null && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e3e3]">
                <i className="bi bi-trash text-[#c98383] text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[#222]">
                  Delete employee?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={deleting}
                className="rounded-lg border border-[#e8e2e2] px-4 py-2 text-sm text-[#333] hover:bg-[#faf7f7] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className={`rounded-lg px-4 py-2 text-sm text-white ${
                  deleting
                    ? "bg-[#c98383]/70 cursor-not-allowed"
                    : "bg-[#c98383] hover:bg-[#b87474]"
                }`}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
