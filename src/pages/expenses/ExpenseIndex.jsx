import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listExpenses,
  deleteExpense,
  listCategories,
  exportExpensePdf,
} from "../../api/expense";
import Spinner from "../../components/Spinner";

export default function ExpenseIndex() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [busyRow, setBusyRow] = useState(null);

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    category_id: "",
    search: "",
  });

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await listExpenses(filters);
      setExpenses(res.data ?? res);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    listCategories().then((r) => setCategories(r.data ?? r));
    fetchExpenses();
  }, []);

  // Auto refetch on category/date filter change
  useEffect(() => {
    fetchExpenses();
  }, [filters.start_date, filters.end_date, filters.category_id]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => fetchExpenses(), 500);
    return () => clearTimeout(delay);
  }, [filters.search]);

  // Delete expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    setBusyRow(id);
    try {
      await deleteExpense(id);
      await fetchExpenses();
    } finally {
      setBusyRow(null);
    }
  };

  // Generate PDF report
  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    try {
      const res = await exportExpensePdf(filters);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Expense_Report.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF report.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Expense</h1>
        <button
          onClick={() => navigate("/dashboard/expense/new")}
          className="px-4 py-2 rounded-lg text-white font-medium shadow-sm hover:opacity-95"
          style={{ backgroundColor: "#C08080" }}
        >
          + Add Expense
        </button>
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        {/* Filter Row 1 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) =>
              setFilters((s) => ({ ...s, start_date: e.target.value }))
            }
            className="w-full md:w-60 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200"
          />

          <input
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters((s) => ({ ...s, end_date: e.target.value }))
            }
            className="w-full md:w-60 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200"
          />

          <button
            onClick={handleGeneratePdf}
            disabled={pdfLoading}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-95 flex items-center gap-2"
            style={{ backgroundColor: "#C08080" }}
          >
            {pdfLoading ? (
              <>
                <Spinner className="h-4 w-4" /> Generating PDF…
              </>
            ) : (
              "Generate PDF"
            )}
          </button>

          <div className="flex-1" />
        </div>

        {/* Filter Row 2 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
          <select
            value={filters.category_id}
            onChange={(e) =>
              setFilters((s) => ({ ...s, category_id: e.target.value }))
            }
            className="w-full md:w-[420px] rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                {c.name ?? c.Name}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search supplier or notes..."
              value={filters.search}
              onChange={(e) =>
                setFilters((s) => ({ ...s, search: e.target.value }))
              }
              className="w-full rounded-lg border border-rose-200 bg-white px-9 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21L15.8 15.8M18 10.5C18 14.09 15.09 17 11.5 17C7.91 17 5 14.09 5 10.5C5 6.91 7.91 4 11.5 4C15.09 4 18 6.91 18 10.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {["Date", "Supplier", "Expense Amount", "Payment Method", "Action"].map(
                  (head) => (
                    <th
                      key={head}
                      className="px-5 py-3 text-left text-white font-medium"
                      style={{ backgroundColor: "#C08080" }}
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!loading &&
                expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      {new Date(item.paid_date_time).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">{item.supplier}</td>
                    <td className="px-5 py-3">£ {Number(item.amount).toFixed(2)}</td>
                    <td className="px-5 py-3">{item.payment_method}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/expense/${item.id}/edit`)
                          }
                          className="text-gray-800 hover:underline disabled:opacity-60"
                          disabled={busyRow === item.id}
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-800 hover:underline disabled:opacity-60"
                          disabled={busyRow === item.id}
                        >
                          {busyRow === item.id ? (
                            <span className="inline-flex items-center gap-1">
                              <Spinner className="h-3.5 w-3.5" /> Deleting…
                            </span>
                          ) : (
                            <>🗑 Delete</>
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/expense/${item.id}`)}
                          className="text-gray-800 hover:underline"
                        >
                          👁 View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* States */}
          {loading && (
            <p className="text-center py-6 text-gray-500">
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-5 w-5" /> Loading expenses…
              </span>
            </p>
          )}

          {!loading && expenses.length === 0 && (
            <p className="text-center py-6 text-gray-500">No records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
