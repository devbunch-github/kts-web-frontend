import axios from "./http";

// ----------------------
// 💰 Expense CRUD
// ----------------------
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

// ----------------------
// 📂 File / Receipt Uploads & Delete
// ----------------------
export const uploadReceipt = (formData) =>
  axios.post("/api/admin/expenses/upload", formData).then((r) => r.data);

/**
 * Delete uploaded file (receipt)
 * @param {number} id - file id to delete
 * @returns {Promise<object>}
 */
export const deleteReceipt = (id) =>
  axios
    .delete("/api/admin/expenses/file", { data: { id } })
    .then((r) => r.data);

// ----------------------
// 📊 Categories
// ----------------------
export const listCategories = () =>
  axios.get("/api/categories").then((r) => r.data);

// ----------------------
// 📄 PDF Export
// ----------------------
export const exportExpensePdf = (params = {}) =>
  axios.get("/api/admin/expenses/export/pdf", {
    params,
    responseType: "blob",
  });
