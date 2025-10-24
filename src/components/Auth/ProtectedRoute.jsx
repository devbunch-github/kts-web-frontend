import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("authToken"),
    userRole: localStorage.getItem("userRole"),
    user: JSON.parse(localStorage.getItem("user") || "{}"),
  });

  // 🧠 Re-check auth whenever login/logout events occur
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

  // 🔒 No token → force login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 No user or role → force login
  if (!user || !userRole) {
    return <Navigate to="/admin/login" replace />;
  }

  // 🔒 Role not allowed → unauthorized page
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authorized
  return <Outlet />;
}
