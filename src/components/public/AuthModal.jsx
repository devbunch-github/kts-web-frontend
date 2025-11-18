import { useState } from "react";
import { X } from "lucide-react";
import {
  apiLogin,
  apiRegister,
  checkEmail,
} from "../../api/publicApi";
import { useAuth } from "../../context/AuthContext"; // <-- IMPORTANT

export default function AuthModal({ open, onClose, mode = "login", onSuccess }) {
  const [authMode, setAuthMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const { login } = useAuth(); // ⬅ GLOBAL AUTH CONTEXT

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------------------------------------------------
  // 🔥 LOGIN HANDLER
  // ---------------------------------------------------------
  const handleLogin = async () => {
    setLoading(true);
    setErrors(null);

    try {
      const res = await apiLogin({
        email: form.email,
        password: form.password,
      });

      // Save token
      if (res.token) localStorage.setItem("auth_token", res.token);

      // Save user into AuthContext + localStorage
      login(res.user_data);

      setLoading(false);

      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrors(err.response?.data?.message || "Login failed");
    }
  };

  // ---------------------------------------------------------
  // 🔥 SIGNUP HANDLER
  // ---------------------------------------------------------
  const handleSignup = async () => {
    setLoading(true);
    setErrors(null);

    try {
      const emailCheck = await checkEmail(form.email).catch(() => null);
      if (emailCheck?.exists) {
        setErrors("Email already exists. Please login instead.");
        setLoading(false);
        return;
      }

      await apiRegister({
        type: "customer",
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // Auto-login after register
      const loginRes = await apiLogin({
        email: form.email,
        password: form.password,
      });

      if (loginRes.token) {
        localStorage.setItem("auth_token", loginRes.token);
      }

      login(loginRes.user_data); // update global auth

      setLoading(false);
      if (onSuccess) onSuccess(loginRes);
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
        
        {/* CLOSE BUTTON */}
        <button className="absolute right-4 top-4 text-gray-400 hover:text-black" onClick={onClose}>
          <X />
        </button>

        {/* TITLE */}
        <h2 className="text-center text-xl font-semibold text-[#E86C28] mb-2">
          {authMode === "login" ? "Login" : "Sign Up"}
        </h2>

        {/* SUBTITLE */}
        <p className="text-center text-gray-500 text-sm mb-6">
          {authMode === "login"
            ? "Login to complete your booking"
            : "Create an account to continue your booking"}
        </p>

        {/* ERRORS */}
        {errors && (
          <p className="text-red-500 text-center mb-3 text-sm">{errors}</p>
        )}

        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-4">

          {authMode === "signup" && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full border rounded-lg px-4 py-2"
                onChange={handleChange}
              />

              <input
                type="text"
                name="phone"
                placeholder="Mobile Number"
                className="w-full border rounded-lg px-4 py-2"
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full border rounded-lg px-4 py-2"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2"
            onChange={handleChange}
          />

          {authMode === "signup" && (
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              className="w-full border rounded-lg px-4 py-2"
              onChange={handleChange}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#E86C28] text-white font-semibold hover:bg-[#cf5f20] transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : authMode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        {/* SWITCH LOGIN/SIGNUP */}
        <p className="text-center text-sm text-gray-600 mt-4">
          {authMode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="text-[#E86C28] underline"
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button
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
