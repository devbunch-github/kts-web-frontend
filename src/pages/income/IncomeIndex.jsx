import { useEffect, useState } from "react";
import { listIncome, deleteIncome } from "../../api/income";
import { Link } from "react-router-dom";
import axios from "../../api/http";

export default function IncomeIndex() {
  const [incomes, setIncomes] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });
  const [loading, setLoading] = useState(true);

  const fetchPage = async (page = 1) => {
    setLoading(true);
    try {
      const res = await listIncome({ ...filters, page });
      const items = Array.isArray(res) ? res : res.data ?? [];
      setIncomes(items);
      setMeta({
        current_page: res.current_page ?? 1,
        last_page: res.last_page ?? 1,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;
    try {
      await deleteIncome(id);
      setIncomes((prev) => prev.filter((x) => x.Id !== id));
    } catch (e) {
      alert("Failed to delete income. Please try again.");
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
      link.download = `income_report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      link.click();
    } catch (e) {
      console.error("PDF export failed", e);
      alert("Failed to export report. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-semibold text-[#222]">Income / Sales</h1>
        <Link
          to="/dashboard/income/new"
          className="rounded-2xl bg-[#c98383] px-6 py-2.5 text-white font-semibold hover:opacity-90"
        >
          + Add Income
        </Link>
      </div>

      {/* Filters + Report */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="date"
          value={filters.start_date}
          onChange={onFilterChange("start_date")}
          className="h-[40px] rounded-xl border border-[#e8e2e2] bg-white px-3"
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={onFilterChange("end_date")}
          className="h-[40px] rounded-xl border border-[#e8e2e2] bg-white px-3"
        />
        <button
          onClick={handleExport}
          className="h-[40px] rounded-xl bg-[#c98383]/90 px-4 text-white hover:opacity-90"
        >
          Generate Report (PDF)
        </button>

        <div className="ml-auto">
          <input
            placeholder="Search"
            className="h-[40px] rounded-xl border border-[#e8e2e2] bg-white px-3 min-w-[220px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#d4a1a1] text-white">
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
          ) : incomes.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  No income found.
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-[#f2eeee] text-[#333]">
              {incomes.map((i) => (
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
                    £ {Number(i.Amount).toFixed(2)}
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
                        onClick={() => handleDelete(i.Id)}
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
          className="text-[#333] disabled:opacity-40"
        >
          ‹
        </button>
        <span className="text-[#333]">{meta.current_page}</span>
        <button
          disabled={meta.current_page >= meta.last_page}
          onClick={() => fetchPage(meta.current_page + 1)}
          className="text-[#333] disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}
