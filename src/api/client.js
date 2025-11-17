import http from "./http";

export const fetchClientAppointments = async () => {
  return http.get("/api/client/appointments").then(res => res.data);
};
