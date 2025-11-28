// src/pages/public/PaymentMethodsPage.jsx

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
} from "lucide-react";

import { getAppointment, updateAppointment } from "../../api/appointment";
import { createStripeCheckout, createPayPalOrder } from "../../api/publicApi";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";
import http from "@/api/http";

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { subdomain, appointmentId } = useParams();
  const location = useLocation();
  const state = location.state || {};

  const paymentOption = state.paymentOption || "full";

  const query = new URLSearchParams(location.search);
  const multiIdsParam = query.get("ids");
  const isMulti = !!multiIdsParam;
  const multiIds = isMulti ? multiIdsParam.split(",").map(Number) : [];

  const [appointments, setAppointments] = useState(null);
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
      const res = await listBeauticians({ subdomain });
      const b = res.data?.[0];

      if (b) {
        setBeautician(b);
        setAccountId(b.account_id);

        window.__currentAccountId = b.account_id;
        localStorage.setItem("public_account_id", String(b.account_id));
      }
    }
    loadBeautician();
  }, [subdomain]);

  // ----------------------------------------
  // LOAD BUSINESS SETTINGS
  // ----------------------------------------
  useEffect(() => {
    if (!accountId) return;

    getBusinessSetting("site", accountId)
      .then((settings) => setBusinessSettings(settings || {}))
      .catch(() => {});
  }, [accountId]);

  // ----------------------------------------
  // LOAD APPOINTMENTS
  // ----------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const accId =
          window.__currentAccountId ||
          localStorage.getItem("public_account_id");

        if (!accId) {
          setLoading(false);
          return;
        }

        if (isMulti && multiIds.length > 0) {
          const arr = [];
          for (let id of multiIds) {
            arr.push(await getAppointment(id, accId));
          }
          setAppointments(arr);
        } else {
          const appt = await getAppointment(appointmentId, accId);
          setAppointments(appt);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [appointmentId, isMulti, multiIdsParam]);

  const isMultiMode =
    isMulti && Array.isArray(appointments) && appointments.length > 0;

  const primaryAppointment = isMultiMode ? appointments[0] : appointments;

  const service = primaryAppointment?.service;

  const totalAmount = useMemo(() => {
    if (!isMultiMode) return 0;
    return appointments.reduce((s, appt) => {
      return s + Number(appt.FinalAmount ?? appt.service?.TotalPrice ?? 0);
    }, 0);
  }, [appointments, isMultiMode]);

  const amountToCharge = useMemo(() => {
    if (!primaryAppointment) return 0;
    if (isMultiMode) return totalAmount;
    if (paymentOption === "deposit") return Number(primaryAppointment.Deposit);
    return Number(primaryAppointment.FinalAmount);
  }, [primaryAppointment, paymentOption, isMultiMode, totalAmount]);

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

    const payload = isMultiMode
      ? {
          appointment_id: primaryAppointment.Id,
          appointment_ids: appointments.map((a) => a.Id),
          account_id: primaryAppointment.AccountId,
          amount: totalAmount,
          subdomain,
        }
      : {
          appointment_id: primaryAppointment.Id,
          account_id: primaryAppointment.AccountId,
          amount: amountToCharge,
          subdomain,
        };

    // Zero Payment → Mark as paid immediately
    if (amountToCharge <= 0) {
      try {
        await http.post(
          `/api/public/payment/mark-paid/${primaryAppointment.Id}`
        );

        navigate(`/${subdomain}/payment/success/${primaryAppointment.Id}`, {
          state: { skipPaymentSuccessCall: true },
        });
        return;
      } catch (err) {
        console.error(err);
        alert("Could not complete booking.");
        return;
      }
    }

    // STRIPE
    if (method === "card") {
      const res = await createStripeCheckout(payload);
      if (res?.url) window.location.href = res.url;
      return;
    }

    // PAYPAL
    if (method === "paypal") {
      const res = await createPayPalOrder(payload);
      if (res?.approval_url) window.location.href = res.approval_url;
      return;
    }

    // PAY AT VENUE
    if (method === "venue") {
      await updateAppointment(primaryAppointment.Id, { Status: "Unpaid" });
      navigate(
        `/${subdomain}/booking/confirmation/${primaryAppointment.Id}`
      );
    }
  };

  // ----------------------------------------
  // LOADING
  // ----------------------------------------
  if (loading)
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-500">
        Loading payment data...
      </div>
    );

  if (!primaryAppointment)
    return (
      <div className="p-10 text-center text-red-500">
        Appointment not found.
      </div>
    );

  // ----------------------------------------
  // RENDER FULL UI
  // ----------------------------------------
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50"> <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8"> <div className="h-10 max-w-[180px] flex items-center"> <img src={finalLogo} alt="Logo" className="h-full w-full object-contain" /> </div> <div className="flex gap-6 text-sm text-[#E86C28] font-medium"> <span>📞 Phone</span> <span>✉️ Email</span> <span>📸 Instagram</span> </div> </div> </header>

      {/* COVER */}
      <div className="w-full h-[350px] mt-[80px] relative">
        <img
          src={finalCover}
          className="w-full h-full object-cover brightness-[0.65]"
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-white text-4xl font-semibold">
          {isMultiMode ? "Payment for multiple services" : "Payment Methods"}
        </h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10 px-6 py-14">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl p-8 shadow">
            <button
              onClick={() => setMethod("card")}
              className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border mb-3 ${
                method === "card"
                  ? "border-[#E86C28] bg-[#fff7f2]"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                />
                Credit / Debit Card
              </div>
              <CreditCard className="text-[#E86C28]" />
            </button>

            <button
              onClick={() => setMethod("paypal")}
              className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border mb-3 ${
                method === "paypal"
                  ? "border-[#E86C28] bg-[#fff7f2]"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={method === "paypal"}
                  onChange={() => setMethod("paypal")}
                />
                PayPal
              </div>
              <img src="/images/icons/paypal-btn.png" className="h-6" />
            </button>

            <button
              onClick={() => setMethod("venue")}
              className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border ${
                method === "venue"
                  ? "border-[#E86C28] bg-[#fff7f2]"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={method === "venue"}
                  onChange={() => setMethod("venue")}
                />
                Pay at Venue
              </div>
              <Wallet className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex gap-4">
              {service?.ImagePath && (
                <img
                  src={service.ImagePath}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}

              <div>
                <h3 className="font-semibold">{service?.Name}</h3>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin size={12} />
                  {beautician?.city}
                </p>
              </div>
            </div>

            <div className="border-t mt-4 pt-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={14} />
                {primaryAppointment.StartDateTime?.split("T")[0]}
              </div>

              <div className="flex items-center gap-2 text-gray-700 mt-2">
                <Clock size={14} />
                {primaryAppointment.StartDateTime?.split("T")[1]}
              </div>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-semibold">
                £{amountToCharge.toFixed(2)}
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

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">Octane</span>
      </footer>
    </div>
  );
}
