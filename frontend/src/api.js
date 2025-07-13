import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000" });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers["x-auth-token"] = token;
  return cfg;
});

export default api;
