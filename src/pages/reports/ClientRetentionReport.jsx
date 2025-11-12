import { useEffect, useState } from "react";
import http from "@/api/http";
import { CalendarDays, Search } from "lucide-react";

export default function ClientRetentionReport() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(10);

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const [filters, setFilters] = useState({
    from: firstDay,
    to: lastDay,
    search: "",
  });

  useEffect(() => {
    fetchReport();
  }, [filters.from, filters.to]);

  async function fetchReport() {
    try {
      setLoading(true);
      const res = await http.get("/api/business/reports/client-retention", {
        params: { from: filters.from, to: filters.to },
      });
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }

    async function handleGeneratePDF() {
        try {
            const query = new URLSearchParams({
            from: filters.from,
            to: filters.to,
            type: "retention",
            user_id: JSON.parse(localStorage.getItem("user")).id, 
            }).toString();

            const url = `${import.meta.env.VITE_API_BASE_URL}/api/business/reports/export?${query}`;
            window.open(url, "_blank"); // open PDF in new tab
        } catch (err) {
            console.error(err);
        }
    }

  const filtered = rows.filter((r) =>
    r.month.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500 text-sm">
        <CalendarDays className="animate-spin mr-2 text-rose-400" />
        Loading client retention rate report...
      </div>
    );

  return (
    <div className="bg-[#faf7f7] min-h-screen p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <CalendarDays size={18} />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Reports / Client Retention Rate
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100/40 p-6 space-y-4">
        <div className="grid md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-rose-400 focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-rose-400 focus:ring-0"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            <button
              onClick={handleGeneratePDF}
              className="px-6 py-2 bg-rose-400 text-white text-sm rounded-xl shadow-sm hover:bg-rose-500 transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100/40 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Show
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1"
            >
              {[3, 5, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            Entries
          </div>

          <div className="flex items-center bg-rose-50 border border-rose-100 rounded-xl px-3 py-1.5">
            <Search size={16} className="text-rose-400" />
            <input
              type="text"
              placeholder="Search"
              className="ml-2 text-sm bg-transparent outline-none"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead>
              <tr className="text-left border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wide">
                <th className="pb-3">Month</th>
                <th className="pb-3">New Clients</th>
                <th className="pb-3">Returning Clients</th>
                <th className="pb-3">Retention Rate(%)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, limit).map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-rose-50/30">
                  <td className="py-3">{r.month}</td>
                  <td>{r.new_clients}</td>
                  <td>{r.returning_clients}</td>
                  <td>{r.retention_rate.toFixed(2)}%</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400 text-sm">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pt-4">
        Copyright © {new Date().getFullYear()} VRA
      </div>
    </div>
  );
}
