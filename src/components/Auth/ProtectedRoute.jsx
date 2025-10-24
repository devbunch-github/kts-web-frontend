import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const userRole = localStorage.getItem("userRole");
	const token = localStorage.getItem("authToken");
	const location = useLocation();

	// 1. Token validation
	if (!token) {
	// Determine which login to redirect based on current URL
	if (location.pathname.startsWith("/accountant")) {
		return <Navigate to="/accountant/login" replace />;
	} else if (location.pathname.startsWith("/business")) {
		return <Navigate to="/business/login" replace />;
	} else {
		return <Navigate to="/admin/login" replace />;
	}
	}

	// 2. If no user data stored, force login
	if (!user || !userRole) {
	if (location.pathname.startsWith("/accountant")) {
		return <Navigate to="/accountant/login" replace />;
	} else if (location.pathname.startsWith("/business")) {
		return <Navigate to="/business/login" replace />;
	} else {
		return <Navigate to="/admin/login" replace />;
	}
	}

	// 3. Role-based access control
	if (allowedRoles.length && !allowedRoles.includes(userRole)) {
	return <Navigate to="/unauthorized" replace />;
	}

	// All good — render nested route
	return <Outlet />;
}
