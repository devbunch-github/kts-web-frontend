import { createContext, useContext, useState } from "react";

const PublicBusinessContext = createContext(null);

export function PublicBusinessProvider({ children }) {
  const [business, setBusiness] = useState({
    accountId: null,
    beautician: null,
    subdomain: null
  });

  return (
    <PublicBusinessContext.Provider value={{ business, setBusiness }}>
      {children}
    </PublicBusinessContext.Provider>
  );
}

export function usePublicBusiness() {
  return useContext(PublicBusinessContext);
}
