// src/pages/public/ChooseAppointmentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, CalendarDays, Clock } from "lucide-react";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";
import { listPublicGiftCards } from "../../api/giftCards";
import { listEmployees } from "../../api/employee";
import { listServices } from "../../api/service";
import AuthModal from "../../components/public/AuthModal";
import { useAuth } from "../../context/AuthContext";

const ACCOUNT_ID = 725;

// Temporary mock time slots (replace with API later)
const generateTimeSlots = () => [
  { time: "09:00 AM", available: true },
  { time: "09:30 AM", available: false },
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "11:30 AM", available: true },
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: false },
  { time: "01:00 PM", available: true },
  { time: "01:30 PM", available: true },
];

export default function ChooseAppointmentPage() {
  const { serviceId, employeeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [giftCards, setGiftCards] = useState([]);

  const [service, setService] = useState(null);
  const [employee, setEmployee] = useState(null);

  const [loadingHeader, setLoadingHeader] = useState(true);
  const [loadingMain, setLoadingMain] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [showAuth, setShowAuth] = useState(false);

  const timeSlots = generateTimeSlots();

  // ---------- HEADER (logo / cover / giftcards) ----------
  useEffect(() => {
    const loadHeader = async () => {
      try {
        const [beautRes, settingsRes, giftRes] = await Promise.all([
          listBeauticians({ account_id: ACCOUNT_ID }),
          getBusinessSetting("site"),
          listPublicGiftCards(ACCOUNT_ID),
        ]);

        setBeautician(beautRes.data?.[0] || null);
        setBusinessSettings(settingsRes || {});
        setGiftCards(giftRes || []);
      } catch (e) {
        console.error("Header load error:", e);
      } finally {
        setLoadingHeader(false);
      }
    };

    loadHeader();
  }, []);

  // ---------- MAIN SERVICE + EMPLOYEE ----------
  useEffect(() => {
    const loadMain = async () => {
      try {
        const [empRes, srvRes] = await Promise.all([
          listEmployees(),
          listServices({ account_id: ACCOUNT_ID }),
        ]);

        const allEmployees = empRes?.data || [];
        const allServices = srvRes?.data || [];

        const foundService = allServices.find(
          (s) => String(s.Id) === String(serviceId)
        );
        setService(foundService || null);

        const foundEmployee =
          String(employeeId) === "any"
            ? null
            : allEmployees.find((e) => String(e.id) === String(employeeId));

        setEmployee(foundEmployee || null);
      } catch (e) {
        console.error("Main load error:", e);
      } finally {
        setLoadingMain(false);
      }
    };

    loadMain();
  }, [serviceId, employeeId]);

  // ---------- DERIVED ----------
  const finalLogo =
    businessSettings?.logo_url ||
    beautician?.logo_url ||
    "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url ||
    beautician?.cover_url ||
    "/images/dummy/dummy.png";

  const businessName =
    beautician?.business_name || beautician?.name || "Octane";

  const businessLocation =
    [beautician?.city, beautician?.country].filter(Boolean).join(", ") ||
    "Your Location";

  const getDaysInMonth = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const nextMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    );
  };

  // ---------- CONTINUE HANDLER ----------
  const handleContinue = () => {
    // basic guard — must pick date & time
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time first.");
      return;
    }

    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    // ✅ user is logged in → go to payment step within same business flow
    navigate(
      `/business/booking/${serviceId}/${employeeId}/payment`,
      {
        state: {
          selectedDate: selectedDate.toISOString(),
          selectedTime,
        },
      }
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            {loadingHeader ? (
              <div className="w-32 h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <img
                src={finalLogo}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            )}
          </div>

          <div className="flex gap-6 text-sm text-[#E86C28] font-medium">
            <span>📞 Phone</span>
            <span>✉️ Email</span>
            <span>📸 Instagram</span>
          </div>
        </div>
      </header>

      {/* COVER */}
      <div className="w-full h-[430px] mt-[80px] overflow-hidden relative">
        <img
          src={finalCover}
          className="w-full h-full object-cover brightness-[0.75]"
          alt="Cover"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-white text-4xl font-semibold text-center drop-shadow-lg">
            Choose your Appointment
          </h1>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="w-full bg-[#E86C28] h-11 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-sm text-white">
          <span className="opacity-80">Services</span>
          <span className="mx-1">›</span>
          <span className="opacity-80">Professional</span>
          <span className="mx-1">›</span>
          <span className="font-medium">Appointment</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-12 gap-12">
        {/* LEFT PANEL: Calendar + time slots */}
        <div className="col-span-12 lg:col-span-8">
          {/* Calendar Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[17px] font-semibold text-[#222]">
                {calendarMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <div className="flex gap-4">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  ‹
                </button>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-4">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map(
                (day) => (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          day
                        )
                      )
                    }
                    className={`py-2 rounded-lg text-sm ${
                      selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === calendarMonth.getMonth()
                        ? "bg-[#E86C28] text-white shadow"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {day}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#222] mb-4">
              Select Time
            </h3>

            <div className="flex flex-col gap-3">
              {!selectedDate && (
                <div className="text-gray-500 text-sm italic">
                  Select a date first
                </div>
              )}

              {selectedDate &&
                timeSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`text-left px-4 py-2 rounded-lg border text-sm ${
                      slot.available
                        ? selectedTime === slot.time
                          ? "border-[#E86C28] bg-[#FFF5EF]"
                          : "hover:bg-gray-100 border-gray-300"
                        : "border-gray-200 text-gray-400 line-through cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Summary */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            {/* Service Info */}
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={service?.ImagePath || "/images/dummy/dummy.png"}
                  className="w-full h-full object-cover"
                  alt="Service"
                />
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#222]">
                  {service?.Name}
                </h3>
                <p className="flex items-center text-xs text-gray-500 gap-1 mt-1">
                  <MapPin size={12} className="text-[#E86C28]" />
                  {businessLocation}
                </p>

                <p className="text-xs flex items-center gap-1 text-gray-600 mt-1">
                  <Star size={12} className="text-yellow-500" /> 5.0 (1)
                </p>

                {service?.Deposit && (
                  <p className="text-xs text-gray-400 mt-1">
                    Min Deposit{" "}
                    {service.DepositType === 0
                      ? `${service.Deposit}%`
                      : `£${service.Deposit}`}
                  </p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-[#E86C28] mb-2">
                <CalendarDays size={16} />
                {selectedDate
                  ? selectedDate.toDateString()
                  : "No date selected"}
              </div>

              <div className="flex items-center gap-2 text-sm text-[#E86C28]">
                <Clock size={16} />
                {selectedTime || "No time selected"}
              </div>
            </div>

            {/* Business & Professional */}
            <div className="mt-4 text-sm">
              <p className="text-gray-800 font-medium">{businessName}</p>
              <p className="text-gray-500">
                {service?.DefaultAppointmentDuration} mins{" "}
                {employee ? `with ${employee.name}` : "with any professional"}
              </p>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 mt-6 pt-4 flex justify-between text-sm">
              <span className="font-semibold text-[#222]">Total:</span>
              <span className="font-semibold text-[#222]">
                £{Number(service?.TotalPrice || 0).toFixed(2)}
              </span>
            </div>

            {/* Discount Options */}
            <div className="mt-6 flex flex-col gap-2 text-sm">
              <label className="flex gap-2 items-center">
                <input type="radio" name="discount" />
                Gift Card
              </label>
              <label className="flex gap-2 items-center">
                <input type="radio" name="discount" />
                Promo Code
              </label>
              <label className="flex gap-2 items-center">
                <input type="radio" name="discount" />
                Loyalty Points
              </label>
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              className="mt-6 w-full py-2.5 rounded-full bg-[#E86C28] text-white text-sm font-semibold hover:bg-[#cf5f20] transition"
            >
              Continue
            </button>

            {/* Auth Modal */}
            <AuthModal
              open={showAuth}
              onClose={() => setShowAuth(false)}
              mode="login"
              onSuccess={() => {
                // user is now logged in via context
                setShowAuth(false);
                // let the user click Continue again (or you can auto-continue if you want)
              }}
            />
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
