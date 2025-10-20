import { useEffect, useState } from "react";
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

  const [categories, setCategories] = useState([]);
  const [fileName, setFileName] = useState("");
  const [showRecurring, setShowRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    listCategories().then((r) => setCategories(r.data ?? r));
    if (isEdit) {
      getExpense(id).then((res) => {
        const data = res.data ?? res;
        setForm({
          ...data,
          paid_date_time: data.paid_date_time
            ? data.paid_date_time.slice(0, 10)
            : "",
        });
        setShowRecurring(!!data.recurring);
      });
    }
  }, [id]);

  const setVal = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const uploaded = await uploadReceipt({ formFile: [reader.result] });
        setVal("receipt_id", uploaded.id);
        setFileName(f.name);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await updateExpense(id, form);
      else await createExpense(form);
      navigate("/dashboard/expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#FBF6F6] min-h-screen rounded-2xl shadow p-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/dashboard/expense")}
          className="h-9 w-9 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-gray-700 hover:bg-gray-50"
        >
          ‹
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Edit New Expense" : "Add New Expense"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-5">
            <div>
              <label className="block font-medium mb-1">Select Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setVal("category_id", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">e.g Hair Color</option>
                {categories.map((c) => (
                  <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                    {c.name ?? c.Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Expense Amount</label>
              <input
                type="number"
                placeholder="e.g £87.00"
                value={form.amount}
                onChange={(e) => setVal("amount", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Attach a file</label>
              <label className="border rounded-xl flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50">
                <input type="file" className="hidden" onChange={handleFile} />
                {uploading ? (
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <Spinner /> Uploading…
                  </span>
                ) : (
                  <>
                    <span className="text-2xl">📎</span>
                    <span className="text-sm text-gray-600">
                      {fileName || "Upload file"}
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <div>
              <label className="block font-medium mb-1">Supplier</label>
              <input
                type="text"
                placeholder="e.g Accountancy"
                value={form.supplier}
                onChange={(e) => setVal("supplier", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Payment Date</label>
              <input
                type="date"
                value={form.paid_date_time}
                onChange={(e) => setVal("paid_date_time", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Note</label>
              <textarea
                value={form.notes}
                onChange={(e) => setVal("notes", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Recurring Row */}
        <div className="mt-6 flex items-center gap-4">
          <span className="font-medium">Is Recurring?</span>
          <button
            type="button"
            onClick={() => {
              const newVal = !showRecurring;
              setShowRecurring(newVal);
              if (!newVal) setVal("recurring", "");
            }}
            className={`h-7 w-12 rounded-full relative transition ${
              showRecurring ? "bg-[#C08080]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 bg-white rounded-full shadow transition-all ${
                showRecurring ? "translate-x-5" : ""
              }`}
            ></span>
          </button>

          {showRecurring && (
            <select
              value={form.recurring}
              onChange={(e) => setVal("recurring", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Tenure</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="4_weeks">Every 4 Weeks</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-8 py-2.5 rounded-lg text-white font-semibold hover:opacity-95 disabled:opacity-70 inline-flex items-center gap-2"
            style={{ backgroundColor: "#C08080" }}
          >
            {saving ? <><Spinner className="h-4 w-4" /> Saving…</> : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
