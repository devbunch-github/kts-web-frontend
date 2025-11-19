// src/components/public/AuthModal.jsx
import { useState } from "react";
import { X } from "lucide-react";
import { apiLogin, apiRegister, checkEmail } from "../../api/publicApi";
import { useAuth } from "../../context/AuthContext";
import { createPublicCustomer } from "../../api/customer";

export default function AuthModal({ open, onClose, mode = "login", onSuccess }) {
  const [authMode, setAuthMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  if (!open) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    setLoading(true);
    setErrors(null);

    try {
      const res = await apiLogin({
        email: form.email,
        password: form.password,
      });

      const token = res.token;

      // create / attach customer
      let customerId = null;
      if (window.__currentAccountId) {
        const cust = await createPublicCustomer({
          AccountId: window.__currentAccountId,
          Name: res.user_data.name,
          MobileNumber: "",
          Email: res.user_data.email,
        });

        customerId = cust.data.Id;
      }

      login(res.user_data, token, customerId);

      setLoading(false);
      onSuccess?.();
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

      const loginRes = await apiLogin({
        email: form.email,
        password: form.password,
      });

      const token = loginRes.token;

      let customerId = null;
      if (window.__currentAccountId) {
        const cust = await createPublicCustomer({
          AccountId: window.__currentAccountId,
          Name: form.name,
          MobileNumber: form.phone,
          Email: form.email,
        });

        customerId = cust.data.Id;
      }

      login(loginRes.user_data, token, customerId);

      setLoading(false);
      onSuccess?.();
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
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative">

        <button className="absolute right-4 top-4" onClick={onClose}>
          <X />
        </button>

        <h2 className="text-center text-xl font-semibold text-[#E86C28] mb-2">
          {authMode === "login" ? "Login" : "Sign Up"}
        </h2>

        {errors && <p className="text-red-500 text-center">{errors}</p>}

        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === "signup" && (
            <>
              <input name="name" placeholder="Full Name" className="w-full border rounded-lg px-4 py-2" onChange={handleChange} />
              <input name="phone" placeholder="Mobile Number" className="w-full border rounded-lg px-4 py-2" onChange={handleChange} />
            </>
          )}

          <input name="email" placeholder="Email" className="w-full border rounded-lg px-4 py-2" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className="w-full border rounded-lg px-4 py-2" onChange={handleChange} />

          {authMode === "signup" && (
            <input type="password" name="password_confirmation" placeholder="Confirm Password" className="w-full border rounded-lg px-4 py-2" onChange={handleChange} />
          )}

          <button className="w-full bg-[#E86C28] text-white py-3 rounded-full">
            {loading ? "Please wait..." : authMode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4">
          {authMode === "login" ? (
            <>No account? <button onClick={() => setAuthMode("signup")}>Sign Up</button></>
          ) : (
            <>Already registered? <button onClick={() => setAuthMode("login")}>Login</button></>
          )}
        </p>
      </div>
    </div>
  );
}
