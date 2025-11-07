import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listForms, deleteForm, toggleForm } from "@/api/forms";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function BusinessFormsIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Fetch all forms
  const fetchRows = async () => {
    try {
      setLoading(true);
      const { data } = await listForms({ per_page: 50 });
      setRows(data.data || data);
    } catch {
      toast.error("Failed to load forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  // ✅ Toggle form active/inactive
  const onToggle = async (row) => {
    try {
      await toggleForm(row.id, !row.is_active);
      toast.success("Status updated");
      fetchRows();
    } catch {
      toast.error("Unable to update status");
    }
  };

  // ✅ Open delete confirmation modal
  const openConfirm = (id) => setConfirmId(id);
  const closeConfirm = () => !deleting && setConfirmId(null);

  // ✅ Confirm deletion
  const confirmDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await deleteForm(confirmId);
      toast.success("Form deleted");
      setRows((x) => x.filter((r) => r.id !== confirmId));
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[26px] font-semibold text-[#222] flex items-center gap-2">
          <i className="bi bi-ui-checks-grid text-[#c98383]/90 text-xl"></i>
          Forms
        </h1>
        <Link
          to="/dashboard/forms/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#c98383] text-white hover:bg-[#b87474] transition"
        >
          <Plus size={18} /> Add Form
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100/50 overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">Show 10 Entries</div>
          <input
            placeholder="Search"
            className="w-52 rounded-xl border border-rose-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-rose-50">
              <tr>
                <th className="text-left p-4 font-semibold">Form Name</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-center" colSpan={3}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={3}>
                    No forms found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-rose-100 hover:bg-[#faf8f8] transition"
                  >
                    <td className="p-4">{row.title}</td>
                    <td className="p-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={row.is_active}
                          onChange={() => onToggle(row)}
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-checked:bg-emerald-400 rounded-full relative transition-all">
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5" />
                        </div>
                      </label>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/dashboard/forms/${row.id}/edit`}
                          className="inline-flex items-center gap-1 text-gray-700 hover:text-rose-500"
                        >
                          <Pencil size={16} /> Edit
                        </Link>
                        <button
                          onClick={() => openConfirm(row.id)}
                          className="inline-flex items-center gap-1 text-gray-700 hover:text-rose-500"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Custom Delete Confirmation Modal */}
      {confirmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e3e3]">
                <Trash2 className="text-[#c98383]" size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[#222]">
                  Delete form?
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
                className={`rounded-lg px-4 py-2 text-sm text-white transition ${
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
