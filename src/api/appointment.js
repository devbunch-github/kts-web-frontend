/**
 * Appointment API Module (Final)
 * -------------------------------------------------
 * Adjusted according to current Laravel routes.
 * Uses global Axios instance from http.js.
 */

import http from "./http";

// ========================
// 🟢 LIST APPOINTMENTS
// ========================
export const listAppointments = async (params = {}) => {
  try {
    const res = await http.get("/api/appointments", { params });
    return res.data?.data || res.data;
  } catch (err) {
    console.error("listAppointments error:", err);
    throw err;
  }
};

// ========================
// 🟢 GET SINGLE APPOINTMENT
// ========================
export const getAppointment = async (id) => {
  try {
    const res = await http.get(`/api/appointments/${id}`);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("getAppointment error:", err);
    throw err;
  }
};

// ========================
// 🟢 CREATE APPOINTMENT
// ========================
export const createAppointment = async (payload) => {
  try {
    const res = await http.post("/api/appointments", payload);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("createAppointment error:", err);
    throw err;
  }
};

// ========================
// 🟢 UPDATE APPOINTMENT
// ========================
export const updateAppointment = async (id, payload) => {
  try {
    const res = await http.put(`/api/appointments/${id}`, payload);
    return res.data?.data || res.data;
  } catch (err) {
    console.error("updateAppointment error:", err);
    throw err;
  }
};

// ========================
// 🔴 DELETE (SOFT DELETE) APPOINTMENT
// ========================
export const deleteAppointment = async (id) => {
  try {
    const res = await http.delete(`/api/appointments/${id}`);
    return res.data;
  } catch (err) {
    console.error("deleteAppointment error:", err);
    throw err;
  }
};

// ========================
// 🟣 LOAD CUSTOMERS (for dropdown)
// ✅ Adjusted → inside /admin prefix
// ========================
export const listCustomers = async () => {
  try {
    const res = await http.get("/api/admin/customers");
    return res.data?.data || res.data;
  } catch (err) {
    console.error("listCustomers error:", err);
    throw err;
  }
};

// ========================
// 🟣 LOAD SERVICES (for dropdown)
// ✅ Root-level (no /admin prefix)
// ========================
export const listServices = async () => {
  try {
    const res = await http.get("/api/services");
    return res.data?.data || res.data;
  } catch (err) {
    console.error("listServices error:", err);
    throw err;
  }
};

// ========================
// 🟣 LOAD EMPLOYEES (for dropdown)
// ========================
export const listEmployees = async () => {
  try {
    const res = await http.get("/api/employees");
    return res.data?.data || res.data;
  } catch (err) {
    console.error("listEmployees error:", err);
    throw err;
  }
};
