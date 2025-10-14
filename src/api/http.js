// src/api/http.js
import axios from "axios";

let userId = null;
try {
  const stored = localStorage.getItem("apptlive_user");
  if (stored) {
    const parsed = JSON.parse(stored);
    userId = parsed?.id || parsed?.user?.id || null;
  }
} catch (e) {}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(userId ? { "X-User-Id": userId } : {}), // ✅ send user ID fallback
  },
});

export default http;
