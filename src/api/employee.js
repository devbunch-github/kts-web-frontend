// src/api/employee.js
import axios from "./http";

const base = "/api/employees";

// ===== EMPLOYEES CRUD =====
export async function listEmployees(params = {}) {
  const {
    q = "",
    page = 1,
    per_page = 10,
    account_id = null,
  } = params;

  const queryParams = { q, page, per_page };

  // ⭐ Pass ONLY if provided
  if (account_id) {
    queryParams.account_id = account_id;
  }

  const { data } = await axios.get(base, { params: queryParams });
  return data;
}

export async function getEmployee(id, account_id = null) {
  const { data } = await axios.get(`${base}/${id}`, {
    params: account_id ? { account_id } : {},
  });
  return data;
}

export async function createEmployee(payload) {
  const { data } = await axios.post(base, payload);
  return data;
}

export async function updateEmployee(id, payload) {
  const { data } = await axios.put(`${base}/${id}`, payload);
  return data;
}

export async function deleteEmployee(id) {
  const { data } = await axios.delete(`${base}/${id}`);
  return data;
}

// ===== SERVICES FOR EMPLOYEE =====
export async function listServices(minimal = 1, account_id = null) {
  const { data } = await axios.get("/api/services", {
    params: account_id ? { minimal, account_id } : { minimal },
  });
  return data;
}

// ===== TIME OFF =====
export async function createTimeOff(payload) {
  const { data } = await axios.post(
    `/api/employees/${payload.employee_id}/time-offs`,
    payload
  );
  return data;
}

export async function listTimeOffs(employeeId, params = {}) {
  const { data } = await axios.get(
    `/api/employees/${employeeId}/time-offs`,
    { params }
  );
  return data;
}

// ===== SCHEDULE / CALENDAR =====
export async function getWeekSchedule(employeeId, startISO) {
  const { data } = await axios.get(`/api/employees/${employeeId}/schedule`, {
    params: { week_start: startISO },
  });
  return data;
}

export async function getMonthCalendar(employeeId, y, m) {
  const { data } = await axios.get(`/api/employees/${employeeId}/calendar`, {
    params: { year: y, month: m },
  });
  return data;
}

export async function createSchedule(employeeId, payload) {
  const { data } = await axios.post(
    `/api/employees/${employeeId}/schedule`,
    payload
  );
  return data;
}
