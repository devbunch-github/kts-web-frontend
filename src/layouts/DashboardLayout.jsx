import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SetupBusinessModal from "@/components/SetupBusinessModal";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

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
    {
      name: "Settings",
      path: "/dashboard/settings",
      hasChildren: true,
      children: [{ name: "Set Rota", path: "/dashboard/settings/set-rota" }],
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#faf7f7]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 px-4 py-6 text-sm">
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src="/images/icons/appt.live.png" alt="logo" className="h-6" />
        </div>

        <nav className="space-y-1">
          {menu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            if (item.hasChildren) {
              const isOpen = openMenu === item.name;

              return (
                <div key={item.path} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    {/* Parent link */}
                    <button
                      onClick={() => navigate(item.path)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? "bg-rose-100 text-rose-700"
                          : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                      }`}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.name}
                    </button>

                    {/* Toggle arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(item.name);
                      }}
                      className="p-1"
                    >
                      {isOpen ? (
                        <ChevronDown size={16} className="text-gray-600" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-600" />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-3">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
                            location.pathname === sub.path
                              ? "bg-rose-100 text-rose-700"
                              : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? "bg-rose-100 text-rose-700"
                    : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        <Outlet />
        <SetupBusinessModal />
      </main>
    </div>
  );
}
