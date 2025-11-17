import http from "./http";

// ========================
// 🟢 LIST GIFT CARDS
// ========================
export const listGiftCards = async (params = {}) => {
  try {
    const res = await http.get("/api/gift-cards", { params });
    return res.data;
  } catch (err) {
    console.error("listGiftCards error:", err);
    throw err;
  }
};

// ========================
// 🟢 GET SINGLE GIFT CARD
// ========================
export const getGiftCard = async (id) => {
  try {
    const res = await http.get(`/api/gift-cards/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("getGiftCard error:", err);
    throw err;
  }
};

// ========================
// 🟢 CREATE GIFT CARD
// ========================
export const createGiftCard = async (payload) => {
  try {
    const res = await http.post("/api/gift-cards", payload, {
      headers: { "Content-Type": "multipart/form-data" }, // ✅ supports image upload
    });
    return res.data?.data || res.data;
  } catch (err) {
    console.error("createGiftCard error:", err);
    throw err;
  }
};

// ========================
// 🟢 UPDATE GIFT CARD
// ========================
export const updateGiftCard = async (id, payload) => {
  try {
    const res = await http.post(`/api/gift-cards/${id}?_method=PUT`, payload, {
      headers: { "Content-Type": "multipart/form-data" }, // ✅ Laravel-friendly
    });
    return res.data?.data || res.data;
  } catch (err) {
    console.error("updateGiftCard error:", err);
    throw err;
  }
};

// ========================
// 🔴 DELETE GIFT CARD
// ========================
export const deleteGiftCard = async (id) => {
  try {
    const res = await http.delete(`/api/gift-cards/${id}`);
    return res.data;
  } catch (err) {
    console.error("deleteGiftCard error:", err);
    throw err;
  }
};

export const listPublicGiftCards = async (accountId) => {
  try {
    const res = await http.get(`/api/public/gift-cards/${accountId}`);
    return res.data.data;
  } catch (err) {
    console.error("listPublicGiftCards error:", err);
    return [];
  }
};