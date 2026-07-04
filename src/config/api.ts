import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "https://intellmeet-ghpj.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ Cookie automatically send hogi
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
