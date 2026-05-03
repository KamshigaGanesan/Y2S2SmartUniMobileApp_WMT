import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ IMPORTANT: Replace with your backend URL
const API = axios.create({
  baseURL: "https://northern-uni-smartcampus-network-system-production.up.railway.app/api"
});

API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;

