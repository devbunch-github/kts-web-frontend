import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  // 🔹 State to react to login/logout changes dynamically
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("authToken"),
    userRole: localStorage.getItem("userRole"),
    user: JSON.parse(localStorage.getItem("user") || "{}"),
  });

  // 🔁 Watch for custom login/logout events to auto-update
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

  // Helper: decide where to send user for login
  const getLoginRedirect = () => {
    if (location.pathname.startsWith("/accountant")) {
      return "/accountant/login";
    } else if (location.pathname.startsWith("/business")) {
      return "/admin/login";
    } else if (location.pathname.startsWith("/dashboard")) {
      // business dashboard shortcut
      return "/admin/login";
    } else {
      return "/admin/login";
    }
  };

  // 🔒 No token → force login
  if (!token) {
    return <Navigate to={getLoginRedirect()} replace />;
  }

  // Missing user or role → force login again
  if (!user || !userRole) {
    return <Navigate to={getLoginRedirect()} replace />;
  }

  // Role not permitted → Unauthorized page
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized — render nested route
  return <Outlet />;
}
