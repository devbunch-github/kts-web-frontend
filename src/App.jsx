import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import PlansPage from "./pages/subscription/PlansPage";
import PaymentPage from "./pages/subscription/PaymentPage";
import ConfirmPage from "./pages/subscription/ConfirmPage";
import SetPasswordPage from "./pages/subscription/SetPasswordPage";
import PaymentCancelled from "./pages/subscription/PaymentCancelled";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/subscription" element={<PlansPage />} />
        <Route path="/subscription/payment" element={<PaymentPage />} />
        <Route path="/subscription/confirm" element={<ConfirmPage />} />
        <Route path="/subscription/set-password" element={<SetPasswordPage />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />
      </Routes>
    </BrowserRouter>
  );
}
