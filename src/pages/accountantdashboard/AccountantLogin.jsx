import { useState } from "react";
import { loginAccountant } from "../../api/accountantdashboard";
import { useNavigate } from "react-router-dom";
// import bgImage from "@/assets/bg-barber.jpg";

export default function AccountantLogin() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginAccountant(form);

      const responseData = res.data || res;
      console.log(responseData);

      if (responseData?.token) {
        localStorage.setItem("authToken", responseData.token);
        localStorage.setItem("apptlive_user", JSON.stringify(responseData.user));

        const user = responseData.user_data;
        const redirectUrl = responseData.redirect_url || "/dashboard";

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userPermissions", JSON.stringify(user.permissions));

        navigate(redirectUrl || "/accountant/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/images/hero-1.png')",
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 w-[90%] max-w-md text-center relative z-10">
        <h1 className="text-3xl font-semibold tracking-widest mb-8">OCTANE</h1>
        <h2 className="text-lg font-semibold mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Mail"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="**********"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="flex justify-between text-sm mt-1">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              Remember me
            </label>
            <a href="#" className="text-orange-500 hover:underline">
              Forgot Password
            </a>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-600 mt-2">
            <input type="checkbox" required />
            By login you agree to our <span className="text-orange-500">Terms of use</span> and
            <span className="text-orange-500"> Privacy Policy</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white rounded-full py-2 mt-4 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-8">Copyright © 2025 Octane</p>
      </div>

      {/* Dim overlay for better readability */}
      <div className="absolute inset-0 bg-black/30"></div>
    </div>
  );
}
