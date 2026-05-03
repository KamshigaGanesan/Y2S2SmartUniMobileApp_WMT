import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ IMPORTANT: Replace with your backend URL
const API = axios.create({
  baseURL: "http://10.162.229.224:5000/api",
});

API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;

