import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Read existing stored user (same key you're already using)
  const getUserFromStorage = () => {
    try {
      const stored = localStorage.getItem("user"); // ❗️ keep same key
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  };

  const [user, setUser] = useState(getUserFromStorage());

  // Login → update state + localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // ❗️ keep same key
  };

  // Logout → remove data
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // ❗️ keep same key
    localStorage.removeItem("auth_token"); // optional cleanup
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user, // ✅ added safely
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
