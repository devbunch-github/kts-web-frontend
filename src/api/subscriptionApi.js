import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Get plan by ID
 */
export async function getPlanById(planId) {
  const res = await axios.get(`${API_BASE}/api/plans/${planId}`);
  return res.data.data || res.data;
}

/**
 * Stripe Subscription — ✅ correct endpoint
 */
export async function createStripeSession(payload) {
  const res = await axios.post(`${API_BASE}/api/subscription/stripe`, payload);
  return res.data;
}

/**
 * PayPal Subscription — ✅ correct endpoint
 */
export async function createPaypalOrder(payload) {
  const res = await axios.post(`${API_BASE}/api/subscription/paypal`, payload);
  return res.data;
}
