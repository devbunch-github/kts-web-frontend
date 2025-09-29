import Modal from "../Modal";
import { apiLogin } from "../../api/publicApi";
import { useState } from "react";

export default function LoginModal({ open, onClose, onSwitch }) {
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
      await apiLogin({
        email: form.email,
        password: form.password,
        remember: form.remember,
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid credentials. Please check your email or password."
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Login">
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
              className="text-sm text-orange-500 hover:underline"
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
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400"
          />
        </div>

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
            <a href="/terms" className="text-orange-500 hover:underline">
              Terms of use
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-orange-500 hover:underline">
              Privacy Policy
            </a>
          </span>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-orange-500 py-2.5 text-white font-semibold hover:bg-orange-600 transition"
        >
          Login
        </button>

        <div className="text-center text-sm mt-2 text-neutral-600">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-orange-500 hover:underline font-medium"
          >
            Signup
          </button>
        </div>
      </form>
    </Modal>
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
        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
