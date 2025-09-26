import axios from "axios";

// Put your Laravel URL in .env as: VITE_API_BASE_URL=http://localhost:8000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: false,
});

export async function fetchBeauticians(params = {}) {
  const { data } = await api.get("/api/beauticians", { params });
  // Laravel ResourceCollection returns { data: [], links: {}, meta: {} }
  return { items: data.data ?? [], meta: data.meta ?? {}, links: data.links ?? {} };
}
