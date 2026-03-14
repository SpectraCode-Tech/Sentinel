import axios from "axios";

const API = axios.create({
  baseURL: "https://sentinel-ou6m.onrender.com/api/",
});

/* ===========================
   AUTH
=========================== */

export const loginUser = (credentials) => {
  return API.post("token/", credentials);
};

export const registerUser = (data) => {
  return axios.post(`${API.defaults.baseURL}users/register/`, data);
};

export const fetchUserProfile = (token) => {
  return axios.get(`${API.defaults.baseURL}users/profile/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ===========================
   ARTICLES
=========================== */

export const fetchArticles = () => {
  return API.get("articles/?status=published");
};

export const fetchByUrl = (url) => {
  return axios.get(url);
};

export const fetchByCategory = (slug, url = null) => {
  return axios.get(
    url || `${API.defaults.baseURL}articles/?status=published&category__slug=${slug}`
  );
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
  return API.get("/ads/sidebar-blocks/");
};

/* ===========================
   COMMENTS
=========================== */

export const fetchComments = (articleId) => {
  return API.get(`articles/${articleId}/comments/`);
};

export const createComment = (articleId, data, token) => {
  return axios.post(
    `${API.defaults.baseURL}articles/${articleId}/comments/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteComment = (articleId, commentId, token) => {
  // Combine articleId and commentId into URL
  const url = `${API.defaults.baseURL}articles/${articleId}/comments/${commentId}/`;
  return API.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchRecommendations = (token = null, excludeId = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = "articles/recommendations/";
  if (excludeId) url += `?exclude=${excludeId}`;

  return API.get(url, { headers });
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