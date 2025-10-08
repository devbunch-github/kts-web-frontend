import { useState } from "react";
import axios from "axios";

export default function ContactPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_code: "UK",
    phone: "",
    message: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: null, message: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, message: "" });
    setErrors({});

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, form);
      if (res.data?.ok) {
        setStatus({ loading: false, success: true, message: res.data.message });
        // Reset form
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          phone_code: "UK",
          phone: "",
          message: "",
          agree: false,
        });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, message: "Please correct the errors below." });
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setErrors({});
      }
    }
  };

  return (
    <div className="bg-white text-[#1b1b1b] min-h-screen">
      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative h-[420px] w-full overflow-hidden">
        <img
          src="/images/hero-2.png"
          alt="Contact banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <h1 className="text-[36px] font-semibold tracking-tight">Contact Us</h1>
        </div>
      </section>

      {/* ─── Contact Form Section ───────────────────── */}
      <section className="mx-auto max-w-[640px] px-4 py-20 text-center">
        <p className="text-[15px] text-[#b97979] font-medium">Contact us</p>
        <h2 className="mt-1 text-[28px] font-semibold text-[#1b1b1b]">Get in touch</h2>
        <p className="mt-3 text-[15px] text-[#6b6b6b]">
          We’d love to hear from you. Please fill out this form.
        </p>

        {/* Status message */}
        {status.message && (
          <div
            className={`mt-6 mb-6 rounded-md px-4 py-3 text-[14px] ${
              status.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
          {/* Name fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#444]">
                First name *
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First name"
                className={`w-full rounded-md border ${
                  errors.first_name ? "border-rose-400" : "border-[#d9d9d9]"
                } px-4 py-2.5 text-[15px] focus:border-[#c98383] focus:ring-0`}
              />
              {errors.first_name && (
                <p className="mt-1 text-[13px] text-rose-600">{errors.first_name[0]}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-[#444]">
                Last name
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last name"
                className={`w-full rounded-md border ${
                  errors.last_name ? "border-rose-400" : "border-[#d9d9d9]"
                } px-4 py-2.5 text-[15px] focus:border-[#c98383] focus:ring-0`}
              />
              {errors.last_name && (
                <p className="mt-1 text-[13px] text-rose-600">{errors.last_name[0]}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#444]">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full rounded-md border ${
                errors.email ? "border-rose-400" : "border-[#d9d9d9]"
              } px-4 py-2.5 text-[15px] focus:border-[#c98383] focus:ring-0`}
            />
            {errors.email && <p className="mt-1 text-[13px] text-rose-600">{errors.email[0]}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#444]">
              Phone number
            </label>
            <div
              className={`flex items-center rounded-md border ${
                errors.phone ? "border-rose-400" : "border-[#d9d9d9]"
              } overflow-hidden`}
            >
              <select
                name="phone_code"
                value={form.phone_code}
                onChange={handleChange}
                className="h-[45px] border-none bg-transparent pl-4 pr-2 text-[15px] text-[#444] focus:outline-none focus:ring-0"
              >
                <option>UK</option>
                <option>US</option>
                <option>CA</option>
              </select>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+44 (555) 000-0000"
                className="w-full border-none bg-transparent px-3 py-2.5 text-[15px] focus:outline-none focus:ring-0"
              />
            </div>
            {errors.phone && <p className="mt-1 text-[13px] text-rose-600">{errors.phone[0]}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#444]">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="4"
              className={`w-full rounded-md border ${
                errors.message ? "border-rose-400" : "border-[#d9d9d9]"
              } px-4 py-2.5 text-[15px] focus:border-[#c98383] focus:ring-0`}
            />
            {errors.message && (
              <p className="mt-1 text-[13px] text-rose-600">{errors.message[0]}</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 text-[14px] text-[#6b6b6b] leading-snug">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              className="mt-[3px] h-[16px] w-[16px] accent-[#c98383]"
            />
            <span>
              Do you agree to our{" "}
              <a href="#" className="text-[#c98383] underline hover:text-[#b97474]">
                Terms of use
              </a>{" "}
              and our{" "}
              <a href="#" className="text-[#c98383] underline hover:text-[#b97474]">
                Privacy Policy
              </a>
              ?
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={status.loading}
            className={`mt-2 w-full rounded-md py-3 text-[15px] font-medium text-white transition-all ${
              status.loading
                ? "bg-[#c98383]/70 cursor-not-allowed"
                : "bg-[#c98383] hover:bg-[#b97474] active:scale-[0.98]"
            }`}
          >
            {status.loading ? "Sending..." : "Send message"}
          </button>
        </form>
      </section>
    </div>
  );
}
