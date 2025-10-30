import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  listExpenses,
  deleteExpense,
  listCategories,
  exportExpensePdf,
} from "../../api/expense";
import Spinner from "../../components/Spinner";

export default function ExpenseIndex() {
  const today = new Date().toISOString().slice(0, 10);

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Dates are ONLY for PDF
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category_id: "",
    search: "",
    page: 1,
  });

  // ---- helpers to unwrap API responses no matter the shape ----
  const pickArray = (r) => {
    // r can be: {data:[...], meta:{...}} OR just [...]
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r?.data?.data)) return r.data.data;
    return [];
  };
  const pickMeta = (r) => {
    // meta may live on r.meta or r.data.meta
    return r?.meta || r?.data?.meta || { current_page: 1, last_page: 1 };
  };

  // ---- Fetch listing (WITHOUT dates) ----
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {
        category_id: filters.category_id || undefined,
        search: filters.search || undefined,
        page: filters.page || 1,
      };
      const res = await listExpenses(params);
      setExpenses(pickArray(res));
      setPagination(pickMeta(res));
    } catch (e) {
      console.error("Failed to fetch expenses:", e);
      toast.error("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const r = await listCategories();
        // r can be array or {data:[...]}
        setCategories(pickArray(r));
      } catch {
        setCategories([]);
      }
      fetchExpenses();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when NON-date filters change
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category_id, filters.page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(fetchExpenses, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // Delete flow (modal)
  const openConfirm = (id) => setConfirmId(id);
  const closeConfirm = () => !deleting && setConfirmId(null);
  const confirmDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await deleteExpense(confirmId);
      setExpenses((prev) => prev.filter((x) => (x.id ?? x.Id) !== confirmId));
      toast.success("Expense deleted.");
      if (expenses.length === 1 && pagination.current_page > 1) {
        setFilters((s) => ({ ...s, page: s.page - 1 }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete expense.");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  // PDF generation uses dates
  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    try {
      const res = await exportExpensePdf({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        category_id: filters.category_id || undefined,
        search: filters.search || undefined,
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Expense_Report_${today}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report generated.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const visible = expenses.filter((x) => {
    if (!filters.search.trim()) return true;
    const t = filters.search.toLowerCase();
    return (
      x.supplier?.toLowerCase().includes(t) ||
      x.notes?.toLowerCase().includes(t)
    );
  });

  return (
    <div className="p-6 min-h-screen bg-[#faf8f8]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-semibold text-[#222] flex items-center gap-2">
          <i className="bi bi-wallet2 text-[#c98383]/90 text-xl"></i>
          Expense
        </h1>
        <Link
          to="/dashboard/expense/new"
          className="rounded-xl bg-[#c98383] px-6 py-2.5 text-white font-medium hover:bg-[#b87474] transition"
        >
          + Add Expense
        </Link>
      </div>

      {/* Filters row (dates only influence PDF) */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) =>
              setFilters((s) => ({ ...s, start_date: e.target.value }))
            }
            className="h-[42px] rounded-lg border border-[#e8e2e2] bg-white px-3 text-sm focus:ring-1 focus:ring-[#c98383]/60 outline-none w-48"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters((s) => ({ ...s, end_date: e.target.value }))
            }
            className="h-[42px] rounded-lg border border-[#e8e2e2] bg-white px-3 text-sm focus:ring-1 focus:ring-[#c98383]/60 outline-none w-48"
          />
        </div>
        <button
          onClick={handleGeneratePdf}
          disabled={pdfLoading}
          className="mt-5 md:mt-0 h-[42px] rounded-lg bg-[#c98383]/90 px-4 text-white text-sm font-medium hover:bg-[#b87474] transition flex items-center gap-2"
        >
          {pdfLoading ? (
            <>
              <Spinner className="h-4 w-4" /> Generating…
            </>
          ) : (
            "Generate Report"
          )}
        </button>

        <div className="ml-auto flex items-center border border-[#e8e2e2] rounded-lg bg-white px-3 h-[42px] w-56">
          <i className="bi bi-search text-[#999] mr-2"></i>
          <input
            placeholder="Search"
            value={filters.search}
            onChange={(e) =>
              setFilters((s) => ({ ...s, search: e.target.value, page: 1 }))
            }
            className="w-full text-sm bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Category filter (affects listing) */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <label className="text-sm text-gray-600 mb-1 block">Select Category</label>
        <select
          value={filters.category_id}
          onChange={(e) =>
            setFilters((s) => ({ ...s, category_id: e.target.value, page: 1 }))
          }
          className="h-[42px] rounded-lg border border-[#e8e2e2] bg-white px-3 text-sm focus:ring-1 focus:ring-[#c98383]/60 outline-none w-full sm:w-[420px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
              {c.name ?? c.Name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f2e1e1] text-[#333]">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-left font-medium">Supplier</th>
              <th className="px-6 py-3 text-left font-medium">Expense Amount</th>
              <th className="px-6 py-3 text-left font-medium">Payment Method</th>
              <th className="px-6 py-3 text-left font-medium">Action</th>
            </tr>
          </thead>

          {loading ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  <Spinner className="h-5 w-5 inline mr-2" /> Loading…
                </td>
              </tr>
            </tbody>
          ) : visible.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                  No expense found.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-[#f2eeee] text-[#333]">
              {visible.map((e) => (
                <tr key={e.id ?? e.Id} className="hover:bg-[#faf7f7] transition-all">
                  <td className="px-6 py-4">
                    {e.paid_date_time
                      ? new Date(e.paid_date_time).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">{e.supplier || "—"}</td>
                  <td className="px-6 py-4 font-medium">
                    £ {Number(e.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{e.payment_method || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-5 text-[15px]">
                      <Link
                        to={`/dashboard/expense/${e.id ?? e.Id}/edit`}
                        title="Edit"
                        className="flex items-center gap-1 text-[#555] hover:text-[#c98383]"
                      >
                        <i className="bi bi-pencil"></i>
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => openConfirm(e.id ?? e.Id)}
                        title="Delete"
                        className="flex items-center gap-1 text-[#555] hover:text-[#c98383]"
                      >
                        <i className="bi bi-trash"></i>
                        <span>Delete</span>
                      </button>

                      <Link
                        to={`/dashboard/expense/${e.id ?? e.Id}`}
                        title="View"
                        className="flex items-center gap-1 text-[#555] hover:text-[#c98383]"
                      >
                        <i className="bi bi-eye"></i>
                        <span>View</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            disabled={pagination.current_page <= 1}
            onClick={() =>
              setFilters((s) => ({ ...s, page: Math.max(1, (s.page || 1) - 1) }))
            }
            className="text-[#333] disabled:opacity-40 hover:text-[#c98383]"
          >
            ‹
          </button>
          <span className="text-[#333]">{pagination.current_page}</span>
          <button
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() =>
              setFilters((s) => ({
                ...s,
                page: Math.min(pagination.last_page, (s.page || 1) + 1),
              }))
            }
            className="text-[#333] disabled:opacity-40 hover:text-[#c98383]"
          >
            ›
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
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
                <h3 className="text-[17px] font-semibold text-[#222]">Delete expense?</h3>
                <p className="mt-1 text-sm text-gray-600">This action cannot be undone.</p>
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
                  deleting ? "bg-[#c98383]/70 cursor-not-allowed" : "bg-[#c98383] hover:bg-[#b87474]"
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
