import http from "@/api/http";

export const getBusinessProfile = async () => {
  const { data } = await http.get("/api/business/profile");
  return data.data || {};
};

export const updateBusinessProfile = async (formData) => {
  const { data } = await http.post("/api/business/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
