import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSmsMenuOpen, setIsSmsMenuOpen] = useState(false);
  const [isSubsMenuOpen, setIsSubsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-rose-100 text-rose-700"
        : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
    }`;

  // Auto-open SMS submenu
  useEffect(() => {
    if (
      location.pathname.includes("/admin/sms-subscriptions") ||
      location.pathname.includes("/admin/sms-purchase-balance") ||
      location.pathname === "/admin/sms-packages"
    ) {
      setIsSmsMenuOpen(true);
    }
  }, [location.pathname]);

  // Auto-open Subscription submenu when on any subscription route
  useEffect(() => {
    if (
      location.pathname === "/admin/subscription" ||
      location.pathname.startsWith("/admin/subscription/subscribers") ||
      location.pathname.startsWith("/admin/subscription/edit")
    ) {
      setIsSubsMenuOpen(true);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-rose-500 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto z-30 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out bg-white border-r border-gray-200 w-60 px-4 py-6 text-sm flex flex-col`}
      >
        <nav className="space-y-3">
          {/* Dashboard */}
          <NavLink to="/admin/dashboard" className={linkClasses}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8626b" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </NavLink>

          {/* Payment Settings */}
          <NavLink to="/admin/payment-settings" className={linkClasses}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#a8626b" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18m-9 8h9m-9 4h9" />
            </svg>
            Payment Settings
          </NavLink>

          {/* SMS (main + submenu) */}
          <div>
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
                location.pathname.startsWith("/admin/sms")
                  ? "bg-rose-100 text-rose-700"
                  : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
              }`}
              onClick={() => {
                navigate("/admin/sms-packages");
                setIsSmsMenuOpen((s) => !s);
              }}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#a8626b" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18" />
                </svg>
                SMS Package
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${isSmsMenuOpen ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {isSmsMenuOpen && (
              <div className="ml-6 mt-2 space-y-1">
                <NavLink
                  to="/admin/sms-subscriptions"
                  className={({ isActive }) =>
                    `block px-3 py-1.5 rounded-md text-sm font-medium ${
                      isActive ? "bg-rose-100 text-rose-700" : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                    }`
                  }
                >
                  SMS Subscription List
                </NavLink>
                <NavLink
                  to="/admin/sms-purchase-balance"
                  className={({ isActive }) =>
                    `block px-3 py-1.5 rounded-md text-sm font-medium ${
                      isActive ? "bg-rose-100 text-rose-700" : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                    }`
                  }
                >
                  SMS Purchase Balance
                </NavLink>
              </div>
            )}
          </div>

          {/* Subscription (main links to packages; submenu only has Subscribers List) */}
          <div>
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
                location.pathname.startsWith("/admin/subscription")
                  ? "bg-rose-100 text-rose-700"
                  : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
              }`}
              onClick={() => {
                navigate("/admin/subscription"); // main item = packages
                setIsSubsMenuOpen((s) => !s);
              }}
            >
              <span className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#a8626b" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8m-8 8a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
                Subscription
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${isSubsMenuOpen ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="#a8626b"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {isSubsMenuOpen && (
              <div className="ml-6 mt-2 space-y-1">
                <NavLink
                  to="/admin/subscription/subscribers"
                  className={({ isActive }) =>
                    `block px-3 py-1.5 rounded-md text-sm font-medium ${
                      isActive ? "bg-rose-100 text-rose-700" : "text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                    }`
                  }
                >
                  Subscribers List
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default AdminSidebar;
