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

// Super admin get users data
export const getAdminDashboardData = () =>
  axios.get("/api/admin/dashboard").then((r) => r.data);

//User Income
export const getAdminIncome = (userId) =>
  axios.get(`/api/admin/income/${userId}`).then((r) => r.data);

//User Expense
export const getAdminExpense = (userId) =>
  axios.get(`/api/admin/expense/${userId}`).then((r) => r.data);

//Payment Setting
export const getPaymentSettings = () =>
  axios.get("/api/admin/payment-settings").then((r) => r.data);
export const updatePaymentSettings = (payload) =>
  axios.post("/api/admin/payment-settings", payload).then((r) => r.data);

// SMS Packages
export const getSmsPackages = () =>
  axios.get("/api/admin/sms-packages").then((r) => r.data);

export const createSmsPackage = (payload) =>
  axios.post("/api/admin/sms-packages", payload).then((r) => r.data);

export const getSmsPackageById = (id) =>
  axios.get(`/api/admin/sms-packages/${id}`).then((r) => r.data);

export const updateSmsPackage = (id, payload) =>
  axios.put(`/api/admin/sms-packages/${id}`, payload).then((r) => r.data);

export const deleteSmsPackage = (id) =>
  axios.delete(`/api/admin/sms-packages/${id}`).then((r) => r.data);

// Get SMS purchase balance (for super-admin)
export const getSmsPurchaseBalance = () =>
  axios.get("/api/admin/sms-purchase-balance").then((r) => r.data);

// Subscription package
export const getSubscriptionPlans = () =>
  axios.get("/api/admin/plans").then((r) => r.data);

export const getSubscriptionPlan = (id) =>
  axios.get(`/api/admin/plans/${id}`).then((r) => r.data);

export const createSubscriptionPackage = (payload) =>
  axios.post("/api/admin/plans", payload).then((r) => r.data);

export const updateSubscriptionPackage = (id, payload) =>
  axios.put(`/api/admin/plans/${id}`, payload).then((r) => r.data);

export const deleteSubscriptionPackage = (id) =>
  axios.delete(`/api/admin/plans/${id}`).then((r) => r.data);


// List subscriptions (with user + plan info)
export const getSubscriptions = (params = {}) =>
  axios.get("/api/admin/subscriptions", { params }).then((r) => r.data);

// Cancel a subscription
export const cancelSubscription = (id) =>
  axios.post(`/api/admin/subscriptions/${id}/cancel`).then((r) => r.data);