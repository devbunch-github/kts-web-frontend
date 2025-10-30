import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listAppointments,
  deleteAppointment,
  updateAppointment,
} from "../../api/appointment";
import { Search, Loader2 } from "lucide-react";
import AppointmentRescheduleModal from "../../components/AppointmentRescheduleModal";
import AppointmentCancelModal from "../../components/AppointmentCancelModal";
import AppointmentConfirmCancelModal from "../../components/AppointmentConfirmCancelModal";
import ConsentFormModal from "../../components/ConsentFormModal";
import MarkPaidModal from "../../components/MarkPaidModal";

export default function AppointmentIndex() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);

  const [openReschedule, setOpenReschedule] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openConfirmCancel, setOpenConfirmCancel] = useState(false);
  const [openConsent, setOpenConsent] = useState(false);
  const [openMarkPaid, setOpenMarkPaid] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [message, setMessage] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const getStatusLabel = (status) => {
    const value = Number(status);
    switch (value) {
      case 1:
        return "Paid";
      case 2:
        return "Cancelled";
      default:
        return "Unpaid";
    }
  };

  const getStatusClass = (status) => {
    const label = getStatusLabel(status);
    if (label === "Paid") return "bg-green-100 text-green-700";
    if (label === "Unpaid") return "bg-rose-100 text-rose-700";
    if (label === "Cancelled") return "bg-gray-100 text-gray-500";
    return "bg-gray-100 text-gray-700";
  };

  const renderConsentCell = (item) => {
    const status = item?.consent?.status;
    if (status === "submitted") {
      return (
        <button
          onClick={() => {
            setSelectedAppointment(item);
            setOpenConsent(true);
          }}
          className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-md hover:bg-rose-200"
        >
          View Form
        </button>
      );
    }
    if (status === "pending") {
      return (
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
          Pending
        </span>
      );
    }
    return <span className="text-gray-400">—</span>;
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await listAppointments({
        q: search,
        status: statusFilter === "All" ? null : statusFilter,
      });
      setAppointments(res?.data ?? res ?? []);
    } catch {
      showMessage("error", "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [search, statusFilter]);

  const filteredRows = useMemo(() => {
    const rows = Array.isArray(appointments) ? appointments : [];
    const term = (search || "").toLowerCase().trim();
    const statusMatches = (row) =>
      statusFilter === "All" || getStatusLabel(row.Status) === statusFilter;
    const textMatches = (row) => {
      if (!term) return true;
      const hay = `${row.customer?.Name || ""} ${row.service?.Name || ""} ${
        row.employee?.Name || ""
      }`.toLowerCase();
      return hay.includes(term);
    };
    return rows.filter((r) => statusMatches(r) && textMatches(r));
  }, [appointments, search, statusFilter]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      fetchAppointments();
      showMessage("success", "Appointment deleted successfully");
    } catch {
      showMessage("error", "Failed to delete appointment");
    }
  };

  const confirmMarkAsPaid = async (tipDataArray = []) => {
    try {
      for (const { id, tip } of tipDataArray) {
        const appt = appointments.find((a) => a.Id === id);
        if (!appt) continue;
        await updateAppointment(id, { ...appt, Tip: tip, Status: 1 });
      }
      setSelectedIds([]);
      fetchAppointments();
      showMessage("success", "Appointments marked as paid");
    } catch {
      showMessage("error", "Failed to mark as paid");
    }
  };

  return (
    <div className="relative p-6 min-h-screen bg-[#faf8f8]">
      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
          <Loader2 className="h-10 w-10 animate-spin text-[#b26d6d]" />
        </div>
      )}

      {/* Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-[9999] rounded-lg px-4 py-3 shadow-lg text-sm ${
            message.type === "error"
              ? "bg-rose-100 text-rose-700 border border-rose-300"
              : "bg-green-100 text-green-700 border border-green-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-semibold text-gray-800">
          Customer Appointment
        </h2>
        <button
          onClick={() => navigate("/dashboard/appointments/new")}
          className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition"
        >
          + Add Appointment
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center text-sm text-gray-700">
            Show
            <select className="mx-2 border border-gray-200 rounded-md px-2 py-1 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            Entries
          </div>
          <button
            onClick={() => setOpenMarkPaid(true)}
            disabled={!selectedIds.length}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              selectedIds.length
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Mark all Paid
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-md w-full text-sm focus:ring-rose-400 focus:border-rose-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-md text-sm text-gray-700 focus:ring-rose-400 focus:border-rose-400"
          >
            <option>All</option>
            <option>Paid</option>
            <option>Unpaid</option>
            <option>Partially Paid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Total Amt.</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Final Amt.</th>
              <th className="px-4 py-3">Deposit</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Pay Status</th>
              <th className="px-4 py-3">Refund Amt</th>
              <th className="px-4 py-3">Tip Amt</th>
              <th className="px-4 py-3">Pay Balance</th>
              <th className="px-4 py-3">Form</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="16" className="text-center py-8 text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredRows.map((item) => {
                const label = getStatusLabel(item.Status);
                const statusClass = getStatusClass(item.Status);
                const isPaid = label === "Paid";
                return (
                  <tr
                    key={item.Id}
                    className="border-b last:border-0 hover:bg-rose-50/40 transition"
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.Id)}
                        onChange={() => toggleSelect(item.Id)}
                        className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                      />
                    </td>
                    <td className="px-4 py-3">{item.customer?.Name || "—"}</td>
                    <td className="px-4 py-3">{item.service?.Name || "—"}</td>
                    <td className="px-4 py-3">{item.employee?.Name || "—"}</td>
                    <td className="px-4 py-3">£ {item.Cost ?? 0}</td>
                    <td className="px-4 py-3">£ {item.Discount ?? 0}</td>
                    <td className="px-4 py-3">£ {item.FinalAmount ?? 0}</td>
                    <td className="px-4 py-3">£ {item.Deposit ?? 0}</td>
                    <td className="px-4 py-3">
                      {new Date(item.StartDateTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.StartDateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusClass}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3">£ {item.RefundAmount ?? 0}</td>
                    <td className="px-4 py-3">£ {item.Tip ?? 0}</td>
                    <td className="px-4 py-3">£ {item.PayBalance ?? 0}</td>
                    <td className="px-4 py-3">{renderConsentCell(item)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(item);
                          setOpenCancel(true);
                        }}
                        className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-md hover:bg-rose-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(item);
                          setOpenReschedule(true);
                        }}
                        className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-md hover:bg-rose-200"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/appointments/${item.Id}/edit`)
                        }
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-4 text-sm text-gray-600">
        <button className="p-2 rounded-md hover:bg-gray-100">
          ‹
        </button>
        <span className="px-3 py-1 rounded-md bg-rose-100 text-rose-700">1</span>
        <button className="p-2 rounded-md hover:bg-gray-100">
          ›
        </button>
      </div>

      {/* Modals */}
      {openMarkPaid && (
        <MarkPaidModal
          open={openMarkPaid}
          setOpen={setOpenMarkPaid}
          onConfirm={confirmMarkAsPaid}
          selectedAppointments={appointments.filter((a) =>
            selectedIds.includes(a.Id)
          )}
        />
      )}
      {openConsent && (
        <ConsentFormModal
          open={openConsent}
          setOpen={setOpenConsent}
          appointment={selectedAppointment}
        />
      )}
      {openReschedule && (
        <AppointmentRescheduleModal
          open={openReschedule}
          setOpen={setOpenReschedule}
          appointment={selectedAppointment}
          onSaved={fetchAppointments}
        />
      )}
      {openCancel && (
        <AppointmentCancelModal
          open={openCancel}
          setOpen={setOpenCancel}
          onConfirm={() => {
            setOpenCancel(false);
            setOpenConfirmCancel(true);
          }}
        />
      )}
      {openConfirmCancel && (
        <AppointmentConfirmCancelModal
          open={openConfirmCancel}
          setOpen={setOpenConfirmCancel}
          appointment={selectedAppointment}
          onSaved={fetchAppointments}
        />
      )}
    </div>
  );
}
