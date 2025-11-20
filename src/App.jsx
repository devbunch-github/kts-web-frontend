import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { PublicBusinessProvider } from "./context/PublicBusinessContext";

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

import AppointmentIndex from "./pages/appointment/AppointmentIndex";
import AppointmentForm from "./pages/appointment/AppointmentForm";

import PaymentSettings from "./pages/payment/PaymentSettings";
import SmsPackagePayment from "./pages/smspackages/SmsPackagePayment";

import Accountant from "./pages/accountant/Accountant";
import AddAccountant from "./pages/accountant/AddAccountant";

import AccountantLayout from "./layouts/AccountantLayout";
import AccountantLogin from "./pages/accountantdashboard/AccountantLogin";
import AccountantDashboard from "./pages/accountantdashboard/AccountantDashboard";
import AccountantIncome from "./pages/accountantdashboard/AccountantIncome";
import AccountantIncomeEdit from "./pages/accountantdashboard/AccountantIncomeEdit";
import AccountantExpense from "./pages/accountantdashboard/AccountantExpense";
import AccountantExpenseEdit from "./pages/accountantdashboard/AccountantExpenseEdit";
import AccountantSummary from "./pages/accountantdashboard/AccountantSummary";
import BusinessDashboard from "./pages/dashboard/BusinessDashboard";

import PromoCodeIndex from "./pages/PromoCodes/PromoCodeIndex";
import PromoCodeForm from "./pages/PromoCodes/PromoCodeForm";

import GiftCardIndex from "./pages/gift-cards/GiftCardIndex";
import GiftCardForm from "./pages/gift-cards/GiftCardForm";

import EmailMessagesIndex from "./pages/email-messages/EmailMessagesIndex";
import EmailMessageEdit from "./pages/email-messages/EmailMessageEdit";

import ClientLayout from "./layouts/ClientLayout";
import ClientLogin from "./pages/client/ClientLogin";
import ClientDashboard from "./pages/client/ClientDashboard";
import LoyaltyCardPage from "./pages/loyalty/LoyaltyCardPage";
import LoyaltyProgramPage from "./pages/loyalty/LoyaltyProgramPage";

import SettingsIndex from "./pages/settings/businessadmin/SettingsIndex";
import SetRotaPage from "./pages/settings/rota/SetRotaPage";

import BusinessFormsIndex from "./pages/forms/BusinessFormsIndex";
import BusinessFormEditor from "./pages/forms/BusinessFormEditor";

import BusinessSubscriptionPage from "./pages/subscription/BusinessSubscriptionPage";
import BusinessAdminProfile from "./pages/dashboard/ProfilePage";

import BusinessReports from "./pages/businessreports/BusinessReports.jsx";
import ServiceReport from "./pages/reports/ServiceReport.jsx";
import ClientReport from "./pages/reports/ClientReport.jsx";
import AppointmentCompletionReport from "./pages/reports/AppointmentCompletionReport.jsx";
import ProfitLossReport from "./pages/reports/ProfitLossReport.jsx";
import CancellationReport from "./pages/reports/CancellationReport.jsx";
import IncomeSaleReport from "./pages/reports/IncomeSaleReport.jsx";
import ClientRetentionReport from "./pages/reports/ClientRetentionReport.jsx";

import BusinessHomePage from "./pages/public/BusinessHomePage.jsx";
import CategoryServicesPage from "./pages/public/CategoryServicesPage.jsx";
import ChooseProfessionalPage from "./pages/public/ChooseProfessionalPage.jsx";
import ChooseAppointmentPage from "./pages/public/ChooseAppointmentPage.jsx";
import PaymentMethodsPage from "./pages/public/PaymentMethodsPage";
import PaymentSuccessPage from "./pages/public/PaymentSuccessPage";

