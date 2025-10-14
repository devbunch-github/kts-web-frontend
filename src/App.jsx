import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import PlansPage from "./pages/subscription/PlansPage";
import PaymentPage from "./pages/subscription/PaymentPage";
import ConfirmPage from "./pages/subscription/ConfirmPage";
import SetPasswordPage from "./pages/subscription/SetPasswordPage";
import PaymentCancelled from "./pages/subscription/PaymentCancelled";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminIncomePage from "./pages/admin/AdminIncomePage";
import AdminExpensePage from "./pages/admin/AdminExpensePage";
import PaymentSettingsPage from "./pages/admin/PaymentSettingsPage";
import SmsPackagesPage from "./pages/admin/SmsPackagesPage";
import AddSmsPackagePage from "./pages/admin/AddSmsPackagePage";
import SmsSubscriptionListPage from "./pages/admin/SmsSubscriptionListPage";
import SmsPurchaseBalancePage from "./pages/admin/SmsPurchaseBalancePage";

import IncomeIndex from "./pages/income/IncomeIndex";
import IncomeForm from "./pages/income/IncomeForm";
import IncomeView from "./pages/income/IncomeView";
import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public + Subscription Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/subscription" element={<PlansPage />} />
          <Route path="/subscription/payment" element={<PaymentPage />} />
          <Route path="/subscription/confirm" element={<ConfirmPage />} />
          <Route path="/subscription/set-password" element={<SetPasswordPage />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          
          
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/income" element={<AdminIncomePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/income/:id" element={<AdminIncomePage />} />
        <Route path="/admin/expense/:id" element={<AdminExpensePage />} />
        <Route path="/admin/payment-settings" element={<PaymentSettingsPage />} />

        <Route path="/admin/sms-packages" element={<SmsPackagesPage />} />
        <Route path="/admin/sms-packages/add" element={<AddSmsPackagePage />} />
        <Route path="/admin/sms-packages/edit/:id" element={<AddSmsPackagePage />} />   
        <Route path="/admin/sms-subscriptions" element={<SmsSubscriptionListPage />} />
        <Route path="/admin/sms-purchase-balance" element={<SmsPurchaseBalancePage />} />


        {/* Business Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<IncomeIndex />} />
          <Route path="income" element={<IncomeIndex />} />
          <Route path="income/new" element={<IncomeForm />} />
          <Route path="income/:id/edit" element={<IncomeForm />} />
          <Route path="income/:id" element={<IncomeView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
