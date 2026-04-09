import axios from "axios";

const normalizeApiBaseUrl = (rawValue) => {
  const fallback = "http://localhost:5000/api";
  const input = (rawValue || "").trim();

  if (!input) {
    return fallback;
  }

  const withoutTrailingSlash = input.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const safeReadAuth = () => {
  try {
    const value = localStorage.getItem("exam-auth");
    return value ? JSON.parse(value) : null;
  } catch (error) {
    localStorage.removeItem("exam-auth");
    return null;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const auth = safeReadAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export default api;
