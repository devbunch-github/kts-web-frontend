import React from "react";

const AdminHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-6 py-3">
        {/* Brand */}
        <div className="flex items-center gap-1 text-2xl font-semibold">
          <span className="text-gray-800">appt</span>
          <span className="text-rose-500">.live</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8626b"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-3.5 5-5 8-5s6.5 1.5 8 5" />
            </svg>
          </div>
          <div className="text-sm text-gray-700">Kerri</div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
