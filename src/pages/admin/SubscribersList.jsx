import React, { useEffect, useMemo, useState } from "react";
import { getSubscriptions, cancelSubscription } from "../../api/publicApi";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";
import ConfirmModal from "../../components/ConfirmModal";

const SubscribersList = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // feedback
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const data = await getSubscriptions();
      // Support both {data: []} and [] responses
      const list = data?.data || data || [];
      setRows(list);
    } catch (e) {
      setMessage({
        text: e?.response?.data?.message || "Failed to load subscribers.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);

      return () => clearTimeout(timer); 
    }
  }, [message.text]);

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const name = (r.user?.name || r.user_name || "").toLowerCase();
      const email = (r.user?.email || r.user_email || "").toLowerCase();
      const plan = (r.plan?.name || r.plan_name || "").toLowerCase();
      return name.includes(term) || email.includes(term) || plan.includes(term);
    });
  }, [rows, search]);

  // helpers to render values
  const fmtDate = (d) => {
    if (!d) return "–";
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = date.getFullYear();
    return `${dd}-${mm}-${yy}`;
  };

  const openCancel = (id) => {
    setTargetId(id);
    setConfirmOpen(true);
  };

  const onConfirmCancel = async () => {
    if (!targetId) return;
    setCancelLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await cancelSubscription(targetId);
      setMessage({ text: "Subscription cancelled successfully.", type: "success" });
      // Remove locally or refetch
      setRows((cur) => cur.map((r) => (r.id === targetId ? { ...r, status: "cancelled", ends_at: new Date().toISOString() } : r)));
    } catch (e) {
      setMessage({
        text: e?.response?.data?.message || "Cancel failed.",
        type: "error",
      });
    } finally {
      setCancelLoading(false);
      setConfirmOpen(false);
      setTargetId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />
      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {/* Page Heading */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8626b" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <h1 className="text-xl font-semibold text-gray-800">Subscribers List</h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                Show
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="border border-gray-200 rounded-md px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-rose-300 outline-none"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                Entries
              </div>

              <div className="relative w-full md:w-80">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8626b" strokeWidth="1.5">
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

            {/* Message */}
            {message.text && (
              <div
                className={`mb-4 p-3 rounded-md text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-10 text-gray-500 text-sm">Loading...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-200">
                      <th className="py-3 text-left font-semibold">Name</th>
                      <th className="py-3 text-left font-semibold">Email</th>
                      <th className="py-3 text-left font-semibold">Purchase Date</th>
                      <th className="py-3 text-left font-semibold">Next Payment Date</th>
                      <th className="py-3 text-left font-semibold">Expiry Date</th>
                      <th className="py-3 text-left font-semibold">Active Subscription</th>
                      <th className="py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, entriesPerPage).map((s) => {
                      const name  = s.name || "—";
                      const email = s.email || "—";
                      const plan  = s.subscription || "—";

                      const purchase = fmtDate(s.created_at);
                      const nextPay  = fmtDate(s.starts_at);
                      const expiry   = fmtDate(s.ends_at);

                      const isCancelled =
                        (s.status && s.status.toLowerCase() === "cancelled") ||
                        Boolean(s.ends_at);

                      return (
                        <tr key={s.id} className="border-b border-gray-100 hover:bg-rose-50/40 transition">
                          <td className="py-3 text-gray-800">{name}</td>
                          <td className="py-3 text-gray-700">{email}</td>
                          <td className="py-3 text-gray-700">{purchase}</td>
                          <td className="py-3 text-gray-700">{nextPay}</td>
                          <td className="py-3 text-gray-700">{expiry}</td>
                          <td className="py-3 text-gray-700">{plan}</td>
                          <td className="py-3">
                            <button
                              disabled={isCancelled}
                              onClick={() => openCancel(s.id)}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                                isCancelled
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : "bg-rose-300 hover:bg-rose-400 text-white"
                              }`}
                            >
                              {isCancelled ? "Cancelled" : "Cancel"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination (static for now) */}
            <div className="flex justify-end items-center mt-4 text-sm text-gray-800">
              <button className="px-2 py-1 hover:text-rose-600">&lt;</button>
              <span className="mx-2">1</span>
              <button className="px-2 py-1 hover:text-rose-600">&gt;</button>
            </div>
          </div>
        </main>
      </div>

      <AdminFooter />

      <ConfirmModal
        open={confirmOpen}
        title="Are you sure you want to cancel subscription for this account?"
        onConfirm={onConfirmCancel}
        onCancel={() => { setConfirmOpen(false); setTargetId(null); }}
        loading={cancelLoading}
      />
    </div>
  );
};

export default SubscribersList;
