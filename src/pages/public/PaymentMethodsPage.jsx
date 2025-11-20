// src/pages/public/PaymentMethodsPage.jsx

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
} from "lucide-react";

import { getAppointment, updateAppointment } from "../../api/appointment";
import { createStripeCheckout, createPayPalOrder } from "../../api/publicApi";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { subdomain, appointmentId } = useParams();

  // ----------------------------------------
  // STATES – Always at top
  // ----------------------------------------
  const [appointment, setAppointment] = useState(null);
  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);

  // ----------------------------------------
  // LOAD BEAUTICIAN
  // ----------------------------------------
  useEffect(() => {
    async function loadBeautician() {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];

        if (b) {
          setBeautician(b);
          setAccountId(b.account_id);

          window.__currentAccountId = b.account_id;
          localStorage.setItem("public_account_id", String(b.account_id));
        }
      } catch (err) {
        console.error("Beautician load error:", err);
      }
    }

    loadBeautician();
  }, [subdomain]);

  // ----------------------------------------
  // LOAD BUSINESS SETTINGS
  // ----------------------------------------
  useEffect(() => {
    async function loadSettings() {
      if (!accountId) return;

      try {
        const settings = await getBusinessSetting("site", accountId);
        setBusinessSettings(settings || {});
      } catch (err) {
        console.error("Business settings load error:", err);
      }
    }

    loadSettings();
  }, [accountId]);

  // ----------------------------------------
  // LOAD APPOINTMENT
  // ----------------------------------------
  useEffect(() => {
    async function loadAppointment() {
      try {
        const accId =
          window.__currentAccountId ||
          localStorage.getItem("public_account_id");

        if (!accId) {
          console.error("❌ No account ID found for payment page");
          setLoading(false);
          return;
        }

        const data = await getAppointment(appointmentId, accId);
        setAppointment(data);
      } catch (err) {
        console.error("Failed to load appointment:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [appointmentId]);

  // ----------------------------------------
  // COMPUTED VALUES
  // ----------------------------------------
  const service = appointment?.service;
  const employee = appointment?.employee;

  const totalAmount = useMemo(() => {
    const finalAmt = Number(appointment?.FinalAmount ?? 0);
    if (finalAmt > 0) return finalAmt;

    const srv = Number(service?.TotalPrice ?? 0);
    return srv;
  }, [appointment, service]);

  const finalLogo =
    businessSettings?.logo_url ||
    beautician?.logo_url ||
    "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url ||
    beautician?.cover_url ||
    "/images/dummy/dummy.png";

  // ----------------------------------------
  // CONFIRM PAYMENT
  // ----------------------------------------
  const handleConfirm = async () => {
    try {
      const payload = {
        appointment_id: appointment.Id,
        account_id: appointment.AccountId,
        amount: totalAmount,
        subdomain: subdomain,  // <-- REQUIRED
      };

      if (method === "card") {
        const res = await createStripeCheckout(payload);
        if (res?.url) window.location.href = res.url;
        return;
      }

      if (method === "paypal") {
        const res = await createPayPalOrder(payload);
        if (res?.approval_url) window.location.href = res.approval_url;
        return;
      }

      if (method === "venue") {
        await updateAppointment(appointmentId, { Status: "Unpaid" });
        navigate(`/${subdomain}/booking/confirmation/${appointmentId}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };


  // ----------------------------------------
  // UI RENDERING — safe AFTER ALL HOOKS
  // ----------------------------------------
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-500">
        Loading payment data...
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-10 text-center text-red-500">
        Appointment not found.
      </div>
    );
  }

  // ----------------------------------------
  // PAYMENT OPTION COMPONENT
  // ----------------------------------------
  const PaymentOption = ({ value, label, icon }) => (
    <button
      onClick={() => setMethod(value)}
      className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border mb-3 transition ${
        method === value
          ? "border-[#E86C28] bg-[#fff7f2]"
          : "border-gray-200 hover:border-[#E86C28]/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          checked={method === value}
          onChange={() => setMethod(value)}
          className="accent-[#E86C28]"
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-gray-500">{icon}</div>
    </button>
  );

  // ----------------------------------------
  // FINAL RETURN — SAFE HIERARCHY
  // ----------------------------------------
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            <img
              src={finalLogo}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* COVER */}
      <div className="w-full h-[350px] mt-[80px] overflow-hidden relative">
        <img
          src={finalCover}
          className="w-full h-full object-cover brightness-[0.65]"
          alt="Cover"
        />
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-semibold drop-shadow-lg">
          Payment Methods
        </h1>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10 px-6 py-14">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl p-8 shadow">
            <PaymentOption
              value="card"
              label="Credit / Debit Card"
              icon={<CreditCard className="w-5 h-5 text-[#E86C28]" />}
            />

            <PaymentOption
              value="paypal"
              label="PayPal"
              icon={<img src="/images/icons/paypal-btn.png" className="h-6" />}
            />

            <PaymentOption
              value="venue"
              label="Pay at Venue"
              icon={<Wallet className="w-5 h-5 text-gray-500" />}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex gap-4">
              <img
                src={service?.ImagePath}
                className="w-20 h-20 rounded-lg object-cover"
                alt=""
              />
              <div>
                <h3 className="font-semibold">{service?.Name}</h3>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin size={12} />
                  {beautician?.city}, {beautician?.country}
                </p>
              </div>
            </div>

            <div className="border-t mt-4 pt-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} />{" "}
                {appointment.StartDateTime?.split("T")[0]}
              </div>

              <div className="flex items-center gap-2 text-gray-700 mt-2">
                <Clock size={14} />{" "}
                {appointment.StartDateTime?.split("T")[1]}
              </div>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-semibold">£{totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-[#E86C28] text-white mt-6 py-3 rounded-full"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">Octane</span>
      </footer>
    </div>
  );
}
