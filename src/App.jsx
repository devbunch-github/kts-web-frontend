import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import PlansPage from "./pages/subscription/PlansPage";
import PaymentPage from "./pages/subscription/PaymentPage";
import ConfirmPage from "./pages/subscription/ConfirmPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import SetPasswordPage from "./pages/subscription/SetPasswordPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/subscription" element={<PlansPage />} />
        <Route path="/subscription/payment" element={<PaymentPage />} />
        <Route path="/subscription/confirm" element={<ConfirmPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/subscription/set-password" element={<SetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}
