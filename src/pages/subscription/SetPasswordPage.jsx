import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { setPassword, apiLogin } from "../../api/publicApi";  // ✅ added apiLogin
import { useAuth } from "../../context/AuthContext";          // ✅ added useAuth
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function SetPasswordPage() {
  const [search] = useSearchParams();
  const userId = search.get("user_id");
  const nav = useNavigate();

  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth(); // ✅ now properly imported

  const submit = async () => {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await setPassword({
        user_id: userId,
        password,
        password_confirmation: confirm,
      });

      // ✅ auto login user using new password
      const loginRes = await apiLogin({
        email: res.user.email,
        password: password,
      });

      login(loginRes.user); // store user in AuthContext

      // ✅ redirect to thank you page
      nav(`/subscription/confirm?user_id=${userId}`);
    } catch (e) {
      console.error(e);
      setError("Something went wrong.");
    }
  };

  return (
    <div>
      <Header />
      <div className="container-7xl section-pad">
        <div className="mx-auto max-w-md border p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Set Your Password</h2>
          {error && (
            <div className="bg-red-100 text-red-600 p-2 mb-3 rounded">
              {error}
            </div>
          )}
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
            onClick={submit}
            className="w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600"
          >
            Save Password
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
