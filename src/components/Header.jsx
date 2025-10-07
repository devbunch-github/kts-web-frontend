import { useState, useEffect } from "react";
import SignupModal from "./Auth/SignupModal";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("apptlive_user");
      setUser(stored ? JSON.parse(stored) : null);
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

  const handleLogout = () => {
    localStorage.removeItem("apptlive_user");
    setUser(null);
    window.dispatchEvent(new Event("user-logout"));
    navigate("/");
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
    { name: "Subscription", path: "/subscription" },
  ];

  const contactIcons = [
    { icon: "/images/icons/material-symbols_call.png", label: "Phone" },
    { icon: "/images/icons/mail-fill (1) 1.png", label: "Email" },
    { icon: "/images/icons/lets-icons_insta.png", label: "Instagram" },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 z-[999] w-full bg-white shadow-sm 
                   border-b border-[#eee] backdrop-blur-md"
      >
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-[10px]">
          {/* Left Menu */}
          <nav className="flex items-center gap-5">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-1.5 text-[14px] font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-[#b97979] border-b-[2px] border-[#b97979] pb-[2px]"
                    : "text-[#555] hover:text-[#b97979]"
                }`}
              >
                {item.name === "Home" && (
                  <img
                    src="/images/icons/home-9-fill 1.png"
                    alt=""
                    className="h-[16px] w-[16px] object-contain"
                  />
                )}
                {item.name === "Contact" && (
                  <img
                    src="/images/icons/mail-fill (1) 1.png"
                    alt=""
                    className="h-[16px] w-[16px] object-contain"
                  />
                )}
                {item.name === "Subscription" && (
                  <img
                    src="/images/icons/money-pound-box-line 1.png"
                    alt=""
                    className="h-[16px] w-[16px] object-contain"
                  />
                )}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Center Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <img
              src="/images/icons/appt.live.png"
              alt="appt.live"
              className="h-[36px] w-auto"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {contactIcons.map((c) => (
              <div key={c.label} className="flex items-center gap-1 text-[14px] text-[#555]">
                <img src={c.icon} alt={c.label} className="h-[14px] w-[14px] object-contain" />
                <span className="text-[13px]">{c.label}</span>
              </div>
            ))}

            {/* Logged-in user OR signup button */}
            {user ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full bg-[#b97979]/10 px-4 py-[6px] text-[13px] font-semibold text-[#b97979] hover:bg-[#b97979]/20"
                >
                  <i className="fa fa-user text-[#b97979]"></i> {user.name || "User"}
                  <i
                    className={`fa fa-chevron-down text-[10px] transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>

                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 bg-white border border-[#eee] rounded-md shadow-lg w-[160px] text-left z-50"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[14px] text-[#444] hover:bg-[#f9f9f9]"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[14px] text-[#b97979] hover:bg-[#f9f9f9]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSignup(true)}
                className="ml-3 rounded-full bg-[#c98383] px-5 py-[6px] text-[13px] font-semibold text-white hover:bg-[#b97474] transition-all"
              >
                Add Your Business
              </button>
            )}

          </div>
        </div>
      </header>

      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
    </>
  );
}
