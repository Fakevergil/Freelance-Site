import axios from "axios";

const api = axios.create({
  baseURL: "freelance-site-production-3b2e.up.railway.app",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers.Authorization = "Bearer " + token;
  return config;
});

export default api;
