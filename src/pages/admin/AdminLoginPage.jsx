import { useState } from "react";
import { apiLogin } from "../../api/publicApi";

export default function AdminLoginPage() {
	const [form, setForm] = useState({
		email: "",
		password: "",
		remember: false,
		agree: false,
	});
	const [error, setError] = useState("");

  const submit = async (e) => {
		e.preventDefault();
		setError("");

		if (!form.email || !form.password) {
			setError("Please fill in both email and password.");
			return;
		}
		if (!form.agree) {
			setError("You must agree to Terms of use and Privacy Policy.");
			return;
		}
		
		try {
			const res = await apiLogin({
        email: form.email,
        password: form.password,
        remember: form.remember,
      });
      console.log("Login response:", res);

      const responseData = res.data || res;
      console.log(responseData);

      if (responseData?.token) {
        localStorage.setItem("authToken", responseData.token);
        localStorage.setItem("apptlive_user", JSON.stringify(responseData.user));

        const user = responseData.user;
        const redirectUrl = responseData.redirect_url || "/dashboard";

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userPermissions", JSON.stringify(user.permissions));

        window.location.href = redirectUrl;
      } else {
        setError(responseData?.message || "Login failed. Please try again.");
      }

		} catch (err) {
			console.error("Login error:", err);
			setError(
				err.response?.data?.message ||
				err.data?.message ||
				err.message ||
				"Invalid credentials. Please check your email or password."
			);
		}
};

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('/images/hero-1.png')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-center mb-6">
          <span className="text-rose-500">appt</span>
          <span className="text-gray-800">.live</span>
        </h1>

        <h2 className="text-xl font-semibold text-center mb-6">Login</h2>

        <form onSubmit={submit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-400 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-neutral-700">
                Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className="text-sm text-rose-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              required
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Remember */}
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) =>
                setForm((s) => ({ ...s, remember: e.target.checked }))
              }
            />
            <span className="text-neutral-600">Remember me</span>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 text-xs text-neutral-600 leading-5">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) =>
                setForm((s) => ({ ...s, agree: e.target.checked }))
              }
            />
            <span>
              By login you agree to our{" "}
              <a href="/terms" className="text-rose-500 hover:underline">
                Terms of use
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-rose-500 hover:underline">
                Privacy Policy
              </a>
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-rose-500 py-2.5 text-white font-semibold hover:bg-rose-600 transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Copyright © {new Date().getFullYear()} appt.live
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
