// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  const isAuthenticated = !!localStorage.getItem("authToken");

  const login = (userData, token, customerId) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", token);

    if (customerId) {
      localStorage.setItem("customer_id", customerId);
    }

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("customer_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
