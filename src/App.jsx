import { BrowserRouter, Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import PlansPage from "./pages/subscription/PlansPage";
import PaymentPage from "./pages/subscription/PaymentPage";
import ConfirmPage from "./pages/subscription/ConfirmPage";
import SetPasswordPage from "./pages/subscription/SetPasswordPage";
import PaymentCancelled from "./pages/subscription/PaymentCancelled";

import ProtectedRoute from "./components/Auth/ProtectedRoute";

import UnauthorizedPage from "./pages/admin/UnauthorizedPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminIncomePage from "./pages/admin/AdminIncomePage";
import AdminExpensePage from "./pages/admin/AdminExpensePage";
import PaymentSettingsPage from "./pages/admin/PaymentSettingsPage";
import SmsPackagesPage from "./pages/admin/SmsPackagesPage";
import AddSmsPackagePage from "./pages/admin/AddSmsPackagePage";
import SmsSubscriptionListPage from "./pages/admin/SmsSubscriptionListPage";
import SmsPurchaseBalancePage from "./pages/admin/SmsPurchaseBalancePage";
import SubscriptionPackages from "./pages/admin/SubscriptionPackages";
import AddSubscriptionPackage from "./pages/admin/AddSubscriptionPackage";
import SubscribersList from "./pages/admin/SubscribersList";

import IncomeIndex from "./pages/income/IncomeIndex";
import IncomeForm from "./pages/income/IncomeForm";
import IncomeView from "./pages/income/IncomeView";
import DashboardLayout from "./layouts/DashboardLayout";
import ExpenseIndex from "./pages/expenses/ExpenseIndex";
import ExpenseForm from "./pages/expenses/ExpenseForm";
import ExpenseView from "./pages/expenses/ExpenseView";
import ServiceIndex from "./pages/service/ServiceIndex";
import ServiceForm from "./pages/service/ServiceForm";
import CategoryForm from "./pages/service/CategoryForm";

import CustomerList from "./pages/customer/CustomerList";
import CustomerForm from "./pages/customer/CustomerForm";
import CustomerReviews from "./pages/customer/CustomerReviews";
import CustomerGiftCardList from "./pages/customer/CustomerGiftCardList";

import EmployeeIndex from "./pages/employee/EmployeeIndex";
import EmployeeForm from "./pages/employee/EmployeeForm";
import EmployeeSchedule from "./pages/employee/EmployeeSchedule";
import EmployeeCalendar from "./pages/employee/EmployeeCalendar";

// ✅ New Appointment Pages
import AppointmentIndex from "./pages/appointment/AppointmentIndex";
import AppointmentForm from "./pages/appointment/AppointmentForm";


import PaymentSettings from "./pages/payment/PaymentSettings";

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

        {/* Protected SuperAdmin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
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
          <Route path="/admin/subscription" element={<SubscriptionPackages />} />
          <Route path="/admin/subscription/add" element={<AddSubscriptionPackage />} />
          <Route path="/admin/subscription/edit/:id" element={<AddSubscriptionPackage />} />
          <Route path="/admin/subscription/subscribers" element={<SubscribersList />} />
        </Route>

        {/* Unauthorized and fallback */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />

        {/* Business Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default */}
          <Route index element={<IncomeIndex />} />

          {/* Income */}
          <Route path="income" element={<IncomeIndex />} />
          <Route path="income/new" element={<IncomeForm />} />
          <Route path="income/:id/edit" element={<IncomeForm />} />
          <Route path="income/:id" element={<IncomeView />} />

          {/* Expense */}
          <Route path="expense" element={<ExpenseIndex />} />
          <Route path="expense/new" element={<ExpenseForm />} />
          <Route path="expense/:id/edit" element={<ExpenseForm />} />
          <Route path="expense/:id" element={<ExpenseView />} />

          {/* Services */}
          <Route path="services" element={<ServiceIndex />} />
          <Route path="services/new" element={<ServiceForm />} />
          <Route path="services/:id/edit" element={<ServiceForm />} />

          {/* Categories */}
          <Route path="services/categories/new" element={<CategoryForm />} />
          <Route path="services/categories/:id/edit" element={<CategoryForm />} />

          {/* Customers */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />
          <Route path="customers/view/:id" element={<CustomerForm viewOnly={true} />} />
          <Route path="customers/reviews" element={<CustomerReviews />} />
          <Route path="customers/gift-cards" element={<CustomerGiftCardList />} />

          {/* Employees */}
          <Route path="employees" element={<EmployeeIndex />} />
          <Route path="employees/new" element={<EmployeeForm />} />
          <Route path="employees/:id/edit" element={<EmployeeForm />} />
          <Route path="employees/:id/schedule" element={<EmployeeSchedule />} />
          <Route path="employees/:id/calendar" element={<EmployeeCalendar />} />

          {/* ✅ Appointments */}
          <Route path="appointments" element={<AppointmentIndex />} />
          <Route path="appointments/new" element={<AppointmentForm />} />
          <Route path="appointments/:id/edit" element={<AppointmentForm />} />

          {/* Payment */}
          <Route path="payment" element={<PaymentSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
