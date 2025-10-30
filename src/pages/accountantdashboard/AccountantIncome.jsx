import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileBarChart, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchAccountantIncome,
  deleteAccountantIncome,
} from "../../api/accountantdashboard";
import ConfirmModal from "../../components/ConfirmModal";

export default function AccountantIncome() {
  const [incomes, setIncomes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch income data
  useEffect(() => {
    const loadIncome = async () => {
      try {
        const data = await fetchAccountantIncome();
        setIncomes(data || []);
        setFiltered(data || []);
      } catch (error) {
        showAlert("error", "Failed to load income data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadIncome();
  }, []);

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    };

  // Search filter
  useEffect(() => {
    const lower = search.toLowerCase();
    const result = incomes.filter(
      (row) =>
        row.CustomerName?.toLowerCase().includes(lower) ||
        row.CategoryName?.toLowerCase().includes(lower) ||
        row.ServiceName?.toLowerCase().includes(lower) ||
        row.PaymentMethod?.toLowerCase().includes(lower)
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, incomes]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAccountantIncome(deleteId);
      setIncomes((prev) => prev.filter((i) => i.Id !== deleteId));
      showAlert("success", "Income deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      showAlert("error", "Failed to delete income. Please try again.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        Loading income list...
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-[#fffaf6] p-6 font-[Poppins,sans-serif] relative">
      {/* ✅ Alert */}
      {alert.message && (
        <div
          className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-3 rounded-xl shadow-md z-50 text-sm ${
            alert.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-[#f28c38]" />
          Income / Sales
        </h2>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Show</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#f28c38]"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">Entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-md text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#f28c38]"
            />
            <i className="fa-solid fa-magnifying-glass absolute right-3 top-3 text-gray-400 text-sm"></i>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Date</th>
                <th className="py-2">Customer Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Service</th>
                <th className="py-2">Payment Type</th>
                <th className="py-2 text-right">Income Amount</th>
                <th className="py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr
                    key={row.Id}
                    className="border-b hover:bg-[#fdf4ee] transition-colors"
                  >
                    <td className="py-2">{formatDate(row.PaymentDateTime)}</td>
                    <td className="py-2">{row.CustomerName || "-"}</td>
                    <td className="py-2">{row.CategoryName || row.CategoryId || "-"}</td>
                    <td className="py-2">{row.ServiceName || row.Description || "-"}</td>
                    <td className="py-2">{row.PaymentMethod || "-"}</td>
                    <td className="py-2 text-right">
                      £ {Number(row.Amount).toFixed(2)}
                    </td>
                    <td className="py-2 text-center flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`/accountant/income/edit/${row.Id}`)}
                        className="flex items-center gap-1 hover:text-[#d06f26] transition font-medium text-sm"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(row.Id)}
                        className="flex items-center gap-1 hover:text-red-600 transition font-medium text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-3">
          <span>
            Showing{" "}
            <b>
              {(currentPage - 1) * entriesPerPage + 1}–
              {Math.min(currentPage * entriesPerPage, filtered.length)}
            </b>{" "}
            of <b>{filtered.length}</b> entries
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md border font-medium transition ${
                currentPage === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md border font-medium transition ${
                currentPage === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Income Record"
        message="Are you sure you want to delete this income record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}

/* ----------------------- Helpers ------------------------ */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
