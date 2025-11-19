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

// Get all reviews
export const getCustomerReviews = () =>
  axios.get("/api/admin/customer/reviews").then((r) => r.data);

// Update single status
export const updateCustomerReviewStatus = (id, status) =>
  axios.post(`/api/admin/customer/reviews/${id}/status`, { status }).then((r) => r.data);

// Bulk update
export const bulkUpdateCustomerReviewStatus = (ids, status) =>
  axios.post("/api/admin/customer/reviews/bulk-status", { ids, status }).then((r) => r.data);

// Delete review
export const deleteCustomerReview = (id) =>
  axios.delete(`/api/admin/customer/reviews/${id}`).then((r) => r.data);

// PUBLIC create
export const createPublicCustomer = (payload) =>
  axios.post("/api/customers", payload).then((r) => r.data);