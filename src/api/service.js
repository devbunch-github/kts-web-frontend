import axios from "./http";

// ===== SERVICES =====
export const listServices = (params = {}) =>
  axios.get("/api/services", { params }).then((r) => r.data);

export const getService = (id) =>
  axios.get(`/api/admin/services/${id}`).then((r) => r.data);

export const createService = (payload) =>
  axios.post("/api/admin/services", payload).then((r) => r.data);

export const updateService = (id, payload) =>
  axios.put(`/api/admin/services/${id}`, payload).then((r) => r.data);

export const deleteService = (id) =>
  axios.delete(`/api/admin/services/${id}`).then((r) => r.data);

// ===== CATEGORIES =====
export const listServiceCategories = () =>
  axios.get("/api/categories").then((r) => r.data);

export const getServiceCategory = (id) =>
  axios.get(`/api/admin/categories/${id}`).then((r) => r.data);

export const createServiceCategory = (payload) =>
  axios.post("/api/admin/categories", payload).then((r) => r.data);

export const updateServiceCategory = (id, payload) =>
  axios.put(`/api/admin/categories/${id}`, payload).then((r) => r.data);

export const deleteServiceCategory = (id) =>
  axios.delete(`/api/admin/categories/${id}`).then((r) => r.data);

// ===== FILE UPLOADS =====
export const uploadGeneric = (formData) =>
  axios.post("/api/file-upload", formData).then((r) => r.data);
