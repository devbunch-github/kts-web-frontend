// src/api/settings.js
import http from "@/api/http";

// ✅ Get a setting by type
export async function getBusinessSetting(type) {
  try {
    const { data } = await http.get(`/api/business/settings/${type}`);
    // Your backend response looks like:
    // { "type": "general", "data": { ...actual settings... } }
    return data?.data || {}; // ✅ Extract only the "data" object
  } catch (err) {
    console.error("Error fetching business setting:", err);
    return {};
  }
}

// ✅ Update a setting
export async function updateBusinessSetting(type, payload, isMultipart = false) {
  try {
    const config = isMultipart
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    const { data } = await http.post(`/api/business/settings/${type}`, payload, config);
    return data?.data || {};
  } catch (err) {
    console.error("Error updating business setting:", err);
    throw err;
  }
}
