import axios from "axios";

// Pull the base URL from Vite's environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL: BASE_URL,
});

/* ===========================
   AUTH
=========================== */

export const loginUser = (credentials) => {
  return API.post("token/", credentials);
};

export const registerUser = (data) => {
  return API.post("users/register/", data);
};

export const fetchUserProfile = (token) => {
  return API.get("users/profile/", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ===========================
   ARTICLES
=========================== */

export const fetchArticles = () => {
  return API.get("articles/?status=published");
};

// Useful if you receive a full URL from a 'next' pagination link
export const fetchByUrl = (url) => {
  return axios.get(url);
};

export const fetchByCategory = (slug, url = null) => {
  return url ? axios.get(url) : API.get(`articles/?status=published&category__slug=${slug}`);
};

export const fetchCategories = () => {
  return API.get("categories/");
};

export const fetchArticleDetail = (slug) => {
  return API.get(`articles/${slug}/`);
};

/* ===========================
   ADS
=========================== */

export const fetchAdvertisements = (placement) => {
  return API.get(`ads/advertisements/?placement=${placement}`);
};

/* ===========================
   SIDEBAR BLOCKS
=========================== */

export const fetchSidebarBlocks = () => {
  return API.get("ads/sidebar-blocks/");
};

/* ===========================
   COMMENTS
=========================== */

export const fetchComments = (articleId) => {
  return API.get(`articles/${articleId}/comments/`);
};

export const createComment = (articleId, data, token) => {
  return API.post(`articles/${articleId}/comments/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteComment = (articleId, commentId, token) => {
  return API.delete(`articles/${articleId}/comments/${commentId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ===========================
   ANALYTICS & RECOMMENDATIONS
=========================== */

export const fetchRecommendations = (token = null, excludeId = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = "articles/recommendations/";
  if (excludeId) url += `?exclude=${excludeId}`;
  return API.get(url, { headers });
};

export const fetchTrendingArticles = () => {
  return API.get("articles/trending/");
};

export const trackArticleView = (data) => {
  return API.post("analytics/article-views/", data);
};

export const trackReadingHistory = (data) => {
  return API.post("analytics/reading-history/", data);
};

export const trackAdEvent = (data) => {
  return API.post("analytics/ad-events/", data);
};