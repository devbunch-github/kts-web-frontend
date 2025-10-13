import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import PlansPage from "./pages/subscription/PlansPage";
import PaymentPage from "./pages/subscription/PaymentPage";
import ConfirmPage from "./pages/subscription/ConfirmPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminIncomePage from "./pages/admin/AdminIncomePage";
import SetPasswordPage from "./pages/subscription/SetPasswordPage";
import PaymentCancelled from "./pages/subscription/PaymentCancelled";
import IncomeIndex from "./pages/income/IncomeIndex";
import IncomeForm from "./pages/income/IncomeForm";
import IncomeView from "./pages/income/IncomeView";
import DashboardLayout from "./layouts/DashboardLayout";
import ExpenseIndex from "./pages/expenses/ExpenseIndex";
import ExpenseForm from "./pages/expenses/ExpenseForm";
import ExpenseView from "./pages/expenses/ExpenseView";


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
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
