import http from "@/api/http";

// List forms
export const listForms = (params = {}) => http.get("/api/forms", { params });

// Get one
export const getForm = (id) => http.get(`/api/forms/${id}`);

// Create
export const createForm = (payload) => http.post("/api/forms", payload);

// Update
export const updateForm = (id, payload) => http.put(`/api/forms/${id}`, payload);

// Delete
export const deleteForm = (id) => http.delete(`/api/forms/${id}`);

// Toggle
export const toggleForm = (id, is_active) => http.patch(`/api/forms/${id}/toggle`, { is_active });
