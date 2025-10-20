import axios from "./http";

// Expense CRUD
export const listExpenses = (params = {}) =>
  axios.get("/api/admin/expenses", { params }).then((r) => r.data);

export const getExpense = (id) =>
  axios.get(`/api/admin/expenses/${id}`).then((r) => r.data);

export const createExpense = (payload) =>
  axios.post("/api/admin/expenses", payload).then((r) => r.data);

export const updateExpense = (id, payload) =>
  axios.put(`/api/admin/expenses/${id}`, payload).then((r) => r.data);

export const deleteExpense = (id) =>
  axios.delete(`/api/admin/expenses/${id}`).then((r) => r.data);

// Helpers
export const listCategories = () =>
  axios.get("/api/categories").then((r) => r.data);

export const uploadReceipt = (formData) =>
  axios.post("/api/file-upload", formData).then((r) => r.data);

export const exportExpensePdf = (params = {}) =>
  axios.get("/api/admin/expenses/export/pdf", {
    params,
    responseType: "blob",
  });