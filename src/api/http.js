import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  withCredentials: true, // ✅ important for auth/session cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
