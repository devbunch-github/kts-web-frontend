import React, { useState, useEffect, useMemo } from "react";
import { getSmsPackages, deleteSmsPackage } from "../../api/publicApi";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";

const SmsPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const res = await getSmsPackages();
      if (res.success) setPackages(res.data);
    } catch (err) {
      console.error("Error loading packages", err);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
    );
  }, [search, packages]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await deleteSmsPackage(id);
      if (res.success) {
        alert("Package deleted successfully!");
        // reload list
        loadPackages(); 
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete package. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a8626b"
                  strokeWidth="1.5"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M4 10h16" />
                </svg>
              </span>
              <h1 className="text-lg font-semibold text-gray-800">
                SMS Packages
              </h1>
            </div>

            <button
              onClick={() => nav("/admin/sms-packages/add")}
              className="bg-rose-500 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-rose-600 transition"
            >
              + Add Package
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                Show
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(e.target.value)}
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-rose-300 outline-none"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n}>{n}</option>
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

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-600 border-b border-gray-200">
                    <th className="py-3 text-left font-semibold">
                      Package Name
                    </th>
                    <th className="py-3 text-left font-semibold">Total SMS</th>
                    <th className="py-3 text-left font-semibold">Price</th>
                    <th className="py-3 text-left font-semibold">
                      Description
                    </th>
                    <th className="py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="border-b border-gray-100 hover:bg-rose-50/40 transition"
                    >
                      <td className="py-3">{pkg.name}</td>
                      <td className="py-3">{pkg.total_sms}</td>
                      <td className="py-3">£ {pkg.price}</td>
                      <td className="py-3 text-gray-600 truncate max-w-xs">
                        {pkg.description}
                      </td>
                      <td className="py-3 flex items-center gap-3">
                        <button
                          onClick={() =>
                            nav(`/admin/sms-packages/edit/${pkg.id}`)
                          }
                          className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="text-gray-500 hover:text-red-600 text-xs flex items-center gap-1"
                        >
                          🗑 Delete
                        </button>
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

export default SmsPackagesPage;
