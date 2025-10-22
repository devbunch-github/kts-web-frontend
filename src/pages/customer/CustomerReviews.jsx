import { useEffect, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getCustomerReviews,
  updateCustomerReviewStatus,
  deleteCustomerReview,
  bulkUpdateCustomerReviewStatus,
} from "../../api/customer";
import { Trash2 } from "lucide-react";

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, newStatus: null, type: null });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchData = async () => {
    setPageLoading(true);
    try {
      const res = await getCustomerReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleStatus = (id, newStatus) => {
    setConfirmModal({ open: true, id, newStatus, type: "status" });
  };

  const confirmStatusChange = async () => {
    setLoading(true);
    const { id, newStatus } = confirmModal;
    try {
      await updateCustomerReviewStatus(id, newStatus);
      setReviews(prev => prev.map(r => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setLoading(false);
      setConfirmModal({ open: false, id: null, newStatus: null, type: null });
    }
  };

  const handleBulkUpdate = (newStatus) => {
    if (selected.length === 0) return;
    setConfirmModal({ open: true, id: null, newStatus, type: "bulk" });
  };

  const confirmBulkUpdate = async () => {
    setLoading(true);
    try {
      await bulkUpdateCustomerReviewStatus(selected, confirmModal.newStatus);
      setReviews(prev =>
        prev.map(r =>
          selected.includes(r.id) ? { ...r, status: confirmModal.newStatus } : r
        )
      );
      setSelected([]);
    } catch (err) {
      console.error("Bulk update failed", err);
    } finally {
      setLoading(false);
      setConfirmModal({ open: false, id: null, newStatus: null, type: null });
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({ open: true, id, type: "delete" });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await deleteCustomerReview(confirmModal.id);
      setReviews(prev => prev.filter(x => x.id !== confirmModal.id));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setLoading(false);
      setConfirmModal({ open: false, id: null, type: null });
    }
  };

  const toggleSelectAll = (checked) => {
    if (checked) setSelected(reviews.map(r => r.id));
    else setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="h-8 w-8 flex items-center justify-center bg-rose-100 rounded-lg">
              <svg width="18" height="18" stroke="#a8626b" strokeWidth="1.5" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            Reviews
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkUpdate(true)}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              Activate Selected
            </button>
            <button
              onClick={() => handleBulkUpdate(false)}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Deactivate Selected
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {pageLoading ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 border-b border-gray-200">
                  <th className="py-3 pl-2">
                    <input
                      type="checkbox"
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      checked={selected.length === reviews.length && reviews.length > 0}
                    />
                  </th>
                  <th className="py-3 text-left font-semibold">Full Name</th>
                  <th className="py-3 text-left font-semibold">Service Name</th>
                  <th className="py-3 text-left font-semibold">Ratings</th>
                  <th className="py-3 text-left font-semibold">Review</th>
                  <th className="py-3 text-left font-semibold">Status</th>
                  <th className="py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-rose-50/40 transition">
                    <td className="py-3 pl-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={() => toggleSelect(r.id)}
                      />
                    </td>
                    <td className="py-3 text-gray-800">{r.full_name}</td>
                    <td className="py-3 text-gray-700">{r.service_name}</td>
                    <td className="py-3 text-gray-700">{r.rating}/5</td>
                    <td className="py-3 text-gray-700">{r.review}</td>
                    <td className="py-3 text-gray-700">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={r.status}
                          onChange={(e) => toggleStatus(r.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-checked:bg-rose-400 rounded-full relative transition">
                          <div
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${
                              r.status ? "translate-x-4" : ""
                            }`}
                          ></div>
                        </div>
                      </label>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-gray-800 hover:text-rose-500 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={15} strokeWidth={1.6} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={
          confirmModal.type === "status"
            ? `Are you sure you want to ${confirmModal.newStatus ? "activate" : "deactivate"} this review?`
            : confirmModal.type === "bulk"
            ? `Are you sure you want to ${confirmModal.newStatus ? "activate" : "deactivate"} selected reviews?`
            : "Are you sure you want to delete this review?"
        }
        onConfirm={
          confirmModal.type === "status"
            ? confirmStatusChange
            : confirmModal.type === "bulk"
            ? confirmBulkUpdate
            : confirmDelete
        }
        onCancel={() => setConfirmModal({ open: false, id: null, newStatus: null, type: null })}
        loading={loading}
      />
    </div>
  );
}
