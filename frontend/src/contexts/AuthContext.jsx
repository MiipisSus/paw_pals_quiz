import { createContext, useContext, useState, useEffect } from "react";
import { tokenManager } from "../services/apiService.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 檢查初始認證狀態
    const checkAuthStatus = () => {
      const hasTokens = tokenManager.isAuthenticated();
      setIsAuthenticated(hasTokens);
      setIsLoading(false);
    };

    checkAuthStatus();

    // 監聽 token 過期事件
    const handleTokenExpired = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, []);

  const login = (accessToken, refreshToken) => {
    tokenManager.setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenManager.clearAllTokens();
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