export default function App() {
  return (
    <PublicBusinessProvider>
      <BrowserRouter>
        <Routes>

          {/* ===================== PUBLIC BUSINESS ROUTES ===================== */}
          <Route path="/:subdomain">
            <Route index element={<BusinessHomePage />} />
            <Route path="categories/:id" element={<CategoryServicesPage />} />
            <Route path="services/:serviceId/professionals" element={<ChooseProfessionalPage />} />
            <Route path="booking/:serviceId/:employeeId" element={<ChooseAppointmentPage />} />
            <Route
              path="booking/:serviceId/:employeeId/payment/:appointmentId"
              element={<PaymentMethodsPage />}
            />
            <Route
              path="payment/success/:appointmentId"
              element={<PaymentSuccessPage />}
            />

            <Route
              path="payment/cancel/:appointmentId"
              element={<PaymentCancelled />}
            />
          </Route>

          {/* ===================== PUBLIC ROUTES ===================== */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/subscription" element={<PlansPage />} />
            <Route path="/subscription/payment" element={<PaymentPage />} />
            <Route path="/subscription/confirm" element={<ConfirmPage />} />
            <Route path="/subscription/set-password" element={<SetPasswordPage />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          </Route>

          {/* ===================== SUPER ADMIN ===================== */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/income" element={<AdminIncomePage />} />
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

          {/* ===================== UNAUTHORIZED ===================== */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />

          {/* ===================== BUSINESS ADMIN ROUTES ===================== */}
          <Route element={<ProtectedRoute allowedRoles={["business_admin", "business"]} />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              
              {/* Dashboard */}
              <Route index element={<BusinessDashboard />} />

              {/* Reports */}
              <Route path="reports" element={<BusinessReports />} />
              <Route path="reports/service-report" element={<ServiceReport />} />
              <Route path="reports/client-report" element={<ClientReport />} />
              <Route path="reports/appointment-report" element={<AppointmentCompletionReport />} />
              <Route path="reports/profitloss-report" element={<ProfitLossReport />} />
              <Route path="reports/cancellation-report" element={<CancellationReport />} />
              <Route path="reports/sale-report" element={<IncomeSaleReport />} />
              <Route path="reports/retention-report" element={<ClientRetentionReport />} />

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

              {/* Appointments */}
              <Route path="appointments" element={<AppointmentIndex />} />
              <Route path="appointments/new" element={<AppointmentForm />} />
              <Route path="appointments/:id/edit" element={<AppointmentForm />} />

              {/* Payment */}
              <Route path="payment" element={<PaymentSettings />} />

              {/* Accountant */}
              <Route path="accountant" element={<Accountant />} />
              <Route path="accountant/add" element={<AddAccountant />} />
              <Route path="accountant/edit/:id" element={<AddAccountant />} />

              {/* Promo Codes */}
              <Route path="promo-codes" element={<PromoCodeIndex />} />
              <Route path="promo-codes/new" element={<PromoCodeForm />} />
              <Route path="promo-codes/edit/:id" element={<PromoCodeForm />} />

              {/* Gift cards */}
              <Route  path="gift-cards" element={<GiftCardIndex />} />
              <Route path="gift-cards/new" element={<GiftCardForm />} />
              <Route path="gift-cards/edit/:id" element={<GiftCardForm />} />

              {/* Email messages */}
              <Route path="email-messages" element={<EmailMessagesIndex />} />
              <Route path="email-messages/:id/edit" element={<EmailMessageEdit />} />

              {/* Loyalty */}
              <Route path="loyalty-card" element={<LoyaltyCardPage />} />
              <Route path="loyalty-program" element={<LoyaltyProgramPage />} />

              {/* Forms */}
              <Route path="forms" element={<BusinessFormsIndex />} />
              <Route path="forms/new" element={<BusinessFormEditor />} />
              <Route path="forms/:id/edit" element={<BusinessFormEditor />} />

              {/* Subscription */}
              <Route path="subscription" element={<BusinessSubscriptionPage />} />

              {/* Profile */}
              <Route path="profile" element={<BusinessAdminProfile />} />

              {/* Settings */}
              <Route path="settings" element={<SettingsIndex />} />
              <Route path="settings/set-rota" element={<SetRotaPage />} />
            </Route>
          </Route>

          {/* ===================== ACCOUNTANT ===================== */}
          <Route path="/accountant/login" element={<AccountantLogin />} />
          <Route element={<ProtectedRoute allowedRoles={["accountant"]} />}>
            <Route path="/accountant" element={<AccountantLayout />}>
              <Route index element={<AccountantDashboard />} />
              <Route path="dashboard" element={<AccountantDashboard />} />
              <Route path="income" element={<AccountantIncome />} />
              <Route path="income/edit/:id" element={<AccountantIncomeEdit />} />
              <Route path="expense" element={<AccountantExpense />} />
              <Route path="expense/edit/:id" element={<AccountantExpenseEdit />} />
              <Route path="summary" element={<AccountantSummary />} />
            </Route>
          </Route>

          {/* ===================== CLIENT ===================== */}
          <Route path="/login" element={<ClientLogin />} />
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/client" element={<ClientLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#333",
            fontSize: "14px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          },
          success: { iconTheme: { primary: "#c98383", secondary: "#fff" } },
          error: { iconTheme: { primary: "#c98383", secondary: "#fff" } },
        }}
      />
    </PublicBusinessProvider>
  );
}
