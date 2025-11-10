import http from "@/api/http";

export const getNotifications = async () => {
  const { data } = await http.get("/api/notifications");
  return data?.notifications || [];
};
