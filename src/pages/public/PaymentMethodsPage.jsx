// src/pages/public/PaymentMethodsPage.jsx

import { useEffect, useState } from "react";
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

  const [appointment, setAppointment] = useState(null);
  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);

  // ======================================
  // 1. LOAD BEAUTICIAN + ACCOUNT
  // ======================================
  useEffect(() => {
    const loadBeautician = async () => {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];

        if (b) {
          setBeautician(b);
          setAccountId(b.account_id);
          window.__currentAccountId = b.account_id;
        }
      } catch (err) {
        console.error("Beautician load error:", err);
      }
    };

    loadBeautician();
  }, [subdomain]);

  // ======================================
  // 2. LOAD BUSINESS SETTINGS
  // ======================================
  useEffect(() => {
    if (!accountId) return;

    const loadSettings = async () => {
      try {
        const settings = await getBusinessSetting("site", accountId);
        setBusinessSettings(settings || {});
      } catch (err) {
        console.error("Business settings load error:", err);
      }
    };

    loadSettings();
  }, [accountId]);

  // ======================================
  // 3. LOAD APPOINTMENT
  // ======================================
  useEffect(() => {
    const load = async () => {
      try {
        const accountId =
          window.__currentAccountId ||
          localStorage.getItem("public_account_id");

        if (!accountId) {
          console.error("❌ No account ID found for payment page");
          return;
        }

        const data = await getAppointment(appointmentId, accountId);
        setAppointment(data);

      } catch (e) {
        console.error("Failed to load appointment:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [appointmentId]);

  if (loading || !appointment) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-500">
        Loading payment data...
      </div>
    );
  }

  const service = appointment.service;
  const employee = appointment.employee;

  const finalLogo =
    businessSettings?.logo_url ||
    beautician?.logo_url ||
    "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url ||
    beautician?.cover_url ||
    "/images/dummy/dummy.png";

  // ======================================
  // 4. CONFIRM PAYMENT
  // ======================================
  const handleConfirm = async () => {
    try {
      const payload = {
        appointment_id: appointment.Id,
        account_id: appointment.AccountId,
        amount: appointment.FinalAmount,
      };

      // -------- STRIPE --------
      if (method === "card") {
        const res = await createStripeCheckout(payload);
        if (res?.url) window.location.href = res.url;
        return;
      }

      // -------- PAYPAL --------
      if (method === "paypal") {
        const res = await createPayPalOrder(payload);
        if (res?.approval_url) window.location.href = res.approval_url;
        return;
      }

      // -------- PAY AT VENUE --------
      if (method === "venue") {
        await updateAppointment(appointmentId, { Status: "Unpaid" });
        navigate(`/${subdomain}/booking/confirmation/${appointmentId}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };

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

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <img src={finalLogo} className="h-10 object-contain" />
        </div>
      </header>

      {/* Cover */}
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

      {/* Content */}
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
              icon={<img src="/images/paypal.png" className="h-6" />}
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
              <span className="font-semibold">
                £{Number(appointment.FinalAmount).toFixed(2)}
              </span>
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
    </div>
  );
}
