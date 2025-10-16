import React, { useState, useEffect } from "react";
import { getPaymentSettings, updatePaymentSettings } from "../../api/publicApi";
import AdminHeader from "../../components/layout/SuperAdminHeader";
import AdminSidebar from "../../components/layout/SuperAdminSidebar";
import AdminFooter from "../../components/layout/SuperAdminFooter";

const PaymentSettingsPage = () => {
  const [paypalEnabled, setPaypalEnabled] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    paypal_client_id: "",
    paypal_client_secret: "",
    paypal_email: "",
    stripe_public_key: "",
    stripe_secret_key: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    async function loadSettings() {
      try {
        const res = await getPaymentSettings();
        if (res.success && res.data) setForm(res.data);
      } catch (err) {
        console.error("Error loading payment settings", err);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("User not found!");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        user_id: user.id,
      };
      const res = await updatePaymentSettings(payload );
      if (res.success) setMessage("✅ Settings saved successfully!");
    } catch (err) {
      setMessage("❌ Failed to save settings");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5f4] flex flex-col font-[Inter]">
      <AdminHeader />
      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        <AdminSidebar />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M4 10h16" />
              </svg>
            </span>
            <h1 className="text-lg font-semibold text-gray-800">
              Payment Settings
            </h1>
          </div>

          {/* Payment Settings Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-md p-8 max-w-3xl"
          >
            {/* Paypal Section */}
            <div className="mb-10">
              <label className="flex items-center gap-2 font-medium text-gray-800 mb-4">
                <input
                  type="checkbox"
                  checked={paypalEnabled}
                  onChange={() => setPaypalEnabled(!paypalEnabled)}
                  className="accent-rose-500"
                />
                Paypal Setting
              </label>

              {paypalEnabled && (
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <label className="text-sm text-gray-700 w-56">
                      Please enter your Paypal Client ID
                    </label>
                    <input
                      type="text"
                      name="paypal_client_id"
                      value={form.paypal_client_id || ""}
                      onChange={handleChange}
                      className="border border-gray-200 rounded-md px-3 py-2 flex-1 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <label className="text-sm text-gray-700 w-56">
                      Please enter your Paypal Client Secret
                    </label>
                    <input
                      type="text"
                      name="paypal_client_secret"
                      value={form.paypal_client_secret || ""}
                      onChange={handleChange}
                      className="border border-gray-200 rounded-md px-3 py-2 flex-1 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <label className="text-sm text-gray-700 w-56">
                      Please enter your Paypal Email
                    </label>
                    <input
                      type="email"
                      name="paypal_email"
                      value={form.paypal_email || ""}
                      onChange={handleChange}
                      className="border border-gray-200 rounded-md px-3 py-2 flex-1 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stripe Section */}
            <div className="mb-10">
              <label className="flex items-center gap-2 font-medium text-gray-800 mb-4">
                <input
                  type="checkbox"
                  checked={stripeEnabled}
                  onChange={() => setStripeEnabled(!stripeEnabled)}
                  className="accent-rose-500"
                />
                Stripe Setting
              </label>

              {stripeEnabled && (
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <label className="text-sm text-gray-700 w-56">
                      Please enter your Stripe Public Key
                    </label>
                    <input
                      type="text"
                      name="stripe_public_key"
                      value={form.stripe_public_key || ""}
                      onChange={handleChange}
                      className="border border-gray-200 rounded-md px-3 py-2 flex-1 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <label className="text-sm text-gray-700 w-56">
                      Please enter your Stripe Secret Key
                    </label>
                    <input
                      type="text"
                      name="stripe_secret_key"
                      value={form.stripe_secret_key || ""}
                      onChange={handleChange}
                      className="border border-gray-200 rounded-md px-3 py-2 flex-1 text-sm focus:ring-2 focus:ring-rose-300 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            {message && (
              <p className="text-center text-sm text-green-600 mb-3">
                {message}
              </p>
            )}
            <div className="text-center">
              <button
                type="submit"
                disabled={saving}
                className="bg-rose-400 text-white text-sm font-medium rounded-md px-8 py-2 hover:bg-rose-500 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </main>
      </div>
      <AdminFooter />
    </div>
  );
};

export default PaymentSettingsPage;
