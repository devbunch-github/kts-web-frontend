// src/pages/public/MultiBookingPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, Clock } from "lucide-react";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";
import { listEmployees, getWeekSchedule } from "../../api/employee";
import { listServices } from "../../api/service";
import { createAppointment } from "../../api/appointment";

import AuthModal from "../../components/public/AuthModal";
import { useAuth } from "../../context/AuthContext";

const CART_STORAGE_KEY = "booking_cart";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function clearCart() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {}
}

// ---- helpers (same logic as ChooseAppointmentPage) ----
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
// ---------------------------------------------------

export default function MultiBookingPage() {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [ACCOUNT_ID, setACCOUNT_ID] = useState(null);

  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedServices, setSelectedServices] = useState([]); // service objects in cart

  // selections[serviceId] = { employeeId, date, time, timeSlots, bookingEmployeeId }
  const [selections, setSelections] = useState({});

  const [loadingHeader, setLoadingHeader] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const headerLoading = loadingHeader;

  // ---------------- LOAD BUSINESS BY SUBDOMAIN ----------------
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];

        if (b) {
          setBeautician(b);
          setACCOUNT_ID(b.account_id);

          // keep behaviour consistent with other pages
          window.__currentAccountId = b.account_id;
          localStorage.setItem("public_account_id", b.account_id);
        }
      } catch (err) {
        console.error("Beautician fetch failed:", err);
      } finally {
        setLoadingHeader(false);
      }
    };

    loadBusiness();
  }, [subdomain]);

  // ---------------- HEADER / COVER DATA ----------------
  useEffect(() => {
    if (!ACCOUNT_ID) return;

    const loadHeader = async () => {
      try {
        const settingsRes = await getBusinessSetting("site", ACCOUNT_ID);
        setBusinessSettings(settingsRes || {});
      } catch (e) {
        console.error(e);
      }
    };

    loadHeader();
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

  // ---------------- LOAD SERVICES + EMPLOYEES + CART ----------------
  useEffect(() => {
    if (!ACCOUNT_ID) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [empRes, srvRes] = await Promise.all([
          listEmployees({ account_id: ACCOUNT_ID }),
          listServices({ account_id: ACCOUNT_ID }),
        ]);

        const allEmployees = empRes?.data || [];
        const allServices = srvRes?.data || [];

        setEmployees(allEmployees);
        setServices(allServices);

        const cartItems = loadCart(); // [{serviceId, accountId}]
        const cartIds = cartItems.map((c) => String(c.serviceId));

        const selectedSrv = allServices.filter((s) =>
          cartIds.includes(String(s.Id))
        );

        setSelectedServices(selectedSrv);

        // initialise selections map
        setSelections((prev) => {
          const next = { ...prev };
          selectedSrv.forEach((srv) => {
            if (!next[srv.Id]) {
              next[srv.Id] = {
                employeeId: "any",
                date: "",
                time: "",
                timeSlots: [],
                bookingEmployeeId: null,
              };
            }
          });
          return next;
        });
      } catch (e) {
        console.error("Load data failed", e);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [ACCOUNT_ID]);

  const finalSelectedCount = selectedServices.length;

  const serviceEmployeesMap = selectedServices.reduce((acc, srv) => {
    const svcId = srv.Id;
    const eligible = employees.filter((emp) =>
      (emp.services_full || emp.services || []).some(
        (s) => String(s.Id) === String(svcId)
      )
    );
    acc[svcId] = eligible;
    return acc;
  }, {});

  const SkeletonHeader = () => (
    <div className="w-full h-[350px] bg-gray-200 animate-pulse mt-[80px]" />
  );

  // ---------------- SELECTION HANDLERS ----------------
  const updateSelection = (serviceId, updater) => {
    setSelections((prev) => {
      const current = prev[serviceId] || {
        employeeId: "any",
        date: "",
        time: "",
        timeSlots: [],
        bookingEmployeeId: null,
      };
      return {
        ...prev,
        [serviceId]: updater(current),
      };
    });
  };

  const handleEmployeeChange = (serviceId, value) => {
    updateSelection(serviceId, (sel) => ({
      ...sel,
      employeeId: value,
      // reset time slots/time when employee changes
      time: "",
      timeSlots: [],
      bookingEmployeeId: null,
    }));
  };

  const handleDateChange = async (serviceId, dateStr) => {
    updateSelection(serviceId, (sel) => ({
      ...sel,
      date: dateStr,
      time: "",
      timeSlots: [],
      bookingEmployeeId: null,
    }));

    const service = selectedServices.find(
      (s) => String(s.Id) === String(serviceId)
    );
    if (!service || !dateStr) return;

    const durationMinutes =
      Number(service.DefaultAppointmentDuration || 30) *
      (service.DurationUnit === "hours" ? 60 : 1);

    const svcEmployees = serviceEmployeesMap[serviceId] || [];

    try {
      // "any professional" → merge all employees' shifts
      const promises = svcEmployees.map((emp) =>
        getWeekSchedule(emp.id, dateStr).then((res) => {
          const day = res?.days?.find((d) => d.date === dateStr);
          return buildSlotsFromDay(day, durationMinutes, emp.id);
        })
      );

      const results = await Promise.all(promises);
      const merged = mergeSlots(results.flat());

      setSelections((prev) => ({
        ...prev,
        [serviceId]: {
          ...(prev[serviceId] || {
            employeeId: "any",
            date: dateStr,
          }),
          date: dateStr,
          time: "",
          timeSlots: merged,
          bookingEmployeeId: null,
        },
      }));
    } catch (e) {
      console.error("Slot load failed", e);
      setSelections((prev) => ({
        ...prev,
        [serviceId]: {
          ...(prev[serviceId] || { employeeId: "any", date: dateStr }),
          date: dateStr,
          time: "",
          timeSlots: [],
          bookingEmployeeId: null,
        },
      }));
    }
  };

  const handleTimeSelect = (serviceId, slot) => {
    const selection = selections[serviceId];
    const svcEmployees = serviceEmployeesMap[serviceId] || [];

    let autoEmpId = null;

    if (selection?.employeeId && selection.employeeId !== "any") {
      autoEmpId = selection.employeeId;
    } else if (slot.employeeIds && slot.employeeIds.length > 0) {
      autoEmpId = slot.employeeIds[0];
    } else if (svcEmployees.length > 0) {
      autoEmpId = svcEmployees[0].id;
    }

    updateSelection(serviceId, (sel) => ({
      ...sel,
      time: slot.time,
      bookingEmployeeId: autoEmpId,
    }));
  };

  // ---------------- SUBMIT MULTIPLE APPOINTMENTS ----------------
  const handleConfirmAppointments = async () => {
    if (!ACCOUNT_ID) return;

    if (!finalSelectedCount) {
      alert("No services selected.");
      return;
    }

    // validate all selections have date & time
    for (const srv of selectedServices) {
      const sel = selections[srv.Id];
      if (!sel || !sel.date || !sel.time) {
        alert(
          `Please select date & time for "${srv.Name}" before confirming.`
        );
        return;
      }
    }

    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    const customerId = Number(localStorage.getItem("customer_id") || 0);
    if (!customerId) {
      setShowAuth(true);
      return;
    }

    setSubmitting(true);

    try {
      const created = [];

      for (const srv of selectedServices) {
        const sel = selections[srv.Id];
        if (!sel) continue;

        const [timePart, modifier] = sel.time.split(" ");
        let [hours, minutes] = timePart.split(":");
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);

        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const start = new Date(sel.date + "T00:00:00");
        start.setHours(hours);
        start.setMinutes(minutes);
        start.setSeconds(0);
        start.setMilliseconds(0);

        const durationMinutes =
          Number(srv.DefaultAppointmentDuration || 30) *
          (srv.DurationUnit === "hours" ? 60 : 1);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + durationMinutes);

        const resolvedEmployeeId =
          sel.bookingEmployeeId ||
          (sel.employeeId && sel.employeeId !== "any"
            ? Number(sel.employeeId)
            : null);

        const payload = {
          ServiceId: Number(srv.Id),
          EmployeeId: resolvedEmployeeId,
          CustomerId: customerId,
          AccountId: ACCOUNT_ID,
          StartDateTime: start.toISOString(),
          EndDateTime: end.toISOString(),
          Status: "Pending",
          Cost: srv.TotalPrice,
          Deposit: srv.Deposit || 0,
          FinalAmount: srv.TotalPrice,
          Tip: 0,
          RefundAmount: 0,
          Discount: 0,
          DateCreated: new Date().toISOString(),
        };

        const appt = await createAppointment(payload);
        created.push(appt);
      }

      if (!created.length) {
        alert("No appointments were created.");
        return;
      }

      clearCart();

      // 🔥 redirect to existing payment page, using first appointment
      // Route: /:subdomain/booking/:serviceId/:employeeId/payment/:appointmentId
      // We don't really care about :serviceId / :employeeId here, so use "multi" / "any".
      const ids = created.map((a) => a.Id).join(",");
      const firstAppointmentId = created[0].Id;

      navigate(
        `/${subdomain}/booking/multi/any/payment/${firstAppointmentId}?ids=${ids}`
      );
    } catch (e) {
      console.error("Multi booking failed", e);
      alert("Something went wrong while booking your appointments.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- UI ----------------
  if (loadingData && !finalSelectedCount) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-gray-500">
        Loading your booking...
      </div>
    );
  }

  if (!finalSelectedCount) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
        <p className="text-gray-600 mb-4">
          You don’t have any services in your booking yet.
        </p>
        <button
          onClick={() => navigate(`/${subdomain}`)}
          className="px-6 py-2 rounded-full bg-[#E86C28] text-white text-sm font-medium hover:bg-[#cf5f20]"
        >
          Browse services
        </button>
      </div>
    );
  }

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

      {/* COVER */}
      {headerLoading ? (
        <SkeletonHeader />
      ) : (
        <div className="w-full h-[350px] mt-[80px] overflow-hidden relative">
          <img
            src={finalCover}
            className="w-full h-full object-cover brightness-[0.75]"
            alt="Cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-white text-4xl font-semibold text-center drop-shadow-lg mb-2">
              Review & schedule your services
            </h1>
            <p className="text-white/90 text-sm">
              {finalSelectedCount} service
              {finalSelectedCount > 1 ? "s" : ""} in this booking
            </p>
          </div>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="w-full bg-[#E86C28] h-11 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-sm text-white">
          <span className="opacity-80">Services</span>
          <span className="mx-1">›</span>
          <span className="opacity-80">Multi booking</span>
          <span className="mx-1">›</span>
          <span className="font-medium">Schedule</span>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-12 gap-10">
        {/* LEFT: per-service scheduling */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {selectedServices.map((srv) => {
            const sel = selections[srv.Id] || {};
            const svcEmployees = serviceEmployeesMap[srv.Id] || [];
            const timeSlots = sel.timeSlots || [];

            return (
              <div
                key={srv.Id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={srv.ImagePath || "/images/dummy/dummy.png"}
                        alt={srv.Name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#222] mb-1">
                        {srv.Name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} className="text-[#E86C28]" />
                        {businessLocation}
                      </p>
                      <p className="text-xs text-gray-500">
                        {srv.DefaultAppointmentDuration}{" "}
                        {srv.DurationUnit === "hours" ? "hours" : "mins"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold text-[#222]">
                    £{Number(srv.TotalPrice || 0).toFixed(2)}
                  </div>
                </div>

                {/* Controls */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Professional */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Professional
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={sel.employeeId || "any"}
                      onChange={(e) =>
                        handleEmployeeChange(srv.Id, e.target.value)
                      }
                    >
                      <option value="any">Any professional</option>
                      {svcEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={sel.date || ""}
                      onChange={(e) =>
                        handleDateChange(srv.Id, e.target.value)
                      }
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Time
                    </label>

                    {!sel.date && (
                      <div className="text-xs text-gray-400 pt-2">
                        Select a date to see available times.
                      </div>
                    )}

                    {sel.date && timeSlots.length === 0 && (
                      <div className="text-xs text-gray-400 pt-2">
                        No available time slots for this day.
                      </div>
                    )}

                    {sel.date && timeSlots.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => handleTimeSelect(srv.Id, slot)}
                            className={`px-3 py-1.5 rounded-full border text-xs ${
                              sel.time === slot.time
                                ? "border-[#E86C28] bg-[#FFF5EF] text-[#E86C28]"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {slot.time}
                            {slot.employeeIds &&
                              slot.employeeIds.length > 1 &&
                              sel.employeeId === "any" && (
                                <span className="ml-1 text-[10px] text-gray-400">
                                  {slot.employeeIds.length} pros
                                </span>
                              )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: summary + confirm */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
            <h2 className="text-sm font-semibold text-[#222] mb-4">
              Booking summary ({finalSelectedCount}{" "}
              {finalSelectedCount > 1 ? "services" : "service"})
            </h2>

            <div className="space-y-3 text-sm">
              {selectedServices.map((srv) => {
                const sel = selections[srv.Id] || {};
                const svcEmployees = serviceEmployeesMap[srv.Id] || [];
                const empName =
                  (sel.bookingEmployeeId &&
                    svcEmployees.find(
                      (e) => String(e.id) === String(sel.bookingEmployeeId)
                    )?.name) ||
                  (sel.employeeId &&
                    sel.employeeId !== "any" &&
                    svcEmployees.find(
                      (e) => String(e.id) === String(sel.employeeId)
                    )?.name) ||
                  "Any professional";

                return (
                  <div
                    key={srv.Id}
                    className="border-b last:border-b-0 pb-3 last:pb-0"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{srv.Name}</span>
                      <span>£{Number(srv.TotalPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        <span>{sel.date || "No date selected"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{sel.time || "No time selected"}</span>
                      </div>
                      <div>
                        {srv.DefaultAppointmentDuration}{" "}
                        {srv.DurationUnit === "hours" ? "hours" : "mins"} with{" "}
                        {empName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-sm">
              <span className="font-semibold text-[#222]">Total:</span>
              <span className="font-semibold text-[#222]">
                £
                {selectedServices
                  .reduce(
                    (sum, s) => sum + Number(s.TotalPrice || 0),
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmAppointments}
              className="mt-6 w-full py-2.5 rounded-full bg-[#E86C28] text-white font-medium hover:bg-[#cf5f20] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Booking your appointments..."
                : "Confirm appointments"}
            </button>

            <AuthModal
              open={showAuth}
              onClose={() => setShowAuth(false)}
              mode="login"
              onSuccess={() => {
                setShowAuth(false);
                handleConfirmAppointments();
              }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved by{" "}
        <span className="text-[#E86C28]">
          {beautician?.business_name || beautician?.name || "Octane"}
        </span>
      </footer>
    </div>
  );
}
