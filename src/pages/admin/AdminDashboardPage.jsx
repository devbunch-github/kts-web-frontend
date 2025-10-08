import React, { useState, useMemo } from "react";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";

const AdminDashboardPage = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const tableData = [
    {
      id: 1,
      name: "Octane",
      email: "contact@octane.com",
      smsPackage: "Active",
      smsUsage: "700/1000",
      subscription: "Pro Booking",
    },
    {
      id: 2,
      name: "Rhian Dodd",
      email: "info@rhiandodd.com",
      smsPackage: "Inactive",
      smsUsage: "80/100",
      subscription: "Starter",
    },
    {
      id: 3,
      name: "Siobhan",
      email: "support@siobhan.com",
      smsPackage: "Active",
      smsUsage: "30/500",
      subscription: "MTD Ready",
    },
  ];

  const filteredData = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return tableData;
    return tableData.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.subscription.toLowerCase().includes(term)
    );
  }, [search]);

  const getStatusBadge = (status) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-medium tracking-wide border";
    if (status === "Active") {
      return `${base} bg-green-50 border-green-400 text-green-700`;
    }
    return `${base} bg-red-50 border-red-400 text-red-700`;
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            Dashboard
          </h1>

          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Filters */}
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
                    <th className="py-3 text-left font-semibold">Name</th>
                    <th className="py-3 text-left font-semibold">Email</th>
                    <th className="py-3 text-left font-semibold">SMS Package</th>
                    <th className="py-3 text-left font-semibold">SMS Usage</th>
                    <th className="py-3 text-left font-semibold">
                      Active Subscription
                    </th>
                    <th className="py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-rose-50/40 transition"
                    >
                      <td className="py-3">{row.name}</td>
                      <td className="py-3 text-gray-600">{row.email}</td>
                      <td className="py-3">
                        <span className={getStatusBadge(row.smsPackage)}>
                          {row.smsPackage}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700">{row.smsUsage}</td>
                      <td className="py-3 text-gray-700">
                        {row.subscription}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => (window.location.href = "/admin/income")} className="bg-rose-500 text-white px-3 py-1.5 text-xs rounded-md hover:bg-rose-600 transition">
                            View Income
                          </button>
                          <button className="bg-rose-500 text-white px-3 py-1.5 text-xs rounded-md hover:bg-rose-600 transition">
                            View Expense
                          </button>
                          <button className="bg-rose-500 text-white px-3 py-1.5 text-xs rounded-md hover:bg-rose-600 transition">
                            Visit Store
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <AdminFooter />
    </div>
  );
};

export default AdminDashboardPage;
