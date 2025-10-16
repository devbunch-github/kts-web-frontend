import axios from "./http";

export const listCustomers = () =>
  axios.get("/api/admin/customers").then((r) => r.data.data);

export const getCustomer = (id) =>
  axios.get(`/api/admin/customers/${id}`).then((r) => r.data.data);

export const createCustomer = (payload) =>
  axios.post("/api/admin/customers", payload).then((r) => r.data.data);

export const updateCustomer = (id, payload) =>
  axios.put(`/api/admin/customers/${id}`, payload).then((r) => r.data.data);

export const deleteCustomer = (id) =>
  axios.delete(`/api/admin/customers/${id}`).then((r) => r.data);
