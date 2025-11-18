import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  // 🔹 Dynamic auth state
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("authToken"),
    userRole: localStorage.getItem("userRole"),
    user: JSON.parse(localStorage.getItem("user") || "{}"),
  });

  // 🔁 Listen to global login/logout events
  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState({
        token: localStorage.getItem("authToken"),
        userRole: localStorage.getItem("userRole"),
        user: JSON.parse(localStorage.getItem("user") || "{}"),
      });
    };

    window.addEventListener("user-login", handleAuthChange);
    window.addEventListener("user-logout", handleAuthChange);

    return () => {
      window.removeEventListener("user-login", handleAuthChange);
      window.removeEventListener("user-logout", handleAuthChange);
    };
  }, []);

  const { token, userRole, user } = authState;

  // 🔎 Determine which login screen a user should go to
  const getLoginRedirect = () => {
    const path = location.pathname;

    // Customer area
    if (path.startsWith("/client")) {
      return "/login";
    }

    // Accountant area
    if (path.startsWith("/accountant")) {
      return "/accountant/login";
    }

    // Business area
    if (path.startsWith("/business")) {
      return "/admin/login";
    }

    // General dashboard fallback (business/admin)
    if (path.startsWith("/dashboard")) {
      return "/admin/login";
    }

    // DEFAULT fallback → Admin login
    return "/admin/login";
  };

  // 🔒 If no token → login redirect
  if (!token) {
    return <Navigate to={getLoginRedirect()} replace />;
  }

  // 🔒 Missing user data → login redirect
  if (!user || !userRole) {
    return <Navigate to={getLoginRedirect()} replace />;
  }

  // ❌ Role not allowed → go to unauthorized
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✔ Authorized → Render page
  return <Outlet />;
}
