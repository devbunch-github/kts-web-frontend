import axios from "./http";

// Business dashboard endpoints
export const fetchBusinessSummary = () =>
  axios.get("/api/business/dashboard/summary").then(r => r.data.data);

export const fetchBusinessEvents = (start, end) =>
  axios.get("/api/business/dashboard/appointments", { params: { start, end } })
       .then(r => r.data.data);
