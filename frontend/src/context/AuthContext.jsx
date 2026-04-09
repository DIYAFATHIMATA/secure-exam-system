import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);
const AUTH_KEY = "exam-auth";
const readStoredAuth = () => {
  try {
    const value = localStorage.getItem(AUTH_KEY);
    return value ? JSON.parse(value) : { token: "", user: null };
  } catch (error) {
    localStorage.removeItem(AUTH_KEY);
    return { token: "", user: null };
  }
};

const parseApiError = (error, fallbackMessage) => {
  return error?.response?.data?.message || fallbackMessage;
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const persistAuth = (data) => {
    const nextAuth = { token: data.token, user: data.user };
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  };

  const login = async (payload) => {
    try {
      const response = await api.post("/auth/login", payload);
      persistAuth(response.data);
      return response.data.user;
    } catch (error) {
      throw new Error(parseApiError(error, "Invalid email or password"));
    }
  };

  const register = async (payload) => {
    try {
      const response = await api.post("/auth/register", payload);
      persistAuth(response.data);
      return response.data.user;
    } catch (error) {
      throw new Error(parseApiError(error, "Registration failed"));
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuth({ token: "", user: null });
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!auth?.token) {
        setLoadingAuth(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        persistAuth({ token: auth.token, user: response.data });
      } catch (error) {
        logout();
      } finally {
        setLoadingAuth(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      loadingAuth,
      isAuthenticated: Boolean(auth.token && auth.user),
      login,
      register,
      logout,
    }),
    [auth, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
