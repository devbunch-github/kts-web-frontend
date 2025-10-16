import { useState, useEffect } from "react";

const AdminHeader = () => {
  const [user, setUser] = useState(null);
  
  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
        setUser(null);
      }
    };

    // Initial load
    loadUser();

    // ✅ Listen for login/logout events globally
    window.addEventListener("user-login", loadUser);
    window.addEventListener("user-logout", loadUser);

    return () => {
      window.removeEventListener("user-login", loadUser);
      window.removeEventListener("user-logout", loadUser);
    };
  }, []);


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
          <div className="text-sm text-gray-700">{user?.name ? user.name : "Guest"}</div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
