import http from "./http";

export const fetchClientAppointments = async () => {
  return http.get("/api/client/appointments").then(res => res.data);
};

export const fetchClientGiftCards = async (params = {}) => {
  return http.get("/api/client/gift-cards", { params }).then(res => res.data);
};

export const fetchClientProfile = () =>
  http.get("/api/client/profile").then((res) => res.data.data);

export const updateClientProfile = (payload) =>
  http.put("/api/client/profile/update", payload).then((res) => res.data);

export const cancelClientAppointment = async (id, reason) => {
  const res = await http.post(`/api/client/appointments/${id}/cancel`, { reason });
  return res.data;
};

export const rescheduleClientAppointment = async (id, { date, time }) => {
  const res = await http.post(`/api/client/appointments/${id}/reschedule`, {
    date,
    time,
  });
  return res.data;
};

export const leaveClientReview = async (id, { rating, review }) => {
  const res = await http.post(`/api/client/appointments/${id}/review`, {
    rating,
    review,
  });
  return res.data;
};