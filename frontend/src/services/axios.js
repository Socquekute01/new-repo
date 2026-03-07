import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to headers when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ redirect khi 401 VÀ là trang yêu cầu auth (cart, checkout, profile)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath === "/login" || currentPath === "/register";
      const isPublicPage =
        currentPath === "/" ||
        currentPath === "/shop" ||
        currentPath.startsWith("/product/");

      // Chỉ redirect nếu không phải auth page và không phải public page
      if (!isAuthPage && !isPublicPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
