import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { LayoutDashboard, DollarSign, Receipt } from "lucide-react";

export default function AccountantLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isRevoked = user?.is_active == 0;

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("apptlive_user");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("userRole");
    navigate("/accountant/login");
  };

  return (
    <div className="flex flex-col min-h-screen font-[Poppins,sans-serif] bg-[#fffaf6]">
      {/* 🔹 Header */}
      <header className="bg-white border-b shadow-sm h-14 flex items-center justify-between px-6">
        {/* Logo */}
        <h1 className="text-2xl font-semibold tracking-[0.5em] text-gray-900 select-none">
          OCTANE
        </h1>

        {/* User Menu */}
        <div className="relative">
          <button
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className="fa-regular fa-user text-sm"></i>
            <span className="text-sm font-medium">{user?.name || "Mari"}</span>
            <i className="fa-solid fa-chevron-down text-xs"></i>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border z-10">
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 🔹 Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (only show if NOT revoked) */}
        {!isRevoked && (
          <aside className="w-56 bg-white border-r shadow-sm flex flex-col">
            <nav className="flex flex-col p-4 space-y-2 mt-4">
              <NavLink
                to="/accountant/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 font-medium ${
                    isActive
                      ? "bg-[#f28c38] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </NavLink>

              <NavLink
                to="/accountant/income"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 font-medium ${
                    isActive
                      ? "bg-[#f28c38] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <DollarSign className="w-4 h-4" /> Income
              </NavLink>

              <NavLink
                to="/accountant/expense"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 font-medium ${
                    isActive
                      ? "bg-[#f28c38] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Receipt className="w-4 h-4" /> Expense
              </NavLink>
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 p-8">
            <Outlet />
          </div>

          {/* 🔹 Footer */}
          <footer className="text-center text-xs text-gray-500 py-4 border-t bg-[#fffaf6]">
            Copyright © {new Date().getFullYear()} Octane
          </footer>
        </main>
      </div>
    </div>
  );
}
