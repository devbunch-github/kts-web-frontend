import http from "@/api/http";

// Get all plans
export const getPlans = () => http.get("/api/plans").then((r) => r.data.data);

// Get current active subscription
export const getMySubscription = () =>
  http.get("/api/subscriptions").then((r) => r.data.data);

// Upgrade plan (new unified endpoint)
export const upgradeSubscription = (planId, userId, provider) =>
  http
    .post("/api/subscription/upgrade", {
      plan_id: planId,
      user_id: userId,
      provider, // 'stripe' or 'paypal'
    })
    .then((r) => r.data);

export const cancelSubscription = () =>
  http.post("/api/subscription/cancel").then((r) => r.data);
