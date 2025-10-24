import { useState } from "react";
import { resetAccountantPassword } from "../../api/accountant";

export default function ResetPasswordModal({ open, onClose, accountantId }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }
    try {
      setLoading(true);
      const res = await resetAccountantPassword(accountantId, { password, password_confirmation: confirm });
      setMessage({ text: res.message, type: "success" });
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setMessage({ text: err?.response?.data?.message || "Failed to reset password", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Reset Password</h2>

        {message && (
          <div
            className={`mb-3 text-sm text-center font-medium p-2 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:ring-2 focus:ring-rose-300"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-rose-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b77272] hover:bg-[#a25d5d] text-white rounded-md py-2 font-medium transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
