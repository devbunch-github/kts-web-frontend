import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";
import { getSubscriptionPlans, deleteSubscriptionPackage  } from "../../api/publicApi";
import ConfirmModal from "../../components/ConfirmModal";

const SubscriptionPackages = () => {
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const nav = useNavigate();


    const requestDelete = (id) => {
        setDeletingId(id);
        setConfirmOpen(true);
    };

    const onDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            await deleteSubscriptionPackage(id);
            // refresh list (however you fetch)
            fetchPlans(); // or set state to remove item
        } catch (e) {
            alert(e?.response?.data?.message || "Delete failed.");
        }
    };

    const fetchPlans = async () => {
      try {
        const data = await getSubscriptionPlans();
        setPlans(data?.data || data || []); // Support both {data:[]} and []
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };
  // Fetch plans from Laravel API
  useEffect(() => {
    fetchPlans();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await deleteSubscriptionPackage(deletingId);

      // Axios auto-unpacks r.data; so check success flag or HTTP status
      if (res?.success || res?.message) {
        setMessage({
          type: "success",
          text: res.message || "Package deleted successfully.",
        });
        await fetchPlans();
      } else {
        throw new Error(res?.message || "Unexpected response.");
      }
    } catch (e) {
      console.error("Delete error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Delete failed.";
      setMessage({ type: "error", text: msg });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeletingId(null);
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
    }
  };

  // Filter search
  const filteredPlans = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return plans;
    return plans.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.duration?.toLowerCase().includes(term) ||
        String(p.price_minor)?.includes(term)
    );
  }, [search, plans]);

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
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
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                </svg>
              </span>
              <h1 className="text-xl font-semibold text-gray-800">
                Subscription Packages
              </h1>
            </div>

            <button 
            onClick={() => nav("/admin/subscription/add")}
            className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition">
              + Add Package
            </button>
          </div>

          {message.text && (
            <div
              className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium transition ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Card */}
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
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                Entries
              </div>

              {/* Search */}
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
              {loading ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  Loading plans...
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No subscription plans found.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-200">
                      <th className="py-3 text-left font-semibold">
                        Package Name
                      </th>
                      <th className="py-3 text-left font-semibold">Duration</th>
                      <th className="py-3 text-left font-semibold">Price</th>
                      <th className="py-3 text-left font-semibold">Features</th>
                      <th className="py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="border-b border-gray-100 hover:bg-rose-50/40 transition"
                      >
                        <td className="py-3 text-gray-800">{plan.name}</td>
                        <td className="py-3 text-gray-700 capitalize">
                          {plan.duration}
                        </td>
                        <td className="py-3 text-gray-700">
                          {plan.currency === "GBP"
                            ? "£"
                            : plan.currency === "USD"
                            ? "$"
                            : plan.currency.toUpperCase()}{" "}
                          {(plan.price_minor / 100).toFixed(2)}
                        </td>
                        <td className="py-3 text-gray-700 truncate max-w-[200px]">
                          {Array.isArray(plan.features)
                            ? plan.features.join(", ")
                            : plan.features || "-"}
                        </td>
                        <td className="py-3 flex items-center gap-4 text-sm">
                            <button
                                onClick={() => nav(`/admin/subscription/edit/${plan.id}`)}
                                className="flex items-center gap-1 text-gray-800 hover:opacity-70 transition"
                            >
                                <i className="bi bi-pencil text-base"></i>
                                <span>Edit</span>
                            </button>
                            <button
                                onClick={() => requestDelete(plan.id)}
                                className="flex items-center gap-1 text-gray-800 hover:opacity-70 transition"
                            >
                                <i className="bi bi-trash text-base"></i>
                                <span>Delete</span>
                            </button>
                        </td>
                      </tr>
                    ))}
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
      <ConfirmModal
        open={confirmOpen}
        title="Are you sure you want to delete this package?"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={deleting}
        />

        <ConfirmModal
          open={confirmOpen}
          title="Are you sure you want to delete this package?"
          message="By deleting this package, all users subscribed to it will have their subscriptions cancelled automatically. Do you want to proceed?"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setConfirmOpen(false);
            setDeletingId(null);
          }}
          loading={deleting}
        />

      <AdminFooter />
    </div>
  );
};

export default SubscriptionPackages;
