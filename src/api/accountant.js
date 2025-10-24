import axios from "./http";

export const getAccountants = () =>
  axios.get("/api/admin/accountants").then(r => r.data);

export const createAccountant = (payload) =>
  axios.post("/api/admin/accountants", payload).then(r => r.data);

export const getAccountantById = (id) =>
  axios.get(`/api/admin/accountants/${id}`).then((r) => r.data);

export const updateAccountant = (id, payload) =>
  axios.put(`/api/admin/accountants/${id}`, payload).then(r => r.data);

export const deleteAccountant = (id) =>
  axios.delete(`/api/admin/accountants/${id}`).then(r => r.data);

export const resetAccountantPassword = (id, data) =>
  axios.post(`/api/admin/accountants/${id}/reset-password`, data)
    .then((r) => r.data);

export const toggleAccountantAccess = (id) =>
  axios.patch(`/api/admin/accountants/${id}/toggle-access`).then((r) => r.data);
