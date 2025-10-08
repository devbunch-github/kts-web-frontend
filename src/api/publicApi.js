import axios from "./http";

// Beauticians
export const getBeauticians = (params = {}) =>
  axios.get("/api/beauticians", { params }).then((r) => r.data);

// Contact
export const postContact = (payload) =>
  axios.post("/api/contact", payload).then((r) => r.data);

// Plans
export const getPlans = () =>
  axios.get("/api/plans").then((r) => r.data.data);

// Checkout (generic if you keep it)
export const createCheckout = (payload) =>
  axios.post("/api/checkout", payload).then((r) => r.data);

export const confirmCheckout = (payload) =>
  axios.post("/api/checkout/confirm", payload).then((r) => r.data);

// Auth
export const apiRegister = (payload) =>
  axios.post("/api/auth/register", payload).then((r) => r.data);

export const apiLogin = (payload) =>
  axios.post("/api/auth/login", payload).then((r) => r.data);



// Pre-register user before payment
export const preRegister = (payload) =>
  axios.post("/api/auth/pre-register", payload).then((r) => r.data);

// Set password after payment
export const setPassword = (payload) =>
  axios.post("/api/auth/set-password", payload).then((r) => r.data);

// Check email availability
export const checkEmail = (email) =>
  axios.post("/api/auth/check-email", { email }).then((r) => r.data);


// Stripe
export const createStripeIntent = (payload) =>
  axios.post("/api/payment/stripe/create-intent", payload).then((r) => r.data);

// PayPal
export const createPayPalOrder = (payload) =>
  axios.post("/api/payment/paypal/create-order", payload).then((r) => r.data);

export const capturePayPalOrder = (payload) =>
  axios.post("/api/payment/paypal/capture", payload).then((r) => r.data);

// Generic confirm
export const confirmPayment = (payload) =>
  axios.post("/api/payment/confirm", payload).then((r) => r.data);

