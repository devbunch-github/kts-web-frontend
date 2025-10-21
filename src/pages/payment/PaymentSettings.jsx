import { useEffect, useState } from "react";
import {
  getPaymentSettings,
  updatePaymentSettings,
} from "../../api/publicApi";

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [settings, setSettings] = useState({
    user_id: "",
    paypal_active: false,
    paypal_client_id: "",
    paypal_client_secret: "",
    paypal_email: "",
    stripe_active: false,
    stripe_public_key: "",
    stripe_secret_key: "",
    pay_at_venue: false,
  });

  // Load settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUser =
            JSON.parse(localStorage.getItem("user")) ||
            JSON.parse(localStorage.getItem("applive_user")) ||
            null;

        if (storedUser?.id) {
        setSettings((s) => ({ ...s, user_id: storedUser.id }));
        }

        const res = await getPaymentSettings();
        if (res?.success && res.data) {
          setSettings((prev) => ({
            ...prev,
            ...res.data,
            user_id: storedUser?.id || prev.user_id,
          }));
        }
      } catch (err) {
        console.error("Failed to load payment settings", err);
        setMessage({
          text: "Failed to load payment settings.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-hide message
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updatePaymentSettings(settings);
      if (res?.success) {
        setMessage({ text: res.message, type: "success" });
      } else {
        setMessage({ text: "Failed to save settings.", type: "error" });
      }
    } catch (err) {
      console.error("Failed to update payment settings", err);
      setMessage({ text: "Something went wrong.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8626b"
              strokeWidth="1.5"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </span>
          <h1 className="text-xl font-semibold text-gray-800">Payment</h1>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PayPal Section */}
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="paypal_active"
                  checked={!!settings.paypal_active}
                  onChange={handleChange}
                  className="accent-rose-500 h-4 w-4"
                />
                Paypal Setting
              </label>

              <div className="space-y-3 pl-5">
                <InputField
                  label="Please enter your Paypal Client ID"
                  name="paypal_client_id"
                  value={settings.paypal_client_id}
                  onChange={handleChange}
                />
                <InputField
                  label="Please enter your Paypal Client Secret"
                  name="paypal_client_secret"
                  value={settings.paypal_client_secret}
                  onChange={handleChange}
                />
                <InputField
                  label="Please enter your Paypal Email"
                  name="paypal_email"
                  value={settings.paypal_email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Stripe Section */}
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="stripe_active"
                  checked={!!settings.stripe_active}
                  onChange={handleChange}
                  className="accent-rose-500 h-4 w-4"
                />
                Stripe Setting
              </label>

              <div className="space-y-3 pl-5">
                <InputField
                  label="Please enter your Stripe Client ID"
                  name="stripe_public_key"
                  value={settings.stripe_public_key}
                  onChange={handleChange}
                />
                <InputField
                  label="Please enter your Stripe Client Secret"
                  name="stripe_secret_key"
                  value={settings.stripe_secret_key}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Pay at Venue */}
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
              <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="pay_at_venue"
                  checked={!!settings.pay_at_venue}
                  onChange={handleChange}
                  className="accent-rose-500 h-4 w-4"
                />
                Pay at venue
              </label>
              {/* Info Text Below */}
            <div className="mt-6 text-gray-500 text-sm space-y-1">
                <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-gray-400">
                    <i className="bi bi-info-circle"></i>
                    </span>
                    <span>Global deposit min / default £10</span>
                </div>
                <div className="ml-3.5 flex items-start gap-2">
                    <span className="mt-0.5 text-gray-400">
                    </span>
                    <span>Global deposit min % default to 20%</span>
                </div>
            </div>
            </div>
            {/* Feedback message */}
            {message.text && (
            <div
                className={`mb-5 p-3 rounded-md text-sm font-medium ${
                message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
                {message.text}
            </div>
            )}
            {/* Submit Button */}
            <div className="text-right">
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-2.5 rounded-lg bg-rose-400 text-white font-medium hover:bg-rose-500 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Input component
const InputField = ({ label, name, value, onChange }) => (
  <div>
    <label className="text-gray-700 text-sm">{label}</label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-rose-300 outline-none"
    />
  </div>
);
