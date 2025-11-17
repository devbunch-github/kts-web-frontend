import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  LogOut,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import SetupBusinessModal from "@/components/SetupBusinessModal";
import BusinessTodoModal from "@/components/todo/BusinessTodoModal";
import SubscriptionExpired from "@/components/subscription/BusinessAdminSubscriptionExpired";
import { getMySubscription } from "@/api/businessadminsubscription";
import NotificationDropdown from "@/components/NotificationDropdown";
import { getBusinessProfile } from "@/api/businessProfile";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [todoOpen, setTodoOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", image: "" });
  const profileRef = useRef(null);
  const [subStatus, setSubStatus] = useState("loading");

  const toggleMenu = (name) =>
    setOpenMenu((prev) => (prev === name ? null : name));

  /* ---------- Profile dropdown outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- Subscription check ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getMySubscription();
        const status = res?.status?.toLowerCase?.() || "inactive";
        const expired = res?.ends_at && new Date(res.ends_at) < new Date();
        if (status === "active" && !expired) setSubStatus("active");
        else if (expired) setSubStatus("expired");
        else setSubStatus(status);
      } catch {
        toast.error("Unable to verify subscription.");
        setSubStatus("inactive");
      }
    })();
  }, []);

  /* ---------- Load user info ---------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await getBusinessProfile();
        setUserInfo({
          name: data?.name || "Admin",
          image: data?.image_url || "/images/icons/default-avatar.png",
        });
      } catch {
        setUserInfo({ name: "Admin", image: "/images/icons/default-avatar.png" });
      }
    })();
  }, []);

  /* ---------- Sidebar Menu ---------- */
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Income", path: "/dashboard/income" },
    { name: "Expense", path: "/dashboard/expense" },
    { name: "Service", path: "/dashboard/services" },
    {
      name: "Customer",
      path: "/dashboard/customers",
      hasChildren: true,
      children: [
        { name: "Customer List", path: "/dashboard/customers" },
        { name: "Appointment List", path: "/dashboard/appointments" },
        { name: "Reviews", path: "/dashboard/customers/reviews" },
        { name: "Gift Card List", path: "/dashboard/customers/gift-cards" },
      ],
    },
    { name: "Employee", path: "/dashboard/employees" },
    { name: "Appointment", path: "/dashboard/appointments" },
    { name: "Payment", path: "/dashboard/payment" },
    { name: "SMS Packages", path: "/dashboard/sms-packages" },
    { name: "Accountant", path: "/dashboard/accountant" },
    { name: "Promo Codes", path: "/dashboard/promo-codes" },
    { name: "Gift Cards", path: "/dashboard/gift-cards" },
    { name: "Messages", path: "/dashboard/email-messages" },
    { name: "Loyalty Card", path: "/dashboard/loyalty-card" },
    { name: "Loyalty Program", path: "/dashboard/loyalty-program" },
    { name: "Forms", path: "/dashboard/forms" },
    {
      name: "Reports",
      path: "/dashboard/reports",
      hasChildren: true,
      children: [
        { name: "Overview", path: "/dashboard/reports" },
        { name: "Service Report", path: "/dashboard/reports/service-report" },
        { name: "Client Report", path: "/dashboard/reports/client-report" },
        {
          name: "Appointment Completion",
          path: "/dashboard/reports/appointment-report",
        },
        { name: "Profit & Loss Report", path: "/dashboard/reports/profitloss-report" },
        { name: "Cancellation Report", path: "/dashboard/reports/cancellation-report" },
        { name: "Income-Sale", path: "/dashboard/reports/sale-report" },
        { name: "Client Retention Rate", path: "/dashboard/reports/retention-report" },
      ],
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      hasChildren: true,
      children: [{ name: "Set Rota", path: "/dashboard/settings/set-rota" }],
    },
  ];

  if (subStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f7] text-gray-500">
        Checking subscription status...
      </div>
    );
  }

  const isLocked =
    ["expired", "cancelled", "inactive"].includes(subStatus) &&
    !location.pathname.includes("/dashboard/subscription");

  /* =====================================================
     LAYOUT
  ===================================================== */
  return (
    <div className="min-h-screen flex bg-[#faf7f7] relative">
      {/* ================= Sidebar ================= */}
      <aside
        className={`hidden md:flex flex-col w-60 bg-white border-r border-gray-200 px-4 py-6 text-sm transition-all duration-300 ${
          isLocked ? "opacity-60 blur-[1px] pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src="/images/icons/appt.live.png" alt="logo" className="h-6" />
        </div>

        <nav className="space-y-1">
          {menu.map((item) => {
            /* ---------- Collapsible Menu ---------- */
            if (item.hasChildren) {
              const isOpen =
                openMenu === item.name ||
                item.children.some((child) =>
                  location.pathname.startsWith(child.path)
                );

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                      isOpen
                        ? "bg-rose-100 text-rose-700"
                        : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && <span>{item.icon}</span>}
                      {item.name}
                    </span>
                    {isOpen ? (
                      <ChevronDown size={16} className="text-rose-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ml-4 border-l border-rose-100 ${
                      isOpen ? "max-h-[400px] opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`relative block pl-4 pr-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                          location.pathname === child.path
                            ? "text-rose-700 bg-rose-50 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-rose-400"
                            : "text-gray-600 hover:text-rose-700 hover:bg-rose-50"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            /* ---------- Single Menu Item ---------- */
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? "bg-rose-100 text-rose-700"
                    : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ================= Main Content ================= */}
      <main className="flex-1 relative">
        {/* ---------- Topbar ---------- */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <NotificationDropdown />

            <button
              onClick={() => setTodoOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-rose-50"
            >
              <FileText size={16} />
              <span className="text-sm font-medium">Notes</span>
            </button>

            {/* ---------- Profile Dropdown ---------- */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white rounded-full hover:bg-rose-50 transition"
              >
                <img
                  src={userInfo.image}
                  alt="profile"
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
                <div className="text-sm text-gray-700">{userInfo.name}</div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/dashboard/profile");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                  >
                    <User size={14} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/dashboard/subscription");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                  >
                    <CreditCard size={14} /> Subscription
                  </button>
                  <hr className="border-gray-100" />
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50"
                  >
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Page Content ---------- */}
        <div className="p-6 md:p-10">
          <Outlet />
        </div>

        <SetupBusinessModal />
        <BusinessTodoModal open={todoOpen} onClose={() => setTodoOpen(false)} />

        {/* ---------- Subscription Lock Overlay ---------- */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#faf7f7]/60 backdrop-blur-sm z-50">
            <SubscriptionExpired />
          </div>
        )}
      </main>
    </div>
  );
}
