import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = localStorage.getItem("userRole");
//   const token = localStorage.getItem("authToken");

  // If no token, redirect to login page
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

  // 🔒 If no user in storage, force login
  if (!user || !userRole) {
    return <Navigate to="/admin/login" replace />;
  }

  // 🔒 Role-based access check
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authorized — allow rendering
  return <Outlet />;
}
