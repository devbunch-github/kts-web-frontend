/* ================================
   CHOOSE APPOINTMENT PAGE (FIXED)
   Deposit modal appears once only
   ================================ */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, CalendarDays, Clock } from "lucide-react";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";
import {
  listPublicGiftCards,
  validatePublicGiftCard,
} from "../../api/giftCards";
import { listEmployees, getWeekSchedule } from "../../api/employee";
import { listServices } from "../../api/service";

import AuthModal from "../../components/public/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { createAppointment } from "../../api/appointment";
import { validatePublicPromoCode } from "../../api/promoCode";

/* ======================================================================
   Helper functions
   ====================================================================== */
function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeLabel(totalMinutes) {
  let h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  let suffix = "AM";

  if (h >= 12) {
    suffix = "PM";
    if (h > 12) h -= 12;
  }
  if (h === 0) h = 12;

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm} ${suffix}`;
}

function buildSlotsFromDay(day, durationMinutes, employeeId) {
  if (!day || !Array.isArray(day.items) || !day.items.length) return [];

  const slots = [];

  day.items.forEach((item) => {
    if (item.type !== "shift") return;

    const startMin = timeToMinutes(item.start);
    const endMin = timeToMinutes(item.end);

    for (let m = startMin; m + durationMinutes <= endMin; m += durationMinutes) {
      const label = minutesToTimeLabel(m);
      slots.push({
        time: label,
        employeeIds: [employeeId],
      });
    }
  });

  return slots;
}

function mergeSlots(slotList) {
  const map = {};

  slotList.forEach((slot) => {
    if (!map[slot.time]) {
      map[slot.time] = {
        time: slot.time,
        employeeIds: [],
      };
    }
    map[slot.time].employeeIds.push(...slot.employeeIds);
  });

  return Object.values(map);
}

/* ======================================================================
   COMPONENT START
   ====================================================================== */
export default function ChooseAppointmentPage() {
  const { serviceId, employeeId, subdomain } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [giftCards, setGiftCards] = useState([]);

  const [ACCOUNT_ID, setACCOUNT_ID] = useState(null);

  const [service, setService] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [serviceEmployees, setServiceEmployees] = useState([]);

  const [loadingBeautician, setLoadingBeautician] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingMain, setLoadingMain] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  /* ======================================================================
     MODALS
     ====================================================================== */

  const [showAuth, setShowAuth] = useState(false);

  // ⛔ THIS WAS CAUSING THE DOUBLE MODAL ISSUE
  // We now persist the acceptance until appt is done
  const [showDepositPolicy, setShowDepositPolicy] = useState(false);
  const [depositPolicyAccepted, setDepositPolicyAccepted] = useState(false);

  const [timeSlots, setTimeSlots] = useState([]);
  const [bookingEmployeeId, setBookingEmployeeId] = useState(null);

  /* ======================================================================
     DISCOUNTS
     ====================================================================== */

  const [discountMode, setDiscountMode] = useState("none");

  const [promoInput, setPromoInput] = useState("");
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const [giftCardInput, setGiftCardInput] = useState("");
  const [giftCardApplying, setGiftCardApplying] = useState(false);
  const [giftCardError, setGiftCardError] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);

  /* ======================================================================
     PAYMENT OPTION
     ====================================================================== */

  const [paymentOption, setPaymentOption] = useState("deposit");

  /* ======================================================================
     LOAD BEAUTICIAN + ACCOUNT
     ====================================================================== */

  useEffect(() => {
    async function loadBeautician() {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];

        if (b) {
          setBeautician(b);
          setACCOUNT_ID(b.account_id);

          window.__currentAccountId = b.account_id;
          localStorage.setItem("public_account_id", b.account_id);
        }
      } finally {
        setLoadingBeautician(false);
      }
    }

    loadBeautician();
  }, [subdomain]);

  /* ======================================================================
     LOAD SETTINGS + GIFT CARDS
     ====================================================================== */

  useEffect(() => {
    if (!ACCOUNT_ID) return;

    async function loadHeaderData() {
      try {
        const [settingsRes, giftRes] = await Promise.all([
          getBusinessSetting("site", ACCOUNT_ID),
          listPublicGiftCards(ACCOUNT_ID),
        ]);

        setBusinessSettings(settingsRes || {});
        setGiftCards(giftRes || []);
      } finally {
        setLoadingSettings(false);
      }
    }

    loadHeaderData();
  }, [ACCOUNT_ID]);

  /* ======================================================================
     LOAD SERVICE + EMPLOYEES
     ====================================================================== */

  useEffect(() => {
    if (!ACCOUNT_ID) return;

    async function loadMain() {
      setLoadingMain(true);

      try {
        const [empRes, srvRes] = await Promise.all([
          listEmployees({ account_id: ACCOUNT_ID }),
          listServices({ account_id: ACCOUNT_ID }),
        ]);

        const allEmployees = empRes?.data || [];
        const allServices = srvRes?.data || [];

        const foundService = allServices.find(
          (s) => String(s.Id) === String(serviceId)
        );

        setService(foundService || null);

        const eligible = allEmployees.filter((emp) =>
          (emp.services_full || emp.services || []).some(
            (srv) => String(srv.Id) === String(serviceId)
          )
        );

        setServiceEmployees(eligible);

        let foundEmployee = null;
        if (employeeId !== "any") {
          foundEmployee =
            eligible.find((e) => String(e.id) === String(employeeId)) ||
            allEmployees.find((e) => String(e.id) === String(employeeId));
        }

        setEmployee(foundEmployee || null);
      } finally {
        setLoadingMain(false);
      }
    }

    loadMain();
  }, [ACCOUNT_ID, serviceId, employeeId]);

  /* ======================================================================
     CALENDAR HELPERS
     ====================================================================== */

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  const getDaysInMonth = () =>
    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();

  const nextMonth = () =>
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    );

  const prevMonth = () =>
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    );

  const firstDayOffset = useMemo(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    let w = new Date(y, m, 1).getDay();
    return w === 0 ? 6 : w - 1;
  }, [calendarMonth]);

  function formatDateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /* ======================================================================
     LOAD TIME SLOTS
     ====================================================================== */

  useEffect(() => {
    if (!selectedDate || !service || loadingMain) return;

    const dateStr = formatDateLocal(selectedDate);

    const durationMinutes =
      Number(service.DefaultAppointmentDuration || 30) *
      (service.DurationUnit === "hours" ? 60 : 1);

    async function loadSlots() {
      try {
        // Specific employee
        if (employeeId !== "any") {
          if (!employee) return;
          const empId = employee.id;

          const res = await getWeekSchedule(empId, dateStr);
          const day = res?.days?.find((d) => d.date === dateStr);

          setTimeSlots(buildSlotsFromDay(day, durationMinutes, empId));
          setSelectedTime(null);
          setBookingEmployeeId(null);
          return;
        }

        // ANY employee
        if (!serviceEmployees.length) return;

        const promises = serviceEmployees.map((emp) =>
          getWeekSchedule(emp.id, dateStr).then((res) => {
            const day = res?.days?.find((d) => d.date === dateStr);
            return buildSlotsFromDay(day, durationMinutes, emp.id);
          })
        );

        const all = await Promise.all(promises);

        const merged = mergeSlots(all.flat());
        setTimeSlots(merged);
        setSelectedTime(null);
        setBookingEmployeeId(null);
      } catch {
        setTimeSlots([]);
      }
    }

    loadSlots();
  }, [selectedDate, service, employeeId, employee, serviceEmployees, loadingMain]);

  /* ======================================================================
     EFFECTIVE EMPLOYEE NAME
     ====================================================================== */

  const effectiveEmployeeName = useMemo(() => {
    if (employee) return employee.name;

    if (bookingEmployeeId && serviceEmployees.length) {
      const found = serviceEmployees.find(
        (e) => String(e.id) === String(bookingEmployeeId)
      );
      return found?.name || "any professional";
    }

    return "any professional";
  }, [employee, bookingEmployeeId, serviceEmployees]);

  /* ======================================================================
     PRICING
     ====================================================================== */

  const basePrice = useMemo(
    () => Number(service?.TotalPrice || 0),
    [service]
  );

  const promoDiscountAmount = useMemo(() => {
    if (!service || !appliedPromo) return 0;
    const v = Number(appliedPromo.discount_value || 0);
    if (!v) return 0;

    return appliedPromo.discount_type === "percent"
      ? Math.min(basePrice, (basePrice * v) / 100)
      : Math.min(basePrice, v);
  }, [service, appliedPromo, basePrice]);

  const giftCardDiscountAmount = useMemo(() => {
    if (!appliedGiftCard) return 0;

    const remaining =
      Number(
        appliedGiftCard.remaining_amount ??
          appliedGiftCard.balance ??
          appliedGiftCard.amount ??
          0
      ) || 0;

    const afterPromo = Math.max(0, basePrice - promoDiscountAmount);
    if (afterPromo <= 0) return 0;

    return Math.min(afterPromo, remaining);
  }, [appliedGiftCard, basePrice, promoDiscountAmount]);

  const finalTotal = useMemo(
    () => Math.max(0, basePrice - promoDiscountAmount - giftCardDiscountAmount),
    [basePrice, promoDiscountAmount, giftCardDiscountAmount]
  );

  const minimumDeposit = useMemo(() => {
    if (!service || !service.Deposit) return 0;
    return service.DepositType === 0
      ? (Number(service.TotalPrice) * Number(service.Deposit)) / 100
      : Number(service.Deposit);
  }, [service]);

  const amountToPayNow = useMemo(() => {
    return paymentOption === "full"
      ? finalTotal
      : Math.min(minimumDeposit, finalTotal);
  }, [paymentOption, minimumDeposit, finalTotal]);

  const remainingBalance = useMemo(
    () => Math.max(0, finalTotal - amountToPayNow),
    [finalTotal, amountToPayNow]
  );

  /* ======================================================================
     APPLY PROMO CODE
     ====================================================================== */

  const handleApplyPromo = async () => {
    setPromoError("");

    if (!service || !ACCOUNT_ID) {
      setPromoError("Service not loaded yet.");
      return;
    }

    const code = promoInput.trim();
    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }

    setPromoApplying(true);

    try {
      const res = await validatePublicPromoCode({
        account_id: ACCOUNT_ID,
        service_id: service.Id,
        code,
      });

      if (res?.valid) {
        setAppliedPromo(res.data || res);
        setPromoError("");
      } else {
        setAppliedPromo(null);
        setPromoError(res?.message || "Invalid or expired promo code.");
      }
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Invalid or expired promo code."
      );
    } finally {
      setPromoApplying(false);
    }
  };

  /* ======================================================================
     APPLY GIFT CARD
     ====================================================================== */

  const handleApplyGiftCard = async () => {
    setGiftCardError("");

    if (!ACCOUNT_ID) {
      setGiftCardError("Business not loaded yet.");
      return;
    }

    const code = giftCardInput.trim();
    if (!code) {
      setGiftCardError("Please enter a gift card code.");
      return;
    }

    setGiftCardApplying(true);

    try {
      const res = await validatePublicGiftCard({
        account_id: ACCOUNT_ID,
        code,
      });

      if (res?.valid) {
        setAppliedGiftCard(res.data || res);
        setGiftCardError("");
      } else {
        setAppliedGiftCard(null);
        setGiftCardError(res?.message || "Invalid or expired gift card.");
      }
    } catch (err) {
      setAppliedGiftCard(null);
      setGiftCardError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Invalid or expired gift card."
      );
    } finally {
      setGiftCardApplying(false);
    }
  };

  /* ======================================================================
     CONTINUE NEXT STEP
     ====================================================================== */

  const handleContinue = async () => {
    /* ------------------------------
       1) SHOW DEPOSIT POLICY ONLY ONCE
       ------------------------------ */
    if (paymentOption === "deposit" && !depositPolicyAccepted) {
      setShowDepositPolicy(true);
      return;
    }

    /* ------------------------------
       2) IF NOT LOGGED IN → SHOW LOGIN MODAL
       ------------------------------ */
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    /* ------------------------------
       3) CREATE APPOINTMENT
       ------------------------------ */
    try {
      const start = new Date(selectedDate);
      const [timePart, modifier] = selectedTime.split(" ");

      let [hours, minutes] = timePart.split(":");

      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      start.setHours(hours);
      start.setMinutes(minutes);

      const durationMinutes =
        Number(service.DefaultAppointmentDuration || 30) *
        (service.DurationUnit === "hours" ? 60 : 1);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + durationMinutes);

      const resolvedEmployeeId =
        bookingEmployeeId ??
        (employee ? employee.id : employeeId === "any" ? null : employeeId);

      const customerId = localStorage.getItem("customer_id");

      if (!customerId) {
        setShowAuth(true);
        return;
      }

      const payload = {
        ServiceId: Number(serviceId),
        EmployeeId: resolvedEmployeeId,
        CustomerId: Number(customerId),
        AccountId: ACCOUNT_ID,

        StartDateTime: start.toISOString(),
        EndDateTime: end.toISOString(),

        Status: "Pending",
        Cost: service.TotalPrice,

        Deposit: minimumDeposit,
        DepositPaid: amountToPayNow,
        RemainingBalance: remainingBalance,
        PaymentMode: paymentOption,

        FinalAmount: finalTotal,
        Tip: 0,
        RefundAmount: 0,

        Discount: promoDiscountAmount,
        GiftCardAmount: giftCardDiscountAmount,

        PromoCode: appliedPromo?.code || null,
        GiftCardCode: appliedGiftCard?.code || appliedGiftCard?.Code || null,
      };

      const appt = await createAppointment(payload);

      // reset acceptance AFTER the booking is created
      setDepositPolicyAccepted(false);

      navigate(
        `/${subdomain}/booking/${serviceId}/${employeeId}/payment/${appt.Id}`,
        {
          state: {
            selectedDate: start.toISOString(),
            selectedTime,
            paymentOption,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ======================================================================
     RENDER START
     ====================================================================== */

  const SkeletonHeader = () => (
    <div className="w-full h-[430px] bg-gray-200 animate-pulse mt-[80px]" />
  );

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">

      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            {loadingBeautician || loadingSettings ? (
              <div className="w-32 h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <img
                src={
                  businessSettings?.logo_url ||
                  beautician?.logo_url ||
                  "/images/dummy/dummy.png"
                }
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

      {/* HERO */}
      {loadingBeautician || loadingSettings ? (
        <SkeletonHeader />
      ) : (
        <div className="w-full h-[430px] mt-[80px] overflow-hidden relative">
          <img
            src={
              businessSettings?.cover_url ||
              beautician?.cover_url ||
              "/images/dummy/dummy.png"
            }
            className="w-full h-full object-cover brightness-[0.75]"
            alt="Cover"
          />
          <div className="absolute inset-0 flex justify-center items-center">
            <h1 className="text-white text-4xl font-semibold drop-shadow-lg">
              Choose your Appointment
            </h1>
          </div>
        </div>
      )}

      {/* BREADCRUMB BAR */}
      <div className="w-full bg-[#E86C28] h-11 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-sm text-white">
          Services › Professional › <span className="font-medium">Appointment</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-12 px-6 py-14">

        {/* ---------------------------------------------
            CALENDAR COLUMN
        ---------------------------------------------- */}
        <div className="col-span-12 lg:col-span-8">
          {/* Calendar */}
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

            <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-4">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: firstDayOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {Array.from({ length: getDaysInMonth() }).map((_, i) => {
                const day = i + 1;

                return (
                  <button
                    key={day}
                    onClick={() => {
                      const d = new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth(),
                        day
                      );
                      setSelectedDate(d);
                      setSelectedTime(null);
                      setBookingEmployeeId(null);
                    }}
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
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#222] mb-4">Select Time</h3>

            {!selectedDate && (
              <div className="text-gray-500 text-sm italic">Select a date first</div>
            )}

            {selectedDate && !timeSlots.length && (
              <div className="text-gray-500 text-sm italic">
                No available time slots for this day.
              </div>
            )}

            {selectedDate && timeSlots.length > 0 && (
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      setSelectedTime(slot.time);

                      const autoEmpId =
                        employeeId === "any"
                          ? slot.employeeIds?.[0] ?? null
                          : employee?.id || Number(employeeId);

                      setBookingEmployeeId(autoEmpId || null);
                    }}
                    className={`text-left px-4 py-2 rounded-lg border text-sm ${
                      selectedTime === slot.time
                        ? "border-[#E86C28] bg-[#FFF5EF]"
                        : "hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    {slot.time}

                    {employeeId === "any" &&
                      slot.employeeIds?.length > 1 && (
                        <span className="ml-2 text-[11px] text-gray-400">
                          {slot.employeeIds.length} pros available
                        </span>
                      )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------
            SUMMARY COLUMN
        ---------------------------------------------- */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

            {/* Service header */}
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={service?.ImagePath || "/images/dummy/dummy.png"}
                  className="w-full h-full object-cover"
                  alt="Service"
                />
              </div>

              <div>
                <h3 className="font-semibold text-sm">{service?.Name}</h3>

                <p className="flex items-center text-xs text-gray-500 gap-1">
                  <MapPin size={12} className="text-[#E86C28]" />
                  {beautician?.city}, {beautician?.country}
                </p>

                <p className="flex items-center text-xs text-gray-500 gap-1 mt-1">
                  <Star size={12} className="text-yellow-400" />
                  <span>5 (1)</span>
                </p>

                {service?.Deposit > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Min Deposit{" "}
                    {service.DepositType === 0
                      ? `${service.Deposit}%`
                      : `£${Number(service.Deposit).toFixed(2)}`}
                  </p>
                )}
              </div>
            </div>

            {/* Date/time */}
            <div className="mt-4 text-sm space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarDays size={16} className="text-[#E86C28]" />

                {selectedDate ? (
                  <span>
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                ) : (
                  <span>No date selected</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[#E86C28]">
                <Clock size={16} />
                <span>{selectedTime || "No time selected"}</span>
              </div>

              <p className="text-gray-500 text-xs mt-1">
                {beautician?.business_name} –{" "}
                {service?.DefaultAppointmentDuration}{" "}
                {service?.DurationUnit === "hours" ? "hours" : "mins"} with{" "}
                {effectiveEmployeeName}
              </p>
            </div>

            {/* Discounts */}
            <div className="border-t border-gray-200 mt-5 pt-4 text-sm">
              <div className="space-y-2">

                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="radio"
                    name="discount_mode"
                    value="gift_card"
                    checked={discountMode === "gift_card"}
                    onChange={() => setDiscountMode("gift_card")}
                  />
                  <span>Gift Card</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="radio"
                    name="discount_mode"
                    value="promo"
                    checked={discountMode === "promo"}
                    onChange={() => setDiscountMode("promo")}
                  />
                  <span>Promo Code</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-400">
                  <input type="radio" name="discount_mode" disabled />
                  <span>Loyalty Points</span>
                </label>
              </div>

              {/* Gift card */}
              {discountMode === "gift_card" && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-xs"
                      placeholder="Enter gift card code"
                      value={giftCardInput}
                      onChange={(e) => setGiftCardInput(e.target.value)}
                    />

                    <button
                      onClick={handleApplyGiftCard}
                      disabled={giftCardApplying}
                      className="px-4 py-2 rounded-full bg-[#E86C28] text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {giftCardApplying ? "Applying..." : "APPLY"}
                    </button>
                  </div>

                  {giftCardError && (
                    <p className="text-[11px] text-red-500 mt-1">{giftCardError}</p>
                  )}

                  {appliedGiftCard && !giftCardError && (
                    <p className="text-[11px] text-green-600 mt-1">
                      Applied{" "}
                      <strong>
                        {appliedGiftCard.code || appliedGiftCard.Code}
                      </strong>{" "}
                      – balance £
                      {Number(
                        appliedGiftCard.remaining_amount ??
                          appliedGiftCard.balance ??
                          appliedGiftCard.amount ??
                          0
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* Promo */}
              {discountMode === "promo" && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-xs"
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                    />

                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplying}
                      className="px-4 py-2 rounded-full bg-[#E86C28] text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {promoApplying ? "Applying..." : "APPLY"}
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-[11px] text-red-500 mt-1">{promoError}</p>
                  )}

                  {appliedPromo && !promoError && (
                    <p className="text-[11px] text-green-600 mt-1">
                      Applied <strong>{appliedPromo.code}</strong> –{" "}
                      {appliedPromo.discount_type === "percent"
                        ? `${appliedPromo.discount_value}%`
                        : `£${Number(appliedPromo.discount_value).toFixed(2)}`}{" "}
                      off
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 mt-5 pt-4 text-sm space-y-2">

              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>£{basePrice.toFixed(2)}</span>
              </div>

              {promoDiscountAmount > 0 && (
                <div className="flex justify-between text-[#E86C28]">
                  <span>Promo discount</span>
                  <span>-£{promoDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {giftCardDiscountAmount > 0 && (
                <div className="flex justify-between text-[#E86C28]">
                  <span>Gift card</span>
                  <span>-£{giftCardDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-medium border-t border-gray-100 pt-2">
                <span>Total (after discounts)</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>

              {service?.Deposit > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Service minimum deposit</span>
                  <span>£{minimumDeposit.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold border-t border-gray-100 pt-2">
                <span>Amount to Pay Now:</span>
                <span>£{amountToPayNow.toFixed(2)}</span>
              </div>

              {remainingBalance > 0 && (
                <p className="text-[11px] text-gray-500">
                  Remaining balance at the salon: £{remainingBalance.toFixed(2)}
                </p>
              )}
            </div>

            {/* Payment options */}
            <div className="mt-5 pt-4 border-t border-gray-200">
              <h3 className="font-semibold mb-3">Payment Option</h3>

              {service?.Deposit > 0 ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[#E86C28]">
                    <input
                      type="radio"
                      name="payment_option"
                      value="deposit"
                      checked={paymentOption === "deposit"}
                      onChange={() => setPaymentOption("deposit")}
                    />
                    <span>
                      Pay Minimum Deposit (
                      {service.DepositType === 0
                        ? `${service.Deposit}%`
                        : `£${Number(service.Deposit).toFixed(2)}`}
                      )
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      name="payment_option"
                      value="full"
                      checked={paymentOption === "full"}
                      onChange={() => setPaymentOption("full")}
                    />
                    <span>Pay Full Amount</span>
                  </label>
                </div>
              ) : (
                <p className="text-gray-500 text-xs">
                  This service does not require a deposit. Full payment will be charged.
                </p>
              )}
            </div>

            <button
              onClick={handleContinue}
              className="mt-6 w-full py-2.5 rounded-full bg-[#E86C28] text-white hover:bg-[#cf5f20] transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by <span className="text-[#E86C28]">Octane</span>
      </footer>

      {/* ======================================================================
          DEPOSIT POLICY MODAL — FIXED
         ====================================================================== */}
      {showDepositPolicy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[2000]">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">

            <div className="bg-[#E86C28] px-6 py-4">
              <h3 className="text-white text-xl font-semibold">Deposit Policy</h3>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                To secure your salon appointment, we require a{" "}
                {service?.DepositType === 0
                  ? `${service?.Deposit}%`
                  : `£${Number(service?.Deposit).toFixed(2)}`}{" "}
                non-refundable deposit at the time of booking.
              </p>

              <p>The remaining balance will be due on the day of your appointment.</p>

              <p>
                The deposit can be moved if you reschedule more than 24 hours in advance.
                No-shows or late cancellations will lose the deposit.
              </p>
            </div>

            <div className="p-4 flex justify-end gap-3 border-t bg-gray-50">
              <button
                onClick={() => setShowDepositPolicy(false)}
                className="px-4 py-2 rounded-full text-sm border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowDepositPolicy(false);
                  setDepositPolicyAccepted(true); // FIXED
                }}
                className="px-5 py-2 rounded-full bg-[#E86C28] text-white text-sm hover:bg-[#cf5f20]"
              >
                Agree & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          AUTH MODAL
         ====================================================================== */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        mode="login"
        onSuccess={() => {
          setShowAuth(false);
          handleContinue(); // DOES NOT trigger deposit modal again
        }}
      />
    </div>
  );
}
