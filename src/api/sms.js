import axios from "./http";

export const getSmsPackages = () =>
  axios.get("/api/admin/sms-packages").then((r) => r.data);

