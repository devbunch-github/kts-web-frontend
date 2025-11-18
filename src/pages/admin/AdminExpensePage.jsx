import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getAdminExpense } from "../../api/publicApi";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";

const AdminExpensePage = () => {
  const { id } = useParams();
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expenseData, setExpenseData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const res = await getAdminExpense(id);
        if (res.success) {
          setExpenseData(res.data);
          setUser(res.user);
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    let filteredData = expenseData;

    if (term) {
      filteredData = filteredData.filter(
        (item) =>
          item.supplier.toLowerCase().includes(term) ||
          item.payment_method.toLowerCase().includes(term)
      );
    }

    if (startDate)
      filteredData = filteredData.filter(
        (item) =>
          new Date(item.payment_date.split("-").reverse().join("-")) >=
          new Date(startDate)
      );

    if (endDate)
      filteredData = filteredData.filter(
        (item) =>
          new Date(item.payment_date.split("-").reverse().join("-")) <=
          new Date(endDate)
      );

    return filteredData;
  }, [search, startDate, endDate, expenseData]);

  const totalExpense = filtered.reduce(
    (sum, row) => sum + parseFloat(row.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 hover:bg-rose-200 transition"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
              >
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Dashboard Expense View
            </h1>
          </div>

          {/* User */}
          <p className="text-sm text-gray-700 mb-4">
            <span className="font-semibold">User:</span> {user?.name ?? "Loading..."}
          </p>

          {/* Date Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>

            <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2 mt-5 text-sm hover:bg-gray-50 transition">
              Filter
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
              >
                <path d="M3 6h18M7 12h10M10 18h4" />
              </svg>
            </button>

            <button className="ml-auto bg-rose-500 text-white text-sm font-medium rounded-md px-4 py-2 mt-6 hover:bg-rose-600 transition">
              Export
            </button>
          </div>

          {/* Total Expense */}
          <div className="text-lg font-semibold text-gray-800 mb-4">
            Total Expense:{" "}
            <span className="text-rose-600">£{totalExpense.toFixed(2)}</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                Show
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(e.target.value)}
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-rose-300 outline-none"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                Entries
              </div>

              <div className="relative w-full md:w-80">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a8626b"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3-3" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                />
              </div>
            </div>

            {/* Table Data */}
            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-center py-6 text-gray-500">Loading...</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-200">
                      <th className="py-3 text-left font-semibold">Supplier</th>
                      <th className="py-3 text-left font-semibold">Payment Method</th>
                      <th className="py-3 text-left font-semibold">Payment Date</th>
                      <th className="py-3 text-left font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 hover:bg-rose-50/40 transition"
                        >
                          <td className="py-3">{row.supplier}</td>
                          <td className="py-3 text-gray-700">{row.payment_method}</td>
                          <td className="py-3 text-gray-700">{row.payment_date}</td>
                          <td className="py-3 text-gray-800 font-medium">
                            £ {parseFloat(row.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-gray-500">
                          No expense records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default AdminExpensePage;
