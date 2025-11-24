// src/pages/public/PaymentMethodsPage.jsx

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  // ----------------------------------------
  // MULTI PAYMENT MODE (ids from query string)
  // ----------------------------------------
  const query = new URLSearchParams(location.search);
  const multiIdsParam = query.get("ids"); // e.g. "12,14,15"
  const isMulti = !!multiIdsParam;
  const multiIds = isMulti
    ? multiIdsParam.split(",").map((id) => Number(id))
    : [];

  // ----------------------------------------
  // STATES – Always at top
  // ----------------------------------------
  const [appointments, setAppointments] = useState(null); // object (single) OR array (multi)
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
  // LOAD APPOINTMENT(S)
  // ----------------------------------------
  useEffect(() => {
    async function loadAppointments() {
      try {
        const accId =
          window.__currentAccountId ||
          localStorage.getItem("public_account_id");

        if (!accId) {
          console.error("❌ No account ID found for payment page");
          setLoading(false);
          return;
        }

        if (isMulti && multiIds.length) {
          const list = [];
          for (const id of multiIds) {
            const data = await getAppointment(id, accId);
            list.push(data);
          }
          setAppointments(list); // array
        } else {
          const data = await getAppointment(appointmentId, accId);
          setAppointments(data); // single object
        }
      } catch (err) {
        console.error("Failed to load appointment(s):", err);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [appointmentId, isMulti, multiIdsParam]);

  // ----------------------------------------
  // COMPUTED VALUES
  // ----------------------------------------
  const isMultiMode =
    isMulti && Array.isArray(appointments) && appointments.length > 0;

  const primaryAppointment = isMultiMode
    ? appointments[0]
    : appointments || null;

  const service = primaryAppointment?.service;
  const employee = primaryAppointment?.employee;

  const totalAmount = useMemo(() => {
    if (isMultiMode) {
      return appointments.reduce((sum, appt) => {
        const val =
          Number(appt.FinalAmount ?? 0) ||
          Number(appt.service?.TotalPrice ?? 0);
        return sum + val;
      }, 0);
    }

    if (!primaryAppointment) return 0;

    const finalAmt = Number(primaryAppointment.FinalAmount ?? 0);
    if (finalAmt > 0) return finalAmt;

    const srv = Number(primaryAppointment.service?.TotalPrice ?? 0);
    return srv;
  }, [appointments, isMultiMode, primaryAppointment]);

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
    if (!primaryAppointment) return;

    try {
      const payload = isMultiMode
        ? {
            // keep old key for backward compatibility
            appointment_id: primaryAppointment.Id,
            // new multi-support for backend (safe to ignore if not implemented)
            appointment_ids: appointments.map((a) => a.Id),
            account_id: primaryAppointment.AccountId,
            amount: totalAmount,
            subdomain,
          }
        : {
            appointment_id: primaryAppointment.Id,
            account_id: primaryAppointment.AccountId,
            amount: totalAmount,
            subdomain,
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
        if (isMultiMode) {
          for (const appt of appointments) {
            await updateAppointment(appt.Id, { Status: "Unpaid" });
          }
          // simple redirect; your success page is mainly for online payments
          navigate(`/${subdomain}`);
        } else {
          await updateAppointment(primaryAppointment.Id, { Status: "Unpaid" });
          navigate(
            `/${subdomain}/booking/confirmation/${primaryAppointment.Id}`
          );
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };

  // ----------------------------------------
  // UI RENDERING
  // ----------------------------------------
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-500">
        Loading payment data...
      </div>
    );
  }

  if (!primaryAppointment) {
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
  // FINAL RETURN
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
          {isMultiMode ? "Payment for multiple services" : "Payment Methods"}
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
              {service?.ImagePath && (
                <img
                  src={service.ImagePath}
                  className="w-20 h-20 rounded-lg object-cover"
                  alt=""
                />
              )}
              <div>
                <h3 className="font-semibold">
                  {isMultiMode
                    ? `${service?.Name || "Service"} + ${
                        appointments.length - 1
                      } more`
                    : service?.Name}
                </h3>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin size={12} />
                  {beautician?.city}, {beautician?.country}
                </p>
                {isMultiMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    {appointments.length} appointments in this payment
                  </p>
                )}
              </div>
            </div>

            <div className="border-t mt-4 pt-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} />{" "}
                {primaryAppointment.StartDateTime?.split("T")[0]}
              </div>

              <div className="flex items-center gap-2 text-gray-700 mt-2">
                <Clock size={14} />{" "}
                {primaryAppointment.StartDateTime?.split("T")[1]}
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
