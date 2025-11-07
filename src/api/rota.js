import http from "@/api/http";

// ✅ Fetch weekly rota shifts
export const listRota = (params) =>
  http.get("/api/business/rota", { params }).then((r) => r.data);

// ✅ Save regular shifts (bulk)
export const saveRegularShifts = (payload) =>
  http.post("/api/business/rota/store", payload).then((r) => r.data);

// ✅ Delete shifts by recurrence_id
export const deleteRota = (payload) =>
  http.delete("/api/business/rota", { data: payload }).then((r) => r.data);

// ✅ Fetch employee time-offs
export const listTimeOff = (params) =>
  http.get("/api/business/time-off", { params }).then((r) => r.data);

// ✅ Save employee time-off
export const saveTimeOff = (payload) =>
  http.post("/api/business/time-off/store", payload).then((r) => r.data);

// ✅ Delete time-off by recurrence_id
export const deleteTimeOff = (payload) =>
  http.delete("/api/business/time-off", { data: payload }).then((r) => r.data);

// ✅ Update single shift by ID
export const updateRota = (id, payload) =>
  http.put(`/api/business/rota/${id}`, payload).then((r) => r.data);


