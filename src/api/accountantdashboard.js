import axios from "./http";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: true,
});

export const loginAccountant = async (data) => {
  await api.get("/sanctum/csrf-cookie"); // Sanctum CSRF setup
  return api.post("/api/accountant/login", data);
};

// Fetch Accountant Dashboard Data
export const fetchAccountantDashboard = () =>
  axios.get("/api/accountant/dashboard").then((r) => r.data);

// New function: Only fetch summary card data
export const fetchBusinessSummary = async () => {
  const res = await axios.get("/api/accountant/dashboard/summary");
  const payload = res.data?.data?.current || {};

  return {
    tax: Number(payload.taxLiability || 0),
    profit: Number(payload.profit || 0),
    income_total: Number(payload.revenue || 0),
    expense_total: Number(payload.expenses || 0),
    period: res.data?.data?.period || {},
    forecasted: res.data?.data?.forecasted || {},
  };
};

// Fetch Accountant Income List
export const fetchAccountantIncome = (params = {}) =>
  axios
    .get("/api/accountant/income", { params })
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error fetching accountant income:", err);
      throw err;
    });

/**
 * Delete Accountant Income Record
 */
export const deleteAccountantIncome = (id) =>
  axios
    .delete(`/api/accountant/income/${id}`)
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error deleting accountant income:", err);
      throw err;
    });

export const fetchAccountantExpenses = (params = {}) =>
  axios
    .get("/api/accountant/expenses", { params })
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error fetching accountant expenses:", err);
      throw err;
    });

export const deleteAccountantExpense = (id) =>
  axios
    .delete(`/api/accountant/expenses/${id}`)
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error deleting accountant expense:", err);
      throw err;
    });

export const fetchAccountantCategories = () =>
  axios
    .get("/api/accountant/categories")
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error fetching categories:", err);
      throw err;
    });

export const fetchAccountantIncomeById = (id) =>
  axios.get(`/api/accountant/income/${id}`).then((r) => r.data);

export const updateAccountantIncome = (id, payload) =>
  axios.put(`/api/accountant/income/${id}`, payload).then((r) => r.data);

export const fetchAccountantExpenseById = (id) =>
  axios.get(`/api/accountant/expense/${id}`).then((r) => r.data);

export const updateAccountantExpense = (id, payload) =>
  axios.put(`/api/accountant/expense/${id}`, payload).then((r) => r.data);

// Generate Accountant Summary PDF
export const generateAccountantSummaryPDF = (params = {}) =>
  axios
    .post("/api/accountant/summary/pdf", params, { responseType: "blob" })
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error generating accountant summary PDF:", err);
      throw err;
    });

// Generate Accountant Summary Excel (CSV/ZIP)
export const generateAccountantSummaryExcel = (params = {}) =>
  axios
    .post("/api/accountant/summary/csv", params, { responseType: "blob" })
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error generating accountant summary Excel:", err);
      throw err;
    });