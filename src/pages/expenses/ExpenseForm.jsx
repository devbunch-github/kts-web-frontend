import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createExpense,
  updateExpense,
  getExpense,
  listCategories,
  uploadReceipt,
  deleteReceipt,
} from "../../api/expense";
import Spinner from "../../components/Spinner";

export default function ExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // ---------- State ----------
  const [categories, setCategories] = useState([]);
  const [loadingForm, setLoadingForm] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    category_id: "",
    supplier: "",
    amount: "",
    paid_date_time: "",
    notes: "",
    payment_method: "Cash",
    receipt_id: "",
    recurring: "",
  });

  const [files, setFiles] = useState([]);
  const [confirmFileId, setConfirmFileId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showRecurring = useMemo(() => Boolean(form.recurring), [form.recurring]);

  // ---------- Helpers ----------
  const setVal = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const localDateYYYYMMDD = () => {
    const now = new Date();
    const tzAdj = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return tzAdj.toISOString().slice(0, 10);
  };

  // ---------- Init Load ----------
  useEffect(() => {
    (async () => {
      try {
        const catRes = await listCategories();
        const list = Array.isArray(catRes?.data) ? catRes.data : catRes;
        setCategories(list ?? []);

        if (isEdit) {
          setLoadingForm(true);
          const r = await getExpense(id);
          const data = r?.data ?? r ?? {};
          setForm({
            category_id: String(data.category_id ?? ""),
            supplier: data.supplier ?? "",
            amount: data.amount ?? "",
            paid_date_time: data.paid_date_time
              ? String(data.paid_date_time).slice(0, 10)
              : "",
            notes: data.notes ?? "",
            payment_method: data.payment_method ?? "Cash",
            receipt_id: data.receipt_id ?? "",
            recurring: data.recurring ?? "",
          });
          setFiles(data.files ?? []);
        } else {
          setForm((s) => ({
            ...s,
            paid_date_time: localDateYYYYMMDD(),
          }));
        }
      } finally {
        setLoadingForm(false);
      }
    })();
  }, [id, isEdit]);

  // ---------- File Upload (Multiple with instant preview) ----------
  const handleFiles = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (!fileList.length) return;

    // Show instant previews before upload
    const previewFiles = fileList.map((f) => ({
      id: Math.random(),
      name: f.name,
      url: URL.createObjectURL(f),
      isLocal: true,
    }));
    setFiles((prev) => [...prev, ...previewFiles]);

    setUploading(true);
    try {
      // Convert to Base64 for upload
      const base64Array = await Promise.all(
        fileList.map(
          (f) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(f);
            })
        )
      );

      const uploaded = await uploadReceipt({
        formFile: base64Array,
        existing_receipt_id: form.receipt_id || 0,
      });

      // Update receipt group id
      const newReceiptId = uploaded?.id ?? uploaded?.data?.id ?? "";
      setVal("receipt_id", newReceiptId);

      // Replace with actual URLs from backend response
      if (uploaded?.files?.length) {
        setFiles(uploaded.files);
      } else if (isEdit) {
        const r = await getExpense(id);
        setFiles(r?.data?.files ?? []);
      }

      toast.success("Files uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ---------- Cleanup local URLs ----------
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.isLocal) URL.revokeObjectURL(f.url);
      });
    };
  }, [files]);

  // ---------- File Delete Flow ----------
  const openConfirmFile = (fid) => setConfirmFileId(fid);
  const closeConfirmFile = () => !deleting && setConfirmFileId(null);

  const confirmDeleteFile = async () => {
    if (!confirmFileId) return;
    setDeleting(true);
    try {
      await deleteReceipt(confirmFileId);
      setFiles((prev) => prev.filter((f) => f.id !== confirmFileId));
      toast.success("File deleted.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete file.");
    } finally {
      setDeleting(false);
      setConfirmFileId(null);
    }
  };

  // ---------- Save ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        amount: Number(form.amount || 0),
      };
      if (isEdit) await updateExpense(id, payload);
      else await createExpense(payload);
      toast.success("Expense saved successfully");
      navigate("/dashboard/expense");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="p-6 min-h-screen bg-[#faf8f8] relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#f0dede] text-[#a96464] hover:bg-[#fff7f7]"
        >
          ‹
        </button>
        <h1 className="text-[26px] font-semibold text-[#222]">
          {isEdit ? "Edit Expense" : "Add New Expense"}
        </h1>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 md:p-8"
      >
        {loadingForm ? (
          <div className="flex items-center justify-center h-40 text-[#c98383]">
            <Spinner className="h-6 w-6 mr-2" /> Loading…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm text-[#333] mb-2">
                  Select Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setVal("category_id", e.target.value)}
                  className="w-full h-[48px] px-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
                >
                  <option value="">e.g Hair Color</option>
                  {categories.map((c) => (
                    <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                      {c.name ?? c.Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm text-[#333] mb-2">Supplier</label>
                <input
                  type="text"
                  placeholder="e.g Accountancy"
                  value={form.supplier}
                  onChange={(e) => setVal("supplier", e.target.value)}
                  className="w-full h-[48px] px-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-[#333] mb-2">
                  Expense Amount
                </label>
                <input
                  type="number"
                  placeholder="e.g. £87.00"
                  value={form.amount}
                  onChange={(e) => setVal("amount", e.target.value)}
                  className="w-full h-[48px] px-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none [appearance:textfield]"
                  required
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm text-[#333] mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={form.paid_date_time}
                  onChange={(e) => setVal("paid_date_time", e.target.value)}
                  className="w-full h-[48px] px-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
                  required
                />
              </div>

              {/* Upload (Multi) */}
              <div className="md:col-span-2">
                <label className="block text-sm text-[#333] mb-2">
                  Attach Files
                </label>
                <div className="border border-[#e8e2e2] rounded-xl p-4 bg-[#fffafa]">
                  <label className="flex items-center justify-center gap-3 cursor-pointer hover:bg-[#faf7f7] rounded-lg p-3 border border-dashed border-[#e8e2e2]">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFiles}
                      accept="image/*,.pdf,.jpg,.jpeg,.png"
                    />
                    {uploading ? (
                      <span className="inline-flex items-center gap-2 text-[#333]">
                        <Spinner className="h-4 w-4" /> Uploading…
                      </span>
                    ) : (
                      <>
                        <i className="bi bi-paperclip text-[#c98383] text-lg"></i>
                        <span className="text-sm text-[#666]">
                          Click to upload files
                        </span>
                      </>
                    )}
                  </label>

                  {/* File previews */}
                  {files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {files.map((f) => (
                        <div
                          key={f.id}
                          className="relative w-24 h-24 rounded-lg border border-[#e4dada] overflow-hidden group"
                        >
                          {f.url && f.url.match(/\.pdf$/i) ? (
                            <div className="flex flex-col items-center justify-center h-full text-xs text-center text-[#555] p-2">
                              <i className="bi bi-file-earmark-pdf text-rose-400 text-xl mb-1"></i>
                              <span className="truncate">{f.name}</span>
                            </div>
                          ) : f.url ? (
                            <img
                              src={f.url}
                              alt={f.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-[#aaa] text-xs">
                              {f.name}
                            </div>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => openConfirmFile(f.id)}
                            className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5 h-5 text-xs hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm text-[#333] mb-2">Note</label>
                <textarea
                  placeholder="Enter note"
                  value={form.notes}
                  onChange={(e) => setVal("notes", e.target.value)}
                  className="w-full min-h-[84px] px-3 py-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
                />
              </div>
            </div>

            {/* Recurring */}
            <div className="mt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#333]">
                  Is Recurring?
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setVal("recurring", showRecurring ? "" : "monthly")
                  }
                  className={`h-7 w-12 rounded-full relative transition ${
                    showRecurring ? "bg-[#C08080]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-6 w-6 bg-white rounded-full shadow transition-all ${
                      showRecurring ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                {showRecurring && (
                  <select
                    value={form.recurring}
                    onChange={(e) => setVal("recurring", e.target.value)}
                    className="h-[40px] px-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="4_weeks">Every 4 Weeks</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
              {showRecurring && (
                <p className="mt-2 text-xs text-[#777]">
                  The next occurrence will be calculated from the payment date.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={saving || uploading}
                className={`h-[48px] rounded-2xl px-8 text-white font-semibold transition inline-flex items-center gap-2 ${
                  saving || uploading
                    ? "bg-[#c98383]/60 cursor-not-allowed"
                    : "bg-[#c98383] hover:bg-[#b87474]"
                }`}
              >
                {saving ? (
                  <>
                    <Spinner className="h-4 w-4" /> Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Confirm Delete File Modal */}
      {confirmFileId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={closeConfirmFile}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e3e3]">
                <i className="bi bi-trash text-[#c98383] text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-[#222]">
                  Delete file?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirmFile}
                disabled={deleting}
                className="rounded-lg border border-[#e8e2e2] px-4 py-2 text-sm text-[#333] hover:bg-[#faf7f7] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
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
