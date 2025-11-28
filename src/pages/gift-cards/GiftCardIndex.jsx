import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listGiftCards, deleteGiftCard } from "@/api/giftCards";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const roseBg = "bg-[#F6EAEA]";
const roseBtn = "bg-[#D49A9A] hover:bg-[#C38888]";
const textDark = "text-[#2F2F2F]";
const softBorder = "border border-[#F0E6E6]";

const StatusPill = ({ label }) => {
  const active =
    label?.toLowerCase() === "active" || label?.toLowerCase() === "valid";
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
        active ? "bg-[#E9F7EF] text-[#1E7E34]" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
};

export default function GiftCardIndex() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [show, setShow] = useState(10);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchList = async (p = 1) => {
    setLoading(true);
    try {
      const res = await listGiftCards({
        per_page: show,
        page: p,
        q: q || undefined,
        status: status === "all" ? undefined : status,
      });
      const items = Array.isArray(res?.data?.data)
        ? res.data.data
        : res?.data || [];
      setRows(items);
      setMeta(res?.data?.meta || {});
    } catch {
      toast.error("Failed to load gift cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, status]);

  const onSearch = (e) => {
    e.preventDefault();
    fetchList(1);
  };

  // Confirm modal
  const openConfirm = (id) => setConfirmId(id);
  const closeConfirm = () => {
    if (!deleting) setConfirmId(null);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await deleteGiftCard(confirmId);
      setRows((prev) => prev.filter((r) => r.id !== confirmId));
      toast.success("Gift card deleted successfully!");
      setTimeout(() => {
        if (rows.length === 1 && meta.current_page > 1) {
          fetchList(meta.current_page - 1);
        }
      }, 0);
    } catch {
      toast.error("Failed to delete gift card.");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const headerCell =
    "px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider";
  const cell = "px-6 py-4 whitespace-nowrap text-sm " + textDark;

  return (
    <div className={`min-h-screen ${roseBg}`}>
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#C48A8A]" />
            </span>
            <h1 className="text-2xl font-semibold" style={{ color: textDark }}>
              Gift Cards
            </h1>
          </div>

          <button
            onClick={() => navigate("/dashboard/gift-cards/new")}
            className={`inline-flex items-center gap-2 text-white px-4 py-2 rounded-md shadow-sm ${roseBtn}`}
          >
            <Plus className="h-4 w-4" /> Add Gift Card
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Show</label>
            <select
              className="rounded-md bg-white px-2 py-1 text-sm shadow-sm"
              value={show}
              onChange={(e) => setShow(Number(e.target.value))}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">Entries</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-md bg-white px-3 py-2 text-sm shadow-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>

            <form onSubmit={onSearch} className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                className="pl-9 pr-3 py-2 rounded-md bg-white text-sm shadow-sm w-64"
                placeholder="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>
          </div>
        </div>

        {/* Table */}
        <div
          className={`mt-5 overflow-hidden rounded-xl bg-white shadow-sm ${softBorder}`}
        >
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className={headerCell}>Title</th>
                <th className={headerCell}>Code</th>
                <th className={headerCell}>Service</th>
                <th className={headerCell}>Discount</th>
                <th className={headerCell}>Start Date</th>
                <th className={headerCell}>End Date</th>
                <th className={headerCell}>Status</th>
                <th className={headerCell}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-sm text-gray-500">
                    No gift cards found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/40 transition">
                    <td className={cell}>{r.title}</td>
                    <td className={cell}>{r.code}</td>
                    <td className={cell}>{r.service || "All services"}</td>
                    <td className={cell}>
                      {r.discount_type === "percentage"
                        ? `${r.discount_amount}%`
                        : `£${r.discount_amount}`}
                    </td>
                    <td className={cell}>{r.start_date || "-"}</td>
                    <td className={cell}>{r.end_date || "-"}</td>
                    <td className={cell}>
                      <StatusPill label={r.status ?? "Active"} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <button
                          className="flex items-center gap-1 text-[#2F2F2F] hover:opacity-80"
                          onClick={() =>
                            navigate(`/dashboard/gift-cards/edit/${r.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button
                          className="flex items-center gap-1 text-[#2F2F2F] hover:opacity-80"
                          onClick={() => navigate(`/dashboard/gift-cards/view/${r.id}`)}
                        >
                          <Eye className="h-4 w-4" /> Usage
                        </button>

                        <button
                          onClick={() => openConfirm(r.id)}
                          className="flex items-center gap-1 text-[#2F2F2F] hover:opacity-80"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="text-sm text-gray-600">
              Page {meta?.current_page ?? 1} of {meta?.last_page ?? 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-40"
                onClick={() => {
                  const p = Math.max(1, (meta?.current_page ?? 1) - 1);
                  setPage(p);
                  fetchList(p);
                }}
                disabled={(meta?.current_page ?? 1) <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="p-2 rounded-md bg-white border hover:bg-gray-50 disabled:opacity-40"
                onClick={() => {
                  const p = Math.min(
                    meta?.last_page ?? 1,
                    (meta?.current_page ?? 1) + 1
                  );
                  setPage(p);
                  fetchList(p);
                }}
                disabled={(meta?.current_page ?? 1) >= (meta?.last_page ?? 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e3e3]">
                <Trash2 className="text-[#c98383] w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[#222]">
                  Delete gift card?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={deleting}
                className="rounded-lg border border-[#e8e2e2] px-4 py-2 text-sm text-[#333] hover:bg-[#faf7f7] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className={`rounded-lg px-4 py-2 text-sm text-white ${
                  deleting
                    ? "bg-[#c98383]/70 cursor-not-allowed"
                    : "bg-[#c98383] hover:bg-[#b87474]"
                }`}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
