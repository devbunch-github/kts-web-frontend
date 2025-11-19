// src/pages/public/ChooseProfessionalPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star } from "lucide-react";

import { listBeauticians } from "../../api/beautician";
import { getBusinessSetting } from "../../api/settings";
import { listPublicGiftCards } from "../../api/giftCards";
import { listEmployees } from "../../api/employee";
import { listServices } from "../../api/service";

export default function ChooseProfessionalPage() {
  const { serviceId, subdomain } = useParams();
  const navigate = useNavigate();

  const [beautician, setBeautician] = useState(null);
  const [businessSettings, setBusinessSettings] = useState({});
  const [giftCards, setGiftCards] = useState([]);

  const [loadingHeader, setLoadingHeader] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [service, setService] = useState(null);
  const [loadingMain, setLoadingMain] = useState(true);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("any");

  const [ACCOUNT_ID, setACCOUNT_ID] = useState(null);

  // ---------------- LOAD BUSINESS BY SUBDOMAIN ----------------
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const res = await listBeauticians({ subdomain });
        const b = res.data?.[0];

        if (b) {
          setBeautician(b);
          setACCOUNT_ID(b.account_id);
        }
      } catch (err) {
        console.error("Beautician fetch failed:", err);
      }
    };

    loadBusiness();
  }, [subdomain]);

  // ---------------- HEADER / COVER DATA ----------------
  useEffect(() => {
    if (!ACCOUNT_ID) return;

    const loadHeader = async () => {
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
        setLoadingHeader(false);
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

  // ---------------- EMPLOYEES + SERVICE ----------------
  useEffect(() => {
    if (!ACCOUNT_ID) return;

    const loadData = async () => {
      setLoadingMain(true);
      try {
        const [empRes, srvRes] = await Promise.all([
          listEmployees({ account_id: ACCOUNT_ID }),
          listServices({ account_id: ACCOUNT_ID }),
        ]);

        const allEmployees = empRes?.data || [];
        const allServices = srvRes?.data || [];

        const currentService = allServices.find(
          (s) => String(s.Id) === String(serviceId)
        );
        setService(currentService || null);

        // Filter employees by service ID (services_full from backend)
        const filteredEmployees = allEmployees.filter((emp) =>
          (emp.services_full || []).some(
            (srv) => String(srv.Id) === String(serviceId)
          )
        );

        setEmployees(filteredEmployees);
      } catch (e) {
        console.error("Load data failed", e);
      } finally {
        setLoadingMain(false);
      }
    };

    loadData();
  }, [serviceId, ACCOUNT_ID]);

  const selectedEmployee =
    selectedEmployeeId === "any"
      ? null
      : employees.find((e) => String(e.id) === String(selectedEmployeeId));

  // ---------------- SKELETONS ----------------
  const SkeletonHeader = () => (
    <div className="w-full h-[430px] bg-gray-200 animate-pulse mt-[80px]" />
  );

  const SkeletonProCard = () => (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-200 p-6" />
  );

  const SkeletonSummary = () => (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-200 p-6 h-[420px]" />
  );

  // ---------------- UI COMPONENTS ----------------
  const ProfessionalCard = ({ employee, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-2xl border text-center py-8 px-4 transition-all
        ${
          isSelected
            ? "border-[#E86C28] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            : "border-[#E5E5E5] hover:border-[#E86C28]/60 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
        }`}
    >
      {employee.image && (
        <div className="flex justify-center mb-4">
          <img
            src={employee.image}
            alt={employee.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        </div>
      )}
      <div className="text-sm font-semibold text-[#222]">{employee.name}</div>
      {employee.title && (
        <div className="text-xs text-gray-500 mt-1">{employee.title}</div>
      )}
    </button>
  );

  const AnyProfessionalCard = ({ isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-2xl border text-center py-10 px-4 transition-all
        ${
          isSelected
            ? "border-[#E86C28] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            : "border-[#E5E5E5] hover:border-[#E86C28]/60 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
        }`}
    >
      <div className="text-sm font-semibold text-[#222]">Any Professional</div>
    </button>
  );

  // ---------------- RENDER ----------------
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-8">
          <div className="h-10 max-w-[180px] flex items-center">
            {loadingHeader ? (
              <div className="w-32 h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <img src={finalLogo} className="h-full w-full object-contain" />
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
      {loadingHeader ? (
        <SkeletonHeader />
      ) : (
        <div className="w-full h-[430px] mt-[80px] overflow-hidden relative">
          <img
            src={finalCover}
            className="w-full h-full object-cover brightness-[0.75]"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 className="text-white text-4xl font-semibold text-center drop-shadow-lg">
              Choose your Appointment
            </h1>
          </div>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="w-full bg-[#E86C28] h-11 flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-sm text-white">
          <span className="opacity-80">Services</span>
          <span className="mx-1">›</span>
          <span className="font-medium">Professional</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-12 gap-10">
        {/* LEFT SIDE */}
        <div className="col-span-12 lg:col-span-8">
          {loadingMain ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonProCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnyProfessionalCard
                isSelected={selectedEmployeeId === "any"}
                onClick={() => setSelectedEmployeeId("any")}
              />

              {employees.map((emp) => (
                <ProfessionalCard
                  key={emp.id}
                  employee={emp}
                  isSelected={String(emp.id) === String(selectedEmployeeId)}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SUMMARY CARD */}
        <div className="col-span-12 lg:col-span-4">
          {loadingMain || !service ? (
            <SkeletonSummary />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-full max-h-[480px]">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={service.ImagePath || "/images/dummy/dummy.png"}
                    alt={service.Name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#222] mb-1">
                    {service.Name}
                  </h3>

                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{businessLocation}</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {service.Deposit != null && (
                      <>
                        Min Deposit{" "}
                        {service.DepositType === 0
                          ? `${service.Deposit}%`
                          : `£${Number(service.Deposit).toFixed(2)}`}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2 text-xs text-gray-600">
                {service.DefaultAppointmentDuration}{" "}
                {service.DurationUnit === "hours" ? "hours" : "mins"}{" "}
                {selectedEmployee
                  ? `with ${selectedEmployee.name}`
                  : "with any professional"}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-4 flex justify-between text-sm">
                <span className="font-semibold text-[#222]">Total:</span>
                <span className="font-semibold text-[#222]">
                  £{Number(service.TotalPrice).toFixed(2)}
                </span>
              </div>

              <button
                className="mt-6 w-full py-2.5 rounded-full bg-[#E86C28]
                           text-white font-medium hover:bg-[#cf5f20] transition"
                onClick={() =>
                  navigate(
                    `/${subdomain}/booking/${serviceId}/${selectedEmployeeId}`
                  )
                }
              >
                Continue
              </button>
            </div>
          )}
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
