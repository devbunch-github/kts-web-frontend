// src/pages/public/ChooseAppointmentPage.jsx

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, CalendarDays, Clock } from "lucide-react";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";
import {
  listPublicGiftCards,
  validatePublicGiftCard, // ✅ NEW
} from "../../api/giftCards";
import { listEmployees, getWeekSchedule } from "../../api/employee";
import { listServices } from "../../api/service";

import AuthModal from "../../components/public/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { createAppointment } from "../../api/appointment";
import { validatePublicPromoCode } from "../../api/promoCode";

// =======================
// Helper functions
// =======================

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

// =======================
// Component
// =======================

export default function ChooseAppointmentPage() {
  const { serviceId, employeeId, subdomain } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [giftCards, setGiftCards] = useState([]); // list, not required for validation but kept

  const [ACCOUNT_ID, setACCOUNT_ID] = useState(null);

  const [service, setService] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [serviceEmployees, setServiceEmployees] = useState([]);

  const [loadingBeautician, setLoadingBeautician] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingMain, setLoadingMain] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [showAuth, setShowAuth] = useState(false);

  const [timeSlots, setTimeSlots] = useState([]);
  const [bookingEmployeeId, setBookingEmployeeId] = useState(null);

  const headerLoading = loadingBeautician || loadingSettings;

  // =======================
  // Discounts state
  // =======================

  const [discountMode, setDiscountMode] = useState("none"); // 'none' | 'promo' | 'gift_card'

  // Promo
  const [promoInput, setPromoInput] = useState("");
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount_type, discount_value, ... }

  // Gift Card
  const [giftCardInput, setGiftCardInput] = useState("");
  const [giftCardApplying, setGiftCardApplying] = useState(false);
  const [giftCardError, setGiftCardError] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState(null); // { code, remaining_amount, ... }

  // =======================
  // Load beautician + account
  // =======================

  useEffect(() => {
    const loadBeautician = async () => {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];

        if (b) {
          setBeautician(b);
          setACCOUNT_ID(b.account_id);

          // Make account ID available globally for AuthModal (signup)
          window.__currentAccountId = b.account_id;
          localStorage.setItem("public_account_id", b.account_id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingBeautician(false);
      }
    };

    loadBeautician();
  }, [subdomain]);

  // =======================
  // Load business settings & public gift cards
  // =======================

  useEffect(() => {
    if (!ACCOUNT_ID) return;

    const loadHeaderData = async () => {
      try {
        const [settingsRes, giftRes] = await Promise.all([
          getBusinessSetting("site", ACCOUNT_ID),
          listPublicGiftCards(ACCOUNT_ID),
        ]);

        setBusinessSettings(settingsRes || {});
        setGiftCards(giftRes || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadHeaderData();
  }, [ACCOUNT_ID]);

  const finalLogo =
    businessSettings?.logo_url ||
    beautician?.logo_url ||
    "/images/dummy/dummy.png";

  const finalCover =
    businessSettings?.cover_url ||
    beautician?.cover_url ||
    "/images/dummy/dummy.png";

  const businessLocation =
    [beautician?.city, beautician?.country].filter(Boolean).join(", ") ||
    "Your Location";

  // =======================
  // Load service & employees
  // =======================

  useEffect(() => {
    if (!ACCOUNT_ID) return;

    const loadMain = async () => {
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

        const eligibleEmployees = allEmployees.filter((emp) =>
          (emp.services_full || emp.services || []).some(
            (srv) => String(srv.Id) === String(serviceId)
          )
        );

        setServiceEmployees(eligibleEmployees);

        let foundEmployee = null;
        if (employeeId !== "any") {
          foundEmployee =
            eligibleEmployees.find(
              (e) => String(e.id) === String(employeeId)
            ) || allEmployees.find((e) => String(e.id) === String(employeeId));
        }

        setEmployee(foundEmployee || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMain(false);
      }
    };

    loadMain();
  }, [ACCOUNT_ID, serviceId, employeeId]);

  // =======================
  // Calendar helpers
  // =======================

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

  const firstDayOffset = useMemo(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();

    let weekday = new Date(y, m, 1).getDay();
    weekday = weekday === 0 ? 6 : weekday - 1;

    return weekday;
  }, [calendarMonth]);

  function formatDateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // =======================
  // Load time slots
  // =======================

  useEffect(() => {
    if (!selectedDate || !service || loadingMain) return;

    const dateStr = formatDateLocal(selectedDate);

    const durationMinutes =
      Number(service.DefaultAppointmentDuration || 30) *
      (service.DurationUnit === "hours" ? 60 : 1);

    const loadSlots = async () => {
      try {
        // CASE 1: Specific employee selected
        if (employeeId !== "any") {
          if (!employee) return; // Wait until employee loads

          const empId = employee.id;
          const res = await getWeekSchedule(empId, dateStr);
          const day = res?.days?.find((d) => d.date === dateStr);
          const slots = buildSlotsFromDay(day, durationMinutes, empId);

          setTimeSlots(slots);
          setSelectedTime(null);
          setBookingEmployeeId(null);
          return;
        }

        // CASE 2: ANY employee (merge all)
        if (!serviceEmployees.length) return; // Wait for employees

        const promises = serviceEmployees.map((emp) =>
          getWeekSchedule(emp.id, dateStr).then((res) => {
            const day = res?.days?.find((d) => d.date === dateStr);
            return buildSlotsFromDay(day, durationMinutes, emp.id);
          })
        );

        const results = await Promise.all(promises);
        const merged = mergeSlots(results.flat());

        setTimeSlots(merged);
        setSelectedTime(null);
        setBookingEmployeeId(null);
      } catch (err) {
        console.error(err);
        setTimeSlots([]);
      }
    };

    loadSlots();
  }, [
    selectedDate,
    service,
    employeeId,
    employee,
    serviceEmployees,
    loadingMain,
  ]);

  // =======================
  // Effective employee
  // =======================

  const effectiveEmployeeName = useMemo(() => {
    if (employee) return employee.name;

    if (bookingEmployeeId && serviceEmployees.length) {
      const found = serviceEmployees.find(
        (e) => String(e.id) === String(bookingEmployeeId)
      );
      if (found?.name) return found.name;
    }

    return "any professional";
  }, [employee, bookingEmployeeId, serviceEmployees]);

  // =======================
  // Pricing & discounts
  // =======================

  const basePrice = useMemo(
    () => Number(service?.TotalPrice || 0),
    [service]
  );

  // Promo discount only
  const promoDiscountAmount = useMemo(() => {
    if (!service || !appliedPromo) return 0;

    const value = Number(appliedPromo.discount_value || 0);
    if (!value) return 0;

    if (appliedPromo.discount_type === "percent") {
      return Math.min(basePrice, (basePrice * value) / 100);
    }

    // fixed amount
    return Math.min(basePrice, value);
  }, [service, appliedPromo, basePrice]);

  // Gift card discount (applied on top of promo, but not below zero)
  const giftCardDiscountAmount = useMemo(() => {
    if (!appliedGiftCard) return 0;

    // Amount available on the card (tweak the field names to match your API)
    const remaining =
      Number(
        appliedGiftCard.remaining_amount ??
          appliedGiftCard.balance ??
          appliedGiftCard.amount ??
          0
      ) || 0;

    if (remaining <= 0) return 0;

    // Max we can still charge after promo
    const remainingAfterPromo = Math.max(0, basePrice - promoDiscountAmount);

    if (remainingAfterPromo <= 0) return 0;

    return Math.min(remainingAfterPromo, remaining);
  }, [appliedGiftCard, basePrice, promoDiscountAmount]);

  const finalTotal = useMemo(
    () =>
      Math.max(
        0,
        basePrice - promoDiscountAmount - giftCardDiscountAmount
      ),
    [basePrice, promoDiscountAmount, giftCardDiscountAmount]
  );

  // =======================
  // Apply promo code
  // =======================

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

      if (!res?.valid) {
        setAppliedPromo(null);
        setPromoError(res?.message || "Invalid or expired promo code.");
        return;
      }

      setAppliedPromo(res.data || res);
      setPromoError("");
    } catch (err) {
      console.error("Apply promo error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid or expired promo code.";
      setAppliedPromo(null);
      setPromoError(msg);
    } finally {
      setPromoApplying(false);
    }
  };

  // =======================
  // Apply gift card
  // =======================

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
      // Mirror promo pattern: { account_id, code }
      const res = await validatePublicGiftCard({
        account_id: ACCOUNT_ID,
        code,
      });

      if (!res?.valid) {
        setAppliedGiftCard(null);
        setGiftCardError(res?.message || "Invalid or expired gift card.");
        return;
      }

      setAppliedGiftCard(res.data || res);
      setGiftCardError("");
    } catch (err) {
      console.error("Apply gift card error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid or expired gift card.";
      setAppliedGiftCard(null);
      setGiftCardError(msg);
    } finally {
      setGiftCardApplying(false);
    }
  };

  // =======================
  // Continue (create appointment)
  // =======================

  const handleContinue = async () => {
    if (!service) return;
    if (!selectedDate || !selectedTime) return;
    if (!ACCOUNT_ID) return;

    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

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
      start.setSeconds(0);
      start.setMilliseconds(0);

      const durationMinutes =
        Number(service.DefaultAppointmentDuration || 30) *
        (service.DurationUnit === "hours" ? 60 : 1);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + durationMinutes);

      const resolvedEmployeeId =
        bookingEmployeeId ??
        (employee ? employee.id : employeeId === "any" ? null : Number(employeeId));

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
        Deposit: service.Deposit || 0,
        FinalAmount: finalTotal, // discounted total
        Tip: 0,
        RefundAmount: 0,
        Discount: promoDiscountAmount, // promo discount only
        GiftCardAmount: giftCardDiscountAmount, // ✅ NEW
        DateCreated: new Date().toISOString(),
        PromoCode: appliedPromo?.code || null,
        GiftCardCode: appliedGiftCard?.code || appliedGiftCard?.Code || null, // ✅ NEW
      };

      const appt = await createAppointment(payload);

      navigate(
        `/${subdomain}/booking/${serviceId}/${employeeId}/payment/${appt.Id}`,
        {
          state: {
            selectedDate: start.toISOString(),
            selectedTime,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // =======================
  // Skeleton header
  // =======================

  const SkeletonHeader = () => (
    <div className="w-full h-[430px] bg-gray-200 animate-pulse mt-[80px]" />
  );

  // =======================
  // Render
  // =======================

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            {headerLoading ? (
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

      {/* HERO */}
      {headerLoading ? (
        <SkeletonHeader />
      ) : (
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
      )}

      {/* BREADCRUMB BAR */}
      <div className="w-full bg-[#E86C28] h-11 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-sm text-white">
          Services › Professional ›{" "}
          <span className="font-medium">Appointment</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-12 px-6 py-14">
        {/* LEFT: CALENDAR + TIMES */}
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

            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: firstDayOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {Array.from({ length: getDaysInMonth() }, (_, i) => {
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
            <h3 className="text-sm font-semibold text-[#222] mb-4">
              Select Time
            </h3>

            {!selectedDate && (
              <div className="text-gray-500 text-sm italic">
                Select a date first
              </div>
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
                      slot.employeeIds &&
                      slot.employeeIds.length > 1 && (
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

        {/* RIGHT: SUMMARY + DISCOUNTS */}
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
                {service?.Deposit && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Min Deposit{" "}
                    {service.DepositType === 0
                      ? `${service.Deposit}%`
                      : `£${Number(service.Deposit).toFixed(2)}`}
                  </p>
                )}
              </div>
            </div>

            {/* Selected date/time */}
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

            {/* Discount selection */}
            <div className="border-t border-gray-200 mt-5 pt-4 text-sm">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="radio"
                    name="discount_mode"
                    value="gift_card"
                    checked={discountMode === "gift_card"}
                    onChange={() => {
                      setDiscountMode("gift_card");
                    }}
                  />
                  <span>Gift Card</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="radio"
                    name="discount_mode"
                    value="promo"
                    checked={discountMode === "promo"}
                    onChange={() => {
                      setDiscountMode("promo");
                    }}
                  />
                  <span>Promo Code</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-400">
                  <input
                    type="radio"
                    name="discount_mode"
                    value="loyalty"
                    disabled
                  />
                  <span>Loyalty Points</span>
                </label>
              </div>

              {/* Gift card input */}
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
                      type="button"
                      onClick={handleApplyGiftCard}
                      disabled={giftCardApplying}
                      className="px-4 py-2 rounded-full bg-[#E86C28] text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {giftCardApplying ? "Applying..." : "APPLY"}
                    </button>
                  </div>

                  {giftCardError && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {giftCardError}
                    </p>
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

              {/* Promo input */}
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
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoApplying}
                      className="px-4 py-2 rounded-full bg-[#E86C28] text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {promoApplying ? "Applying..." : "APPLY"}
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {promoError}
                    </p>
                  )}

                  {appliedPromo && !promoError && (
                    <p className="text-[11px] text-green-600 mt-1">
                      Applied <strong>{appliedPromo.code}</strong> –{" "}
                      {appliedPromo.discount_type === "percent"
                        ? `${appliedPromo.discount_value}% off`
                        : `£${Number(
                            appliedPromo.discount_value
                          ).toFixed(2)} off`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 mt-5 pt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>£{basePrice.toFixed(2)}</span>
              </div>

              {promoDiscountAmount > 0 && (
                <div className="flex justify-between text-[#E86C28] text-sm">
                  <span>Promo discount</span>
                  <span>-£{promoDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {giftCardDiscountAmount > 0 && (
                <div className="flex justify-between text-[#E86C28] text-sm">
                  <span>Gift Card</span>
                  <span>-£{giftCardDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold mt-1 pt-1 border-t border-gray-100">
                <span>Total:</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>
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
        © 2025 All Rights Reserved by{" "}
          <span className="text-[#E86C28]">Octane</span>
      </footer>

      {/* AUTH MODAL */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        mode="login"
        onSuccess={() => {
          setShowAuth(false);
          handleContinue();
        }}
      />
    </div>
  );
}
