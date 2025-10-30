import { useEffect, useState } from "react";
import { listIncome, deleteIncome } from "../../api/income";
import { Link } from "react-router-dom";
import axios from "../../api/http";
import toast from "react-hot-toast";

export default function IncomeIndex() {
  const today = new Date().toISOString().slice(0, 10);

  const [incomes, setIncomes] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [filters, setFilters] = useState({ start_date: today, end_date: today });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Confirm modal state
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPage = async (page = 1) => {
    setLoading(true);
    try {
      const res = await listIncome({ ...filters, page, search });
      const items = Array.isArray(res) ? res : res.data ?? [];
      setIncomes(items);
      setMeta({
        current_page: res.current_page ?? 1,
        last_page: res.last_page ?? 1,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load income list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConfirm = (id) => setConfirmId(id);
  const closeConfirm = () => {
    if (!deleting) setConfirmId(null);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await deleteIncome(confirmId);
      // Optimistic UI update
      setIncomes((prev) => prev.filter((x) => x.Id !== confirmId));
      toast.success("Income deleted successfully.");

      // If we removed the last item on the page and there are previous pages, refetch previous page
      setTimeout(() => {
        if (incomes.length === 1 && meta.current_page > 1) {
          fetchPage(meta.current_page - 1);
        }
      }, 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete income. Please try again.");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const onFilterChange = (k) => (e) =>
    setFilters({ ...filters, [k]: e.target.value });

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/income/export/pdf?${params}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `income_report_${today}.pdf`;
      link.click();
      toast.success("Report generated.");
    } catch (e) {
      console.error("PDF export failed", e);
      toast.error("Failed to export report. Please try again.");
    }
  };

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredIncomes = incomes.filter((i) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      i.Description?.toLowerCase().includes(term) ||
      i.Customer?.Name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 min-h-screen bg-[#faf8f8]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-semibold text-[#222] flex items-center gap-2">
          <i className="bi bi-receipt text-[#c98383]/90 text-xl"></i>
          Income / Sales
        </h1>
        <Link
          to="/dashboard/income/new"
          className="rounded-xl bg-[#c98383] px-6 py-2.5 text-white font-medium hover:bg-[#b87474] transition"
        >
          + Add Income
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={onFilterChange("start_date")}
            className="h-[42px] rounded-lg border border-[#e8e2e2] bg-white px-3 text-sm focus:ring-1 focus:ring-[#c98383]/60 outline-none w-48"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={onFilterChange("end_date")}
            className="h-[42px] rounded-lg border border-[#e8e2e2] bg-white px-3 text-sm focus:ring-1 focus:ring-[#c98383]/60 outline-none w-48"
          />
        </div>
        <button
          onClick={handleExport}
          className="mt-5 md:mt-0 h-[42px] rounded-lg bg-[#c98383]/90 px-4 text-white text-sm font-medium hover:bg-[#b87474] transition"
        >
          Generate Report (PDF)
        </button>

        <div className="ml-auto flex items-center border border-[#e8e2e2] rounded-lg bg-white px-3 h-[42px] w-56">
          <i className="bi bi-search text-[#999] mr-2"></i>
          <input
            placeholder="Search"
            value={search}
            onChange={handleSearch}
            className="w-full text-sm bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f2e1e1] text-[#333]">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-left font-medium">Customer</th>
              <th className="px-6 py-3 text-left font-medium">Category</th>
              <th className="px-6 py-3 text-left font-medium">Service</th>
              <th className="px-6 py-3 text-left font-medium">Amount (£)</th>
              <th className="px-6 py-3 text-left font-medium">Action</th>
            </tr>
          </thead>

          {loading ? (
            <tbody>
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            </tbody>
          ) : filteredIncomes.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  No income found.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-[#f2eeee] text-[#333]">
              {filteredIncomes.map((i) => (
                <tr key={i.Id} className="hover:bg-[#faf7f7] transition-all">
                  <td className="px-6 py-4">
                    {i.PaymentDateTime
                      ? new Date(i.PaymentDateTime).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {i.Customer?.Name ?? i.customer?.Name ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    {i.Category?.Name ?? i.category?.Name ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    {i.Service?.Name ?? i.service?.Name ?? "—"}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {Number(i.Amount) < 0 ? (
                      <span className="text-[#c98383] font-semibold">
                        -£{Math.abs(Number(i.Amount)).toFixed(2)}
                        <span className="ml-2 text-xs bg-[#f4e3e3] text-[#c98383] px-2 py-0.5 rounded-full">
                          Refund
                        </span>
                      </span>
                    ) : (
                      <>£ {Number(i.Amount).toFixed(2)}</>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-5 text-[15px]">
                      <Link
                        to={`/dashboard/income/${i.Id}/edit`}
                        title="Edit"
                        className="flex items-center gap-1 text-[#555] hover:text-[#c98383]"
                      >
                        <i className="bi bi-pencil"></i>
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => openConfirm(i.Id)}
                        title="Delete"
                        className="flex items-center gap-1 text-[#555] hover:text-[#c98383]"
                      >
                        <i className="bi bi-trash"></i>
                        <span>Delete</span>
                      </button>

                      <Link
                        to={`/dashboard/income/${i.Id}`}
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
      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          disabled={meta.current_page <= 1}
          onClick={() => fetchPage(meta.current_page - 1)}
          className="text-[#333] disabled:opacity-40 hover:text-[#c98383]"
        >
          ‹
        </button>
        <span className="text-[#333]">{meta.current_page}</span>
        <button
          disabled={meta.current_page >= meta.last_page}
          onClick={() => fetchPage(meta.current_page + 1)}
          className="text-[#333] disabled:opacity-40 hover:text-[#c98383]"
        >
          ›
        </button>
      </div>

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
                <h3 className="text-[17px] font-semibold text-[#222]">
                  Delete income?
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
