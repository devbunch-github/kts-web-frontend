import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listAppointments,
  deleteAppointment,
  updateAppointment,
} from "../../api/appointment";
import { Search } from "lucide-react";
import AppointmentRescheduleModal from "../../components/AppointmentRescheduleModal";
import AppointmentCancelModal from "../../components/AppointmentCancelModal";
import AppointmentConfirmCancelModal from "../../components/AppointmentConfirmCancelModal";
import ConsentFormModal from "../../components/ConsentFormModal";
import MarkPaidModal from "../../components/MarkPaidModal";
import Spinner from "../../components/Spinner";

export default function AppointmentIndex() {
  const navigate = useNavigate();

  // Data + UI state
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [openReschedule, setOpenReschedule] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openConfirmCancel, setOpenConfirmCancel] = useState(false);
  const [openConsent, setOpenConsent] = useState(false);
  const [openMarkPaid, setOpenMarkPaid] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Helpers
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
    if (label === "Unpaid") return "bg-red-100 text-red-700";
    if (label === "Cancelled") return "bg-yellow-100 text-yellow-700";
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

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await listAppointments({
        q: search,
        status: statusFilter === "All" ? null : statusFilter,
      });
      setAppointments(res?.data ?? res ?? []);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [search, statusFilter]);

  // Filtering
  const filteredRows = useMemo(() => {
    const rows = Array.isArray(appointments) ? appointments : [];
    const term = (search || "").toLowerCase().trim();

    const statusMatches = (row) => {
      if (statusFilter === "All") return true;
      return getStatusLabel(row.Status) === statusFilter;
    };

    const textMatches = (row) => {
      if (!term) return true;
      const hay = `${row.customer?.Name || ""} ${row.service?.Name || ""} ${
        row.employee?.Name || row.employee?.title || ""
      }`.toLowerCase();
      return hay.includes(term);
    };

    return rows.filter((r) => statusMatches(r) && textMatches(r));
  }, [appointments, search, statusFilter]);

  // Checkbox logic
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Bulk mark as paid handler
  const confirmMarkAsPaid = async (tipDataArray = []) => {
    try {
      for (const { id, tip } of tipDataArray) {
        const appt = appointments.find((a) => a.Id === id);
        if (!appt) continue;

        const payload = {
          CustomerId: appt.CustomerId,
          ServiceId: appt.ServiceId,
          EmployeeId: appt.EmployeeId,
          StartDateTime: appt.StartDateTime,
          EndDateTime: appt.EndDateTime ?? appt.StartDateTime,
          Cost: appt.Cost ?? 0,
          Deposit: appt.Deposit ?? 0,
          RefundAmount: appt.RefundAmount ?? 0,
          Tip: tip,
          Status: 1,
        };

        await updateAppointment(id, payload);
      }

      setSelectedIds([]);
      fetchAppointments();
    } catch (err) {
      console.error("Mark as paid failed", err);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Customer Appointments
        </h2>
        <button
          onClick={() => navigate("/dashboard/appointments/new")}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
        >
          + Add Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-md w-full text-sm focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option>All</option>
          <option>Paid</option>
          <option>Unpaid</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Mark as Paid Button */}
      <div className="mb-3">
        <button
          onClick={() => setOpenMarkPaid(true)}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition ${
            selectedIds.length
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!selectedIds.length}
        >
          Mark as Paid
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Consent</th>
                <th className="px-4 py-3">Total Amt.</th>
                <th className="px-4 py-3">Deposit</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-6 text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                filteredRows.map((item) => {
                  const label = getStatusLabel(item.Status);
                  const statusClass = getStatusClass(item.Status);
                  const isPaid = label === "Paid";

                  return (
                    <tr key={item.Id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-center">
                        {!isPaid && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.Id)}
                            onChange={() => toggleSelect(item.Id)}
                            className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">{item.customer?.Name || "—"}</td>
                      <td className="px-4 py-3">{item.service?.Name || "—"}</td>
                      <td className="px-4 py-3">
                        {item.employee?.Name || item.employee?.title || "—"}
                      </td>
                      <td className="px-4 py-3">{renderConsentCell(item)}</td>
                      <td className="px-4 py-3">£ {item.Cost ?? 0}</td>
                      <td className="px-4 py-3">£ {item.Deposit ?? 0}</td>
                      <td className="px-4 py-3">
                        {item.StartDateTime
                          ? new Date(item.StartDateTime).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {item.StartDateTime
                          ? new Date(item.StartDateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusClass}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3">£ {item.Tip ?? 0}</td>
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
                        <button
                          onClick={() => handleDelete(item.Id)}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Modals */}
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
