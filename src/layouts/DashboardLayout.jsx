import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function DashboardLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", path: "/dashboard/income", icon: "📊" },
    { name: "Income", path: "/dashboard/income" },
    { name: "Expense", path: "/dashboard/expense" },
    { name: "Service", path: "/dashboard/services" },
    { name: "Customer", path: "/dashboard/customer" },
    { name: "Employee", path: "/dashboard/employee" },
    { name: "Payment", path: "/dashboard/payment" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-[#faf7f7]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 px-4 py-6 text-sm">
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src="/images/icons/appt.live.png" alt="logo" className="h-6" />
        </div>
        <nav className="space-y-2">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-rose-100 text-rose-700"
                  : "text-gray-700 hover:bg-rose-50"
              }`}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
