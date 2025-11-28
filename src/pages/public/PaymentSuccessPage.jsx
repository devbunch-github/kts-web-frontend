// src/pages/public/PaymentSuccessPage.jsx

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react";
import { getAppointment } from "../../api/appointment";
import http from "../../api/http";

export default function PaymentSuccessPage() {
  const { subdomain, appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const skipMarkPaid = location.state?.skipPaymentSuccessCall || false;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // 1. MARK APPOINTMENT AS PAID (unless skipped)
  // --------------------------------------------------
  useEffect(() => {
    async function processPayment() {
      try {
        const accountId =
          window.__currentAccountId ||
          localStorage.getItem("public_account_id");

        // ❌ DO NOT call mark-paid if it was already done in zero-payment flow
        if (!skipMarkPaid) {
          await http.post(`/api/public/payment/mark-paid/${appointmentId}`);
        }

        // Load updated appointment
        const data = await getAppointment(appointmentId, accountId);
        setAppointment(data);
      } catch (err) {
        console.error("Payment success load error:", err);
      } finally {
        setLoading(false);
      }
    }

    processPayment();
  }, [appointmentId, skipMarkPaid]);

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-500">
        Confirming your payment...
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

  const service = appointment.service;
  const employee = appointment.employee;

  // --------------------------------------------------
  // FINAL UI
  // --------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] flex justify-center items-start py-20 px-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-xl w-full p-10 text-center border">
        
        {/* SUCCESS ICON */}
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Your appointment has been booked successfully.
        </p>

        {/* DETAILS CARD */}
        <div className="bg-gray-50 rounded-2xl p-6 text-left">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {service?.Name}
            </h2>

            {employee && (
              <p className="text-sm text-gray-500">
                With {employee?.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            {appointment.StartDateTime?.split("T")[0]}
          </div>

          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            {appointment.StartDateTime?.split("T")[1]} –{" "}
            {appointment.EndDateTime?.split("T")[1]}
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            {appointment.account?.City}, {appointment.account?.Country}
          </div>

        </div>

        {/* GO TO HOME BUTTON */}
        <button
          onClick={() => navigate(`/${subdomain}`)}
          className="w-full mt-8 py-3 bg-[#E86C28] text-white rounded-full font-medium text-lg hover:bg-[#d5601f] transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
