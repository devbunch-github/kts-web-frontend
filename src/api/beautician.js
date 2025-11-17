import http from "./http";

export const listBeauticians = async (params = {}) => {
  return http.get("/api/beauticians", { params }).then(res => res.data);
};
