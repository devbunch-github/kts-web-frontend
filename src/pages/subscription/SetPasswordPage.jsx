import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { setPassword, apiLogin } from "../../api/publicApi";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function SetPasswordPage() {
  const [search] = useSearchParams();
  const nav = useNavigate();
  const { user, login } = useAuth();

  const userId = search.get("user_id") || user?.id;
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!password || !confirm) {
      setError("Please enter and confirm your password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await setPassword({
        user_id: userId,
        password,
        password_confirmation: confirm,
      });

      if (!res?.user) throw new Error("Invalid response from server");

      // auto-login user
      const loginRes = await apiLogin({
        email: res.user.email,
        password,
      });

      login(loginRes.user);
      nav(`/subscription/confirm?user_id=${userId}`);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-700">Invalid session. Please sign up again.</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container-7xl section-pad">
        <div className="mx-auto max-w-md border p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Set Your Password</h2>

          {error && <div className="bg-red-100 text-red-600 p-2 mb-3 rounded">{error}</div>}

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-3 rounded"
            value={password}
            onChange={(e) => setPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border p-2 mb-3 rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button
            disabled={loading}
            onClick={submit}
            className="w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Password"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
