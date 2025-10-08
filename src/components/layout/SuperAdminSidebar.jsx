import React from "react";

const AdminSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 px-4 py-6 text-sm">
      <nav className="space-y-3">
        <a
          href="#"
          className="flex items-center gap-3 bg-rose-100 text-rose-700 px-3 py-2 rounded-lg font-medium"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a8626b"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-gray-700 px-3 py-2 rounded-lg hover:bg-rose-50"
        >
          Payment Settings
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-gray-700 px-3 py-2 rounded-lg hover:bg-rose-50"
        >
          SMS Package
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-gray-700 px-3 py-2 rounded-lg hover:bg-rose-50"
        >
          Subscription
        </a>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
