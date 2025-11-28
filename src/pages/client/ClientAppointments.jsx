// src/pages/client/ClientAppointmentsPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchClientAppointments,
  cancelClientAppointment,
  leaveClientReview,
} from "@/api/client";

const bg = "bg-[#fffaf6]";
const card =
  "bg-white rounded-2xl shadow-sm border border-[#f2e4d9]";

export default function ClientAppointmentsPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [show, setShow] = useState(10);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  // Cancel flow
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [activeCancelId, setActiveCancelId] = useState(null);

  // Simple review modal
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchClientAppointments();
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter + pagination (client-side)
  const filtered = useMemo(() => {
    if (!q) return rows;
    const term = q.toLowerCase();
    return rows.filter((r) =>
      (r.service_name || "").toLowerCase().includes(term)
    );
  }, [rows, q]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / show));
  const currentPage = Math.min(page, lastPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * show;
    return filtered.slice(start, start + show);
  }, [filtered, currentPage, show]);

  const openCancelConfirm = (id) => {
    setConfirmCancelId(id);
  };

  const closeCancelConfirm = () => {
    setConfirmCancelId(null);
  };

  const proceedCancel = () => {
    // Close confirm, open reason modal
    setActiveCancelId(confirmCancelId);
    setShowReasonModal(true);
    setConfirmCancelId(null);
  };

  const submitCancelReason = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    try {
      await cancelClientAppointment(activeCancelId, cancelReason.trim());
      toast.success("Appointment cancelled.");
      setShowReasonModal(false);
      setCancelReason("");
      setActiveCancelId(null);
      load();
    } catch (e) {
      console.error(e);
      toast.error("Unable to cancel appointment.");
    }
  };

  const openReviewModal = (row) => {
    setReviewTarget(row);
    setReviewRating(5);
    setReviewText("");
  };

  const submitReview = async () => {
    if (!reviewTarget) return;

    try {
      await leaveClientReview(reviewTarget.id, {
        rating: reviewRating,
        review: reviewText,
      });
      toast.success("Review submitted.");
      setReviewTarget(null);
      setReviewText("");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Unable to submit review.");
    }
  };

  return (
    <div className={`min-h-screen ${bg} px-6 py-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header + Add appointment (placeholder button) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#f28c38]" />
            </span>
            <h1 className="text-2xl font-semibold text-gray-900">
              Appointment
            </h1>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 rounded-lg bg-[#f28c38] text-white text-sm font-semibold hover:bg-[#e17827] transition"
            onClick={() => toast("Link to public booking flow here")}
          >
            + Add Appointment
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <select
              className="rounded-md bg-white px-2 py-1 text-sm border border-[#e8ded4]"
              value={show}
              onChange={(e) => {
                setShow(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>Entries</span>
          </div>

          <div className="relative">
            <input
              className="pl-10 pr-3 py-2 rounded-lg bg-white border border-[#e8ded4] text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#f28c38]"
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-xs text-gray-400">
              <i className="fa-solid fa-magnifying-glass" />
            </span>
          </div>
        </div>

        {/* Table card */}
        <div className={card}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#f2e4d9]">
                  {[
                    "Service Name",
                    "Amount",
                    "Date",
                    "Time",
                    "Pay Status",
                    "Pay Balance",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => {
                    const canCancel = row.can_cancel;
                    const canReschedule = row.can_reschedule;
                    const canReview = row.can_review;

                    return (
                      <tr
                        key={row.id}
                        className="border-t border-[#f7ece2] hover:bg-[#fff5ec]"
                      >
                        <td className="px-6 py-4 text-gray-800">
                          {row.service_name}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          £{Number(row.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {row.appointment_date}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {row.appointment_time}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {row.pay_status}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          £{Number(row.pay_balance || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {canReview && (
                              <button
                                className="px-3 py-1 text-xs rounded-full bg-[#fff0e3] text-[#f28c38] border border-[#f28c38]/40 hover:bg-[#f28c38] hover:text-white transition"
                                onClick={() => openReviewModal(row)}
                              >
                                Leave a review
                              </button>
                            )}

                            {canCancel && (
                              <button
                                className="px-3 py-1 text-xs rounded-full bg-[#ffe6e1] text-[#d65b3a] border border-[#f0c8bc] hover:bg-[#f28c38] hover:text-white transition"
                                onClick={() => openCancelConfirm(row.id)}
                              >
                                Cancel
                              </button>
                            )}

                            {canReschedule && (
                              <button
                                className="px-3 py-1 text-xs rounded-full bg-[#fff0e3] text-[#f28c38] border border-[#f4cba0] hover:bg-[#f28c38] hover:text-white transition"
                                onClick={() =>
                                  navigate(
                                    `/client/appointments/reschedule/${row.id}`
                                  )
                                }
                              >
                                Reschedule
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-xs text-gray-500">
              Page {currentPage} of {lastPage}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-md bg-white border border-[#e8ded4] hover:bg-gray-50 disabled:opacity-40"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-md bg-white border border-[#e8ded4] hover:bg-gray-50 disabled:opacity-40"
                disabled={currentPage >= lastPage}
                onClick={() =>
                  setPage((p) => Math.min(lastPage, p + 1))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Cancel confirm modal ===================== */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full px-8 py-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Are you sure you want to cancel
              <br />
              this appointment?
            </h3>

            <div className="mt-8 flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg border border-[#f28c38] text-[#f28c38] text-sm font-medium hover:bg-[#fff5ec]"
                onClick={closeCancelConfirm}
              >
                No
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-[#f28c38] text-white text-sm font-medium hover:bg-[#e17827]"
                onClick={proceedCancel}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Cancel reason modal ===================== */}
      {showReasonModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full px-10 py-10">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
              We&apos;re Sorry to See You Cancel!
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Your feedback helps us improve. Please share the reason for
              cancelling your appointment.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Reason
              </label>
              <textarea
                className="w-full border border-[#e6ded7] rounded-lg min-h-[160px] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#f28c38]"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div className="flex justify-center">
              <button
                className="px-10 py-2.5 rounded-lg bg-[#f28c38] text-white text-sm font-semibold hover:bg-[#e17827]"
                onClick={submitCancelReason}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Review modal (simple) ===================== */}
      {reviewTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full px-8 py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Leave a review for {reviewTarget.service_name}
            </h3>

            <div className="mb-4 text-center">
              <span className="text-sm text-gray-700 mr-2">Rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  className={`mx-0.5 text-xl ${
                    n <= reviewRating ? "text-[#f6b34a]" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className="w-full border border-[#e6ded7] rounded-lg min-h-[120px] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#f28c38] mb-5"
              placeholder="Write your feedback (optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setReviewTarget(null)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-[#f28c38] text-white text-sm font-semibold hover:bg-[#e17827]"
                onClick={submitReview}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
