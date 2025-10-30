import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle,
} from "lucide-react";
import {
  fetchAccountantExpenses,
  deleteAccountantExpense,
  fetchAccountantCategories,
} from "../../api/accountantdashboard";
import ConfirmModal from "../../components/ConfirmModal";

export default function AccountantExpense() {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, src: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expenseData, categoryData] = await Promise.all([
          fetchAccountantExpenses(),
          fetchAccountantCategories(),
        ]);
        setExpenses(expenseData);
        setFiltered(expenseData);
        setCategories(categoryData);
      } catch {
        showAlert("error", "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  // ✅ Filter logic
  useEffect(() => {
    let result = [...expenses];

    if (selectedCategory) {
      result = result.filter((e) => e.CategoryName === selectedCategory);
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.Supplier?.toLowerCase().includes(lower) ||
          r.PaymentMethod?.toLowerCase().includes(lower) ||
          r.CategoryName?.toLowerCase().includes(lower)
      );
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [search, selectedCategory, expenses]);

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAccountantExpense(deleteId);
      setExpenses((prev) => prev.filter((e) => e.Id !== deleteId));
      showAlert("success", "Expense deleted successfully.");
    } catch {
      showAlert("error", "Failed to delete expense.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const openImageModal = (src) => {
    if (!src) return;
    setImageModal({ open: true, src });
  };
  const closeImageModal = () => setImageModal({ open: false, src: "" });

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        Loading expenses...
      </div>
    );

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
          <Receipt className="w-6 h-6 text-[#f28c38]" />
          Expense
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-6">
        {/* ✅ Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Select Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-80 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#f28c38] placeholder:text-gray-400"
          >
            <option value="">e.g Accountancy</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Show Entries + Search */}
        {/* Filters */}
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
                <option key={n}>{n}</option>
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
                <th className="py-2">Supplier</th>
                <th className="py-2">Expense Amount</th>
                <th className="py-2">Payment Method</th>
                <th className="py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr
                    key={row.Id}
                    className="border-b hover:bg-[#fdf4ee] transition-colors"
                  >
                    <td className="py-2">{formatDate(row.PaidDateTime)}</td>
                    <td className="py-2">{row.Supplier || "-"}</td>
                    <td className="py-2">£ {Number(row.Amount).toFixed(2)}</td>
                    <td className="py-2">{row.PaymentMethod || "-"}</td>
                    <td className="py-2 text-center flex justify-center gap-3">
                        {/* Show "View Image" only if ReceiptUrl is not empty */}
                        {row.ReceiptUrl && row.ReceiptUrl.trim() !== "" && (
                            <button
                            onClick={() => openImageModal(row.ReceiptUrl)}
                            className="px-3 py-1.5 text-xs font-medium bg-[#f28c38] text-white rounded-md hover:bg-[#d97a2f] transition"
                            >
                            View Image
                            </button>
                        )}
                      <button
                        onClick={() => navigate(`/accountant/expense/edit/${row.Id}`)}
                        className="flex items-center gap-1 hover:text-[#d06f26] font-medium text-sm"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(row.Id)}
                        className="flex items-center gap-1 hover:text-red-600 font-medium text-sm"
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

      {/* ✅ Delete Confirmation */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />

      {/* ✅ Image Modal */}
      {imageModal.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          onClick={closeImageModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl p-2 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img
              src={imageModal.src}
              alt="Receipt"
              className="rounded-md w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* Helpers */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
