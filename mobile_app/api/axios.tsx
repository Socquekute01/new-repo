import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const baseURL = "http://192.168.1.32:5001/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Xóa dữ liệu cũ
        await AsyncStorage.multiRemove(["token", "user"]);

        router.replace("/auth");
      } catch (e) {
        console.error("Lỗi khi xử lý logout", e);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
