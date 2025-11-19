import axios from "./http";

/**
 * Helper – adds X-Account-Id when needed
 */
function addAccountHeader(params = {}) {
  if (params.account_id) {
    return {
      params,
      headers: { "X-Account-Id": params.account_id },
    };
  }
  return { params };
}

/* ===========================
      SERVICES
=========================== */

export const listServices = (params = {}) =>
  axios.get("/api/services", addAccountHeader(params)).then((r) => r.data);

export const getService = (id) =>
  axios.get(`/api/admin/services/${id}`).then((r) => r.data);

export const createService = (payload) =>
  axios.post("/api/admin/services", payload).then((r) => r.data);

export const updateService = (id, payload) =>
  axios.put(`/api/admin/services/${id}`, payload).then((r) => r.data);

export const deleteService = (id) =>
  axios.delete(`/api/admin/services/${id}`).then((r) => r.data);

/* ===========================
      CATEGORIES
=========================== */

export const listServiceCategories = (params = {}) =>
  axios.get("/api/categories", addAccountHeader(params)).then((r) => r.data);

export const getServiceCategory = (id) =>
  axios.get(`/api/admin/categories/${id}`).then((r) => r.data);

export const createServiceCategory = (payload) =>
  axios.post("/api/admin/categories", payload).then((r) => r.data);

export const updateServiceCategory = (id, payload) =>
  axios.put(`/api/admin/categories/${id}`, payload).then((r) => r.data);

export const deleteServiceCategory = (id) =>
  axios.delete(`/api/admin/categories/${id}`).then((r) => r.data);

/* ===========================
      OTHERS
=========================== */

export const uploadGeneric = async (formData) => {
  return axios
    .post("/api/file-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const deleteUploadedFile = async (path) => {
  return axios.delete("/api/file-upload", { data: { path } });
};

/**
 * Filter services by category (public)
 */
export const listServicesByCategory = async (accountId, categoryId) => {
  const all = await listServices({ account_id: accountId });
  return all?.data?.filter((s) => s.CategoryId == categoryId) || [];
};
