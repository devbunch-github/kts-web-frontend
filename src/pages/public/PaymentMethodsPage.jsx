// src/pages/public/PaymentMethodsPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Calendar, Clock, CreditCard, Wallet } from "lucide-react";

import {
  getAppointment,
  updateAppointment,
} from "../../api/appointment";
import {
  createStripeIntent,
  createPayPalOrder,
} from "../../api/publicApi"; // <-- Stripe + PayPal APIs

export default function PaymentMethodsPage() {
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [method, setMethod] = useState("card"); // card | paypal | venue
  const [loading, setLoading] = useState(true);
  const { serviceId, employeeId, appointmentId } = useParams();


  // ================================
  // 🟧 LOAD APPOINTMENT DETAILS
  // ================================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAppointment(appointmentId);
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
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Loading payment details...
      </div>
    );
  }

  const service = appointment.service;
  const employee = appointment.employee;

  // ================================
  // 🟧 CONFIRM PAYMENT
  // ================================
  const handleConfirm = async () => {
    try {
      // ---------------------------------
      // 🟧 1. STRIPE CHECKOUT
      // ---------------------------------
      if (method === "card") {
        const res = await createStripeIntent({ appointment_id: appointmentId });
        if (res?.url) {
          window.location.href = res.url; // redirect to Hosted Stripe Checkout
        }
        return;
      }

      // ---------------------------------
      // 🟦 2. PAYPAL CHECKOUT
      // ---------------------------------
      if (method === "paypal") {
        const res = await createPayPalOrder({ appointment_id: appointmentId });
        if (res?.approval_url) {
          window.location.href = res.approval_url; // redirect to PayPal
        }
        return;
      }

      // ---------------------------------
      // 🟩 3. PAY AT VENUE (INSTANT BOOKING)
      // ---------------------------------
      if (method === "venue") {
        await updateAppointment(appointmentId, { Status: "Unpaid" });
        navigate(`/booking/confirmation/${appointmentId}`);
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // ================================
  // 🟧 PAYMENT OPTION COMPONENT
  // ================================
  const PaymentOption = ({ value, label, icon }) => (
    <button
      onClick={() => setMethod(value)}
      className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border mb-3 transition ${
        method === value
          ? "border-[#E86C28] bg-[#fff7f2] shadow-sm"
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
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-gray-500">{icon}</div>
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-10 object-contain"
          />

          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* Cover */}
      <div className="w-full h-[350px] mt-[80px] overflow-hidden relative">
        <img
          src="/images/dummy/cover.png"
          className="w-full h-full object-cover brightness-[0.65]"
          alt="Cover"
        />
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-semibold drop-shadow-lg">
          Payment Methods
        </h1>
      </div>

      {/* Breadcrumb bar */}
      <div className="w-full bg-[#E86C28] h-11 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-sm text-white">
          <span className="opacity-80">Services</span> ›
          <span className="opacity-80 mx-1">Professional</span> ›
          <span className="opacity-80 mx-1">Appointment</span> ›
          <span className="font-medium">Payment</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10 px-6 py-14">
        {/* LEFT: Payment Methods */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <PaymentOption
              value="card"
              label="Credit/Debit Card"
              icon={<CreditCard className="w-6 h-6 text-[#E86C28]" />}
            />

            <PaymentOption
              value="paypal"
              label="Paypal"
              icon={<img src="/images/paypal.png" className="h-6" />}
            />

            <PaymentOption
              value="venue"
              label="Pay at venue"
              icon={<Wallet className="w-6 h-6 text-gray-500" />}
            />
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex gap-4 mb-4">
              <img
                src={service?.ImagePath || "/images/dummy/dummy.png"}
                className="w-20 h-20 rounded-lg object-cover"
              />

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {service?.Name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {appointment?.account?.City}, {appointment?.account?.Country}
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-yellow-500" />
                  5.0 (1)
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 py-4 text-sm">
              <div className="flex items-center text-gray-700 gap-2">
                <Calendar className="w-4 h-4" />
                {appointment.StartDateTime?.split("T")[0]}
              </div>

              <div className="flex items-center text-gray-700 gap-2 mt-2">
                <Clock className="w-4 h-4" />
                {appointment.StartDateTime?.split("T")[1]} –{" "}
                {appointment.EndDateTime?.split("T")[1]}
              </div>
            </div>

            <div className="border-t border-gray-200 py-4 text-sm">
              <div className="text-gray-700 font-semibold">
                {service?.Name}
              </div>
              <div className="text-xs text-gray-500">
                {service?.DefaultAppointmentDuration} mins with{" "}
                {employee?.name}
              </div>
            </div>

            <div className="border-t border-gray-200 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="text-gray-900 font-semibold">
                  £{Number(appointment.FinalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full mt-6 py-3 rounded-full bg-[#E86C28] text-white font-medium hover:bg-[#d65f1f] transition"
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
