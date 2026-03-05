import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

/* ===========================
   ARTICLES
=========================== */

export const fetchArticles = () => {
  return API.get("articles/articles/?status=published");
};

export const fetchByUrl = (url) => {
  return axios.get(url);
};

export const fetchByCategory = (slug, url = null) => {
  return axios.get(
    url || `http://127.0.0.1:8000/api/articles/articles/?status=published&category__slug=${slug}`
  );
};

export const fetchCategories = () => {
  return API.get("articles/categories/");
};

export const fetchArticleDetail = (slug) => {
  return API.get(`articles/articles/${slug}/`);
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