import axios from "./http";

export const listIncome = (params = {}) =>
  axios.get("/api/income", { params }).then((r) => r.data);
export const getIncome = (id) =>
  axios.get(`/api/income/${id}`).then((r) => r.data);
export const createIncome = (payload) =>
  axios.post("/api/income", payload).then((r) => r.data);
export const updateIncome = (id, pay) =>
  axios.put(`/api/income/${id}`, pay).then((r) => r.data);
export const deleteIncome = (id) =>
  axios.delete(`/api/income/${id}`).then((r) => r.data);
