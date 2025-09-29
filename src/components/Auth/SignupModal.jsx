import Modal from "../Modal";
import { apiRegister } from "../../api/publicApi";
import { useState } from "react";

export default function SignupModal({ open, onClose, onSwitch }) {
  const [f, setF] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    logo: null,
    cover_image: null,
    agree: false,
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!f.name || !f.business_name || !f.email || !f.phone || !f.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!f.agree) {
      setError("You must agree to Terms of use and Privacy Policy.");
      return;
    }
    if (f.password !== f.password_confirmation) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", f.name);
      formData.append("business_name", f.business_name);
      formData.append("email", f.email);
      formData.append("phone", f.phone);
      formData.append("password", f.password);
      formData.append("password_confirmation", f.password_confirmation);
      if (f.logo) formData.append("logo", f.logo);
      if (f.cover_image) formData.append("cover_image", f.cover_image);

      await apiRegister(formData);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Signup failed. This email may already be taken."
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Sign up">
      <p className="text-sm text-neutral-600 mb-4">
        Sign up to setup your account
      </p>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-400 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <Field
          label="Full Name"
          value={f.name}
          onChange={(v) => setF((s) => ({ ...s, name: v }))}
          required
        />
        <Field
          label="Business Name"
          value={f.business_name}
          onChange={(v) => setF((s) => ({ ...s, business_name: v }))}
          required
        />
        <Field
          label="Email"
          type="email"
          value={f.email}
          onChange={(v) => setF((s) => ({ ...s, email: v }))}
          required
        />
        <Field
          label="Mobile Number"
          value={f.phone}
          onChange={(v) => setF((s) => ({ ...s, phone: v }))}
          required
        />
        <Field
          label="Password"
          type="password"
          value={f.password}
          onChange={(v) => setF((s) => ({ ...s, password: v }))}
          required
        />
        <Field
          label="Confirm Password"
          type="password"
          value={f.password_confirmation}
          onChange={(v) => setF((s) => ({ ...s, password_confirmation: v }))}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <UploadBox
            label="Upload Logo"
            file={f.logo}
            onChange={(file) => setF((s) => ({ ...s, logo: file }))}
          />
          <UploadBox
            label="Upload Cover Image"
            file={f.cover_image}
            onChange={(file) => setF((s) => ({ ...s, cover_image: file }))}
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-neutral-600 leading-5">
          <input
            type="checkbox"
            checked={f.agree}
            onChange={(e) =>
              setF((s) => ({ ...s, agree: e.target.checked }))
            }
          />
          <span>
            By sign up you agree to our{" "}
            <a href="/terms" className="text-orange-500 hover:underline">
              Terms of use
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-orange-500 hover:underline">
              Privacy Policy
            </a>
          </span>
        </div>

        <button className="w-full rounded-full bg-orange-500 py-2.5 text-white font-semibold hover:bg-orange-600 transition">
          Sign up
        </button>

        <div className="text-center text-sm mt-2 text-neutral-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-orange-500 hover:underline font-medium"
          >
            Login
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

function UploadBox({ label, file, onChange }) {
  const [dragging, setDragging] = useState(false);

  const validateFile = (f) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(f.type)) {
      alert("Only image files (jpg, png, gif, webp) are allowed.");
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) onChange(f);
  };

  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (f && validateFile(f)) onChange(f);
  };

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-4 text-center text-xs transition cursor-pointer 
        ${dragging ? "border-orange-400 bg-orange-50" : "border-neutral-300"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById(label).click()}
    >
      <div className="rounded-md border px-4 py-6 mb-2">
        {file ? (
          <div>
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="mx-auto h-16 object-contain"
            />
            <p className="mt-1 text-xs text-neutral-700 truncate">
              {file.name}
            </p>
          </div>
        ) : (
          "Drag & drop or click"
        )}
      </div>
      <div className="mt-1">{label}</div>
      <input
        id={label}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  );
}
