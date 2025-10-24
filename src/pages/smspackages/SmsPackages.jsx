import { useEffect, useState } from "react";
import { getSmsPackages } from "../../api/sms";
import { useNavigate, useLocation } from "react-router-dom";

export default function SmsPackages() {
  const [packages, setPackages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [smsReminderEnabled, setSmsReminderEnabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await getSmsPackages();
        if (res?.success && Array.isArray(res.data)) {
          setPackages(res.data);

          // ✅ Only activate a plan if redirected after payment
          if (location?.state?.activatedPackageId) {
            setActiveId(location.state.activatedPackageId);
          } else {
            setActiveId(null); // ✅ explicitly reset if no redirect
          }
        }
      } catch (err) {
        console.error("Failed to fetch SMS packages", err);
      }
    };

    fetchPackages();
  }, [location?.state]);

  const handleChoosePlan = (pkgId) => {
    navigate(`/dashboard/sms-packages/payment/${pkgId}`);
  };

  const toggleSmsReminder = () => {
    setSmsReminderEnabled((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#faf7f7] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-rose-100 p-2 rounded-lg">
            <i className="bi bi-chat-left-text text-rose-500 text-lg"></i>
          </div>
          <h1 className="text-[22px] font-semibold text-gray-800">
            SMS Packages
          </h1>
        </div>

        {/* ✅ Show SMS Reminder toggle only if user has active plan */}
        {activeId && (
          <div className="flex items-center gap-3 mb-8">
            <span className="font-medium text-gray-800">SMS Reminders</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsReminderEnabled}
                onChange={toggleSmsReminder}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#b77272] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <p className="text-sm text-gray-500">
              Select to enable SMS reminders for appointments. This will use SMS
              credits from your purchased package.
            </p>
          </div>
        )}

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isActive = activeId && pkg.id === activeId; // ✅ strictly require redirect-based id

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border p-6 text-center shadow-sm transition hover:shadow-md ${
                  isActive
                    ? "border-[#b77272] bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* ✅ Only show Active badge when truly purchased */}
                {isActive && (
                  <span className="absolute top-0 left-0 bg-[#b77272] text-white text-xs px-4 py-1 rounded-tl-2xl rounded-br-2xl">
                    Active
                  </span>
                )}

                <h3 className="text-lg font-semibold text-gray-800 mt-4">
                  {pkg.name}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2 mb-1">
                  £{parseFloat(pkg.price).toFixed(0)}
                </p>
                <p className="text-gray-500 mb-4">
                  {pkg.total_sms} SMS/month
                </p>

                <p className="text-gray-500 text-sm mb-6 px-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>

                {!activeId ? (
                  // 🆕 No active plan yet
                  <button
                    onClick={() => handleChoosePlan(pkg.id)}
                    className="border border-[#b77272] text-[#b77272] font-medium rounded-md px-6 py-2 hover:bg-[#b77272]/10 transition"
                  >
                    Choose Plan
                  </button>
                ) : isActive ? (
                  // ✅ Current active plan
                  <button
                    disabled
                    className="bg-[#b77272] text-white font-medium rounded-md px-6 py-2 cursor-default opacity-90"
                  >
                    Current Plan
                  </button>
                ) : (
                  // 🔼 Any other plan
                  <button
                    onClick={() => handleChoosePlan(pkg.id)}
                    className="border border-[#b77272] text-[#b77272] font-medium rounded-md px-6 py-2 hover:bg-[#b77272]/10 transition"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
