import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SetPasswordPage() {
  const [form, setForm] = useState({
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("user_id");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Missing user ID. Please reopen your activation link.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/set-password`,
        {
          user_id: userId,
          password: form.password,
          password_confirmation: form.confirm_password,
        }
      );

      if (res.data.ok || res.status === 200) {
        setSuccess(true);
        setForm({ password: "", confirm_password: "" });

        // ✅ Save user session
        if (res.data.user) {
          localStorage.setItem("apptlive_user", JSON.stringify(res.data.user));
          window.dispatchEvent(new Event("user-login"));
        }

        // Redirect after short delay
        setTimeout(() => {
          navigate("/subscription/confirm");
        }, 2500);
      } else {
        setError(res.data.message || "Unexpected server response.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ redirect user to confirm page after 2.5s of success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/subscription/confirm");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="bg-white pt-[100px] min-h-screen flex flex-col items-center text-[#1b1b1b]">
      {/* Hero */}
      <section className="w-full max-w-[1280px] text-center mb-10">
        <h1 className="text-[32px] font-semibold text-[#1b1b1b]">Set Your Password</h1>
        <p className="text-[15px] text-[#6b6b6b] mt-2">
          Secure your account to continue using{" "}
          <span className="text-[#b97979] font-medium">appt.live</span>
        </p>
      </section>

      {/* Card */}
      <div className="w-full max-w-[480px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#f0f0f0] rounded-2xl p-8 text-left">
        {success ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 bg-[#c98383]/10 text-[#c98383] rounded-full flex items-center justify-center text-2xl">
                ✓
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#1b1b1b] mb-1">
              Password Set Successfully!
            </h3>
            <p className="text-sm text-[#666]">
              Redirecting you to confirmation page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-400 text-red-600 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[14px] font-medium text-[#444] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-md border border-[#ddd] px-4 py-2.5 text-[15px] focus:border-[#c98383] focus:ring-0"
                required
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#444] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full rounded-md border border-[#ddd] px-4 py-2.5 text-[15px] focus:border-[#c98383] focus:ring-0"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-medium transition-all ${
                loading
                  ? "bg-[#c98383]/70 cursor-not-allowed"
                  : "bg-[#c98383] hover:bg-[#b97474] active:scale-[0.98]"
              }`}
            >
              {loading ? "Saving..." : "Save Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
