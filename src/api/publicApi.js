import { http } from "./http";

export const getBeauticians = (params={}) => http.get("/api/beauticians",{params}).then(r=>r.data);
export const postContact     = (payload) => http.post("/api/contact", payload).then(r=>r.data);
export const getPlans        = () => http.get("/api/plans").then(r=>r.data.data);
export const createCheckout  = (payload) => http.post("/api/checkout", payload).then(r=>r.data);
export const confirmCheckout = (payload) => http.post("/api/checkout/confirm", payload).then(r=>r.data);
export const apiRegister     = (payload) => http.post("/api/auth/register", payload).then(r=>r.data);
export const apiLogin        = (payload) => http.post("/api/auth/login", payload).then(r=>r.data);
