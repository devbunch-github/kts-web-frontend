import React, { useState, useMemo } from "react";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";

const AdminIncomePage = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const incomeData = [
    {
      id: 1,
      description: "Monthly Sales",
      method: "Paypal",
      date: "01-01-2025",
      amount: 3000,
    },
    {
      id: 2,
      description: "Monthly Sales",
      method: "Stripe",
      date: "06-01-2025",
      amount: 3500,
    },
    {
      id: 3,
      description: "Monthly Sales",
      method: "Pay at venue",
      date: "18-01-2025",
      amount: 1008,
    },
  ];

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return incomeData.filter(
      (item) =>
        item.description.toLowerCase().includes(term) ||
        item.method.toLowerCase().includes(term)
    );
  }, [search]);

  const totalIncome = filtered.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {/* Heading */}
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
              Dashboard Income View
            </h1>
          </div>

          {/* User Info */}
          <p className="text-sm text-gray-700 mb-4">
            <span className="font-semibold">User:</span> Octane
          </p>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g. 01/05/2024"
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="e.g. 01/05/2024"
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
              />
            </div>

            <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50 transition">
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

            <button className="ml-auto bg-rose-500 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-rose-600 transition">
              Export
            </button>
          </div>

          {/* Total Income */}
          <div className="text-lg font-semibold text-gray-800 mb-4">
            Total Income:{" "}
            <span className="text-rose-600">£{totalIncome.toFixed(0)}</span>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Table Controls */}
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-600 border-b border-gray-200">
                    <th className="py-3 text-left font-semibold">
                      Description
                    </th>
                    <th className="py-3 text-left font-semibold">
                      Payment Method
                    </th>
                    <th className="py-3 text-left font-semibold">
                      Payment Date
                    </th>
                    <th className="py-3 text-left font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-rose-50/40 transition"
                    >
                      <td className="py-3">{row.description}</td>
                      <td className="py-3 text-gray-700">{row.method}</td>
                      <td className="py-3 text-gray-700">{row.date}</td>
                      <td className="py-3 text-gray-800 font-medium">
                        £ {row.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination (simple static for now) */}
            <div className="flex justify-end items-center mt-4 text-sm text-gray-600">
              <button className="px-2 py-1 hover:text-rose-600">&lt;</button>
              <span className="mx-2">1</span>
              <button className="px-2 py-1 hover:text-rose-600">&gt;</button>
            </div>
          </div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default AdminIncomePage;
