import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../../api/publicApi";

export default function ClientLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
    agree: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Call your existing /api/auth/login
            const res = await apiLogin({
            email: form.email,
            password: form.password,
            });

            const responseData = res.data || res;
            console.log("Client Login Response:", responseData);

            // If token exists → store auth info
            if (responseData?.token) {
            // Save token
            localStorage.setItem("authToken", responseData.token);

            // Save backend `user` (raw user with roles etc.)
            localStorage.setItem(
                "apptlive_user",
                JSON.stringify(responseData.user)
            );

            // user_data contains role + permissions (your backend structure)
            const user = responseData.user_data;
            const redirectUrl = responseData.redirect_url || "/client/dashboard";

            // Save processed user info
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("userRole", user.role);
            localStorage.setItem(
                "userPermissions",
                JSON.stringify(user.permissions)
            );

            // Refresh global auth listeners
            window.dispatchEvent(new Event("storage"));

            // Redirect customer
            navigate(redirectUrl);
            }
        } catch (err) {
            console.error(err);
            setError(
            err?.response?.data?.message || "Invalid credentials"
            );
        } finally {
            setLoading(false);
        }
    };


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#000]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-1.png')",
        }}
      />

      {/* Light dark overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Card wrapper */}
      <div className="relative z-10 w-full flex justify-center px-4">
        <div className="
          bg-white 
          rounded-[28px]
          shadow-xl 
          w-full 
          max-w-[380px]
          px-8 
          py-10
          sm:px-10 
          sm:py-10
        ">
          {/* OCTANE Logo */}
          <h1 className="
            text-[28px] 
            font-semibold 
            tracking-[0.35em]
            text-center 
            text-gray-900 
            mb-8
          ">
            OCTANE
          </h1>

          {/* Login text */}
          <h2 className="text-center text-[17px] font-semibold text-black mb-6">
            Login
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 text-center -mt-2 mb-2">{error}</p>
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="olivia@octane.co.uk"
              value={form.email}
              onChange={handleChange}
              className="
                w-full 
                rounded-full 
                border 
                border-[#eab892] 
                px-4 
                py-2 
                text-sm
                placeholder-gray-400
                focus:ring-2 
                focus:ring-[#eab892] 
                focus:outline-none
              "
              required
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="*************"
              value={form.password}
              onChange={handleChange}
              className="
                w-full 
                rounded-full 
                border 
                border-[#eab892] 
                px-4 
                py-2 
                text-sm
                placeholder-gray-400
                focus:ring-2 
                focus:ring-[#eab892] 
                focus:outline-none
              "
              required
            />

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#eab892]"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
              >
                Forgot Password
              </button>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-[11px] text-gray-500 leading-snug">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-[#eab892]"
              />
              <span>
                By login you agree to our{" "}
                <span className="underline cursor-pointer">Terms of use</span> and our{" "}
                <span className="underline cursor-pointer">Privacy Policy</span>.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full 
                bg-[#eab892] 
                hover:bg-[#dba67d] 
                text-white 
                rounded-full 
                py-2.5 
                text-sm 
                font-medium 
                mt-3
                transition 
                active:scale-[0.98]
                disabled:opacity-70
              "
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Copyright */}
          <p className="text-center text-[10px] text-gray-400 mt-8">
            Copyright © {new Date().getFullYear()} Octane
          </p>
        </div>
      </div>
    </div>
  );
}
