import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // your DRF backend
});

export const fetchArticles = (params = {}) => API.get("/articles/", { params });
export const fetchTrending = () => API.get("/articles/trending/");
export const fetchPopular = () => API.get("/articles/popular/");
export const fetchArticleDetail = (id) => API.get(`/articles/${id}/`);
export const fetchAdvertisements = () => API.get("/ads/advertisements/");
export const fetchSidebarBlocks = () => API.get("/ads/sidebar-blocks/");
export const fetchCategories = () => axios.get("/articles/categories/");


