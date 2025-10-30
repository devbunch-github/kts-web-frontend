import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Save, XCircle, CheckCircle } from "lucide-react";
import { fetchAccountantIncomeById, updateAccountantIncome } from "../../api/accountantdashboard";

export default function AccountantIncomeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Description: "",
    Amount: "",
    PaymentMethod: "",
    PaymentDateTime: "",
    reason: "",
  });

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIncome();
  }, []);

  const loadIncome = async () => {
    try {
      const res = await fetchAccountantIncomeById(id);
      setForm({
        Description: res.Description || "",
        Amount: res.Amount || "",
        PaymentMethod: res.PaymentMethod || "",
        PaymentDateTime: res.PaymentDateTime
          ? res.PaymentDateTime.split(" ")[0]
          : "",
        reason: "",
      });
    } catch {
      showAlert("error", "Failed to load income record.");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      showAlert("error", "Edit reason is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await updateAccountantIncome(id, form);
      showAlert("success", res.message);
      setTimeout(() => navigate("/accountant/income"), 1500);
    } catch {
      showAlert("error", "Failed to update income record.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        Loading record...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fffaf6] p-6 font-[Poppins,sans-serif]">
      {/* Alert */}
      {alert.message && (
        <div
          className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-3 rounded-xl shadow-md z-50 text-sm ${
            alert.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
          <Pencil className="w-6 h-6 text-[#f28c38]" /> Edit Income
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="Description"
              value={form.Description}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#f28c38]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (£)
            </label>
            <input
              type="number"
              name="Amount"
              value={form.Amount}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#f28c38]"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <input
              type="text"
              name="PaymentMethod"
              value={form.PaymentMethod}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#f28c38]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              name="PaymentDateTime"
              value={form.PaymentDateTime}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#f28c38]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-rose-700">
              Reason for Edit <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Please specify the reason for editing this record..."
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#f28c38] min-h-[80px]"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/accountant/income")}
              className="px-6 py-2 rounded-md border text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-md bg-[#f28c38] text-white hover:bg-[#d97a2f] transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
