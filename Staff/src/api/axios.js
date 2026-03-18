import axios from "axios";

// 1. Pull from Environment Variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

// 2. Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response Interceptor: Auth & Data Safety
api.interceptors.response.use(
  (response) => {
    // SAFETY GATE: If the backend returns HTML (a 404/500 page) instead of JSON,
    // we throw an error here so the frontend doesn't try to .map() a string.
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("text/html")) {
      return Promise.reject(
        new Error("Backend returned HTML instead of JSON. Check your URLs."),
      );
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and boot them to login
      localStorage.clear();
      // Redirect to login only if not already there to prevent loops
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

/* ===========================
   ENDPOINTS
=========================== */

export const fetchMyArticles = () => api.get("articles/");
export const fetchMe = () => api.get("accounts/me/");

// Ads Management Endpoints
export const fetchAds = () => api.get("ads/advertisements/");
export const toggleAdStatus = (adId, isActive) =>
  api.patch(`ads/advertisements/${adId}/`, { is_active: isActive });
export const deleteAd = (adId) => api.delete(`ads/advertisements/${adId}/`);
export const createAd = (data) => api.post("ads/advertisements/", data);

export default api;
