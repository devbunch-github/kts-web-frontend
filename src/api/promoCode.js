import http from "./http";

// ========================
// 🟢 LIST PROMO CODES
// ========================
export const listPromoCodes = async (params = {}) => {
  try {
    const res = await http.get("/api/promo-codes", { params });
    return res.data;
  } catch (err) {
    console.error("listPromoCodes error:", err);
    throw err;
  }
};

// ========================
// 🟢 GET SINGLE PROMO CODE
// ========================
export const getPromoCode = async (id) => {
  try {
    const res = await http.get(`/api/promo-codes/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("getPromoCode error:", err);
    throw err;
  }
};

// ========================
// 🟢 CREATE PROMO CODE
// ========================
export const createPromoCode = async (payload) => {
  try {
    const res = await http.post("/api/promo-codes", payload);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("createPromoCode error:", err);
    throw err;
  }
};

// ========================
// 🟢 UPDATE PROMO CODE
// ========================
export const updatePromoCode = async (id, payload) => {
  try {
    const res = await http.put(`/api/promo-codes/${id}`, payload);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("updatePromoCode error:", err);
    throw err;
  }
};

// ========================
// 🔴 DELETE PROMO CODE
// ========================
export const deletePromoCode = async (id) => {
  try {
    const res = await http.delete(`/api/promo-codes/${id}`);
    return res.data;
  } catch (err) {
    console.error("deletePromoCode error:", err);
    throw err;
  }
};

// ========================
// 🟢 PUBLIC VALIDATION – used on booking page
// ========================
export const validatePublicPromoCode = async (params = {}) => {
  try {
    const res = await http.get("/api/public/promo/validate", { params });
    return res.data; // { valid: bool, data?, message? }
  } catch (err) {
    console.error("validatePublicPromoCode error:", err);
    throw err;
  }
};