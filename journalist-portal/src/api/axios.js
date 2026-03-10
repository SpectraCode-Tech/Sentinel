import axios from "axios";

const api = axios.create({
  baseURL: "https://sentinel-ou6m.onrender.com/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchMyArticles = () => api.get("articles/");

export const fetchMe = () => api.get("accounts/me/"); // adjust if your endpoint is different

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and boot them to login
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);


// Ads Management Endpoints
export const fetchAds = () => api.get("ads/advertisements/");
export const toggleAdStatus = (adId, isActive) =>
  api.patch(`ads/advertisements/${adId}/`, { is_active: isActive });
export const deleteAd = (adId) => api.delete(`ads/advertisements/${adId}/`);
export const createAd = (data) => api.post("ads/advertisements/", data);

export default api;

