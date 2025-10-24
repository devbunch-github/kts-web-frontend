import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: true,
});

export const loginAccountant = async (data) => {
  await api.get("/sanctum/csrf-cookie"); // Sanctum CSRF setup
  return api.post("/api/accountant/login", data);
};

// Fetch Accountant Dashboard Data
export const fetchAccountantDashboard = () =>
  axios
    .get("/api/accountant/dashboard")
    .then((r) => r.data)
    .catch((err) => {
      console.error("Error fetching accountant dashboard:", err);
      throw err;
    });


// export default api;