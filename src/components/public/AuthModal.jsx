// src/components/public/AuthModal.jsx
import { useState } from "react";
import { X } from "lucide-react";
import {
  apiLogin,
  apiRegister,
  checkEmail,
} from "../../api/publicApi";
import { useAuth } from "../../context/AuthContext";

export default function AuthModal({
  open,
  onClose,
  mode = "login",      // "login" | "signup"
  onSuccess,           // callback after successful auth
}) {
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    setLoading(true);
    setErrors(null);

    try {
      const res = await apiLogin({
        email: form.email,
        password: form.password,
      });

      // Save token + user data
      localStorage.setItem("auth_token", res.token);
      login(res.user_data); // ✅ update global context

      setLoading(false);
      onSuccess?.(res);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrors(err.response?.data?.message || "Login failed");
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async () => {
    setLoading(true);
    setErrors(null);

    try {
      // Check email first
      const emailCheck = await checkEmail(form.email).catch(() => null);
      if (emailCheck?.exists) {
        setErrors("Email already exists. Please login instead.");
        setLoading(false);
        return;
      }

      // Register user (simple customer registration)
      await apiRegister({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // Auto-login after registration
      const loginRes = await apiLogin({
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("auth_token", loginRes.token);
      login(loginRes.user_data); // ✅ update global context

      setLoading(false);
      onSuccess?.(loginRes);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrors(err.response?.data?.message || "Registration failed");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    authMode === "login" ? handleLogin() : handleSignup();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative">
        {/* Close */}
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
          onClick={onClose}
        >
          <X />
        </button>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-[#E86C28] mb-2">
          {authMode === "login" ? "Login" : "Sign Up"}
        </h2>

        <p className="text-center text-gray-500 text-sm mb-6">
          {authMode === "login"
            ? "Login to complete your booking"
            : "Sign up to complete your booking"}
        </p>

        {/* Errors */}
        {errors && (
          <p className="text-red-500 text-center mb-3 text-sm">{errors}</p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === "signup" && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full border rounded-lg px-4 py-2 text-sm"
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Mobile Number"
                className="w-full border rounded-lg px-4 py-2 text-sm"
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            onChange={handleChange}
          />

          {authMode === "signup" && (
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              className="w-full border rounded-lg px-4 py-2 text-sm"
              onChange={handleChange}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#E86C28] text-white font-semibold hover:bg-[#cf5f20] transition disabled:opacity-50 text-sm"
          >
            {loading
              ? "Please wait..."
              : authMode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {authMode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-[#E86C28] underline"
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-[#E86C28] underline"
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
