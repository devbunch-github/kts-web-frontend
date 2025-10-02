import { http } from "./http";

// Beauticians
export const getBeauticians = (params = {}) =>
  http.get("/api/beauticians", { params }).then((r) => r.data);

// Contact
export const postContact = (payload) =>
  http.post("/api/contact", payload).then((r) => r.data);

// Plans
export const getPlans = () =>
  http.get("/api/plans").then((r) => r.data.data);

// Checkout (generic if you keep it)
export const createCheckout = (payload) =>
  http.post("/api/checkout", payload).then((r) => r.data);

export const confirmCheckout = (payload) =>
  http.post("/api/checkout/confirm", payload).then((r) => r.data);

// Auth
export const apiRegister = (payload) =>
  http.post("/api/auth/register", payload).then((r) => r.data);

export const apiLogin = (payload) =>
  http.post("/api/auth/login", payload).then((r) => r.data);



// Pre-register user before payment
export const preRegister = (payload) =>
  http.post("/api/auth/pre-register", payload).then((r) => r.data);

// Set password after payment
export const setPassword = (payload) =>
  http.post("/api/auth/set-password", payload).then((r) => r.data);

// Stripe
export const createStripeIntent = (payload) =>
  http.post("/api/payment/stripe/create-intent", payload).then((r) => r.data);

// PayPal
export const createPayPalOrder = (payload) =>
  http.post("/api/payment/paypal/create-order", payload).then((r) => r.data);

export const capturePayPalOrder = (payload) =>
  http.post("/api/payment/paypal/capture", payload).then((r) => r.data);

// Generic confirm
export const confirmPayment = (payload) =>
  http.post("/api/payment/confirm", payload).then((r) => r.data);

