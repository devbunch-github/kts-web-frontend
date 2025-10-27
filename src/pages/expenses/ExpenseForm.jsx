import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createExpense,
  updateExpense,
  getExpense,
  listCategories,
  uploadReceipt,
} from "../../api/expense";
import Spinner from "../../components/Spinner";

export default function ExpenseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // ---------- State ----------
  const [categories, setCategories] = useState([]);
  const [loadingForm, setLoadingForm] = useState(isEdit); // show loader only when editing
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
    recurring: "", // '', 'weekly', 'fortnightly', '4_weeks', 'monthly'
  });

  const [fileName, setFileName] = useState("");

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
          setFileName(data.receipt_name ?? ""); // if your API sends it
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

  // ---------- File Upload ----------
  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Your API expects { formFile: [base64] }
          const uploaded = await uploadReceipt({ formFile: [reader.result] });
          // assume uploaded => { id: ... }
          setVal("receipt_id", uploaded?.id ?? uploaded?.data?.id ?? "");
          setFileName(f.name);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(f);
    } catch {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setVal("receipt_id", "");
    setFileName("");
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
        paid_date_time: form.paid_date_time, // 'YYYY-MM-DD'
        // payment_method kept as-is ("Cash" | "Bank")
      };

      if (isEdit) await updateExpense(id, payload);
      else await createExpense(payload);

      navigate("/dashboard/expense");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="p-6 min-h-screen bg-[#faf8f8]">
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
              {/* Select Category */}
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
                  className="w-full h-[48px] px-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

              {/* Upload */}
              <div className="md:col-span-1">
                <label className="block text-sm text-[#333] mb-2">
                  Attach a file
                </label>
                <div className="border border-[#e8e2e2] rounded-xl overflow-hidden">
                  <label className="w-full h-[84px] flex items-center justify-center gap-3 cursor-pointer hover:bg-[#faf7f7]">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFile}
                      accept="image/*,.pdf,.jpg,.jpeg,.png"
                    />
                    {uploading ? (
                      <span className="inline-flex items-center gap-2 text-[#333]">
                        <Spinner className="h-4 w-4" /> Uploading…
                      </span>
                    ) : fileName ? (
                      <span className="text-sm text-[#333] truncate max-w-[70%]">
                        {fileName}
                      </span>
                    ) : (
                      <>
                        <i className="bi bi-paperclip text-[#c98383] text-lg"></i>
                        <span className="text-sm text-[#666]">Upload file</span>
                      </>
                    )}
                  </label>
                  {fileName && !uploading && (
                    <div className="border-t border-[#f1eded] px-3 py-2 flex justify-between items-center">
                      <span className="text-xs text-[#666] truncate">{fileName}</span>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-xs text-[#c98383] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-1">
                <label className="block text-sm text-[#333] mb-2">Note</label>
                <textarea
                  placeholder="Enter note"
                  value={form.notes}
                  onChange={(e) => setVal("notes", e.target.value)}
                  className="w-full min-h-[84px] px-3 py-3 rounded-xl border border-[#e8e2e2] bg-white focus:ring-1 focus:ring-[#c98383]/70 outline-none"
                />
              </div>
            </div>

            {/* Recurring Section */}
            <div className="mt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#333]">Is Recurring?</span>

                {/* Toggle */}
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

                {/* Frequency */}
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
    </div>
  );
}
