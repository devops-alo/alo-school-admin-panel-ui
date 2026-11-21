
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://api.alosodt.com/api'
    // baseURL:"https://alo-school-api-g6kt.onrender.com/api"
  // baseURL: 'https://dev.alosodt.com/api'
    // baseURL: 'https://zl3xj9q0-5000.inc1.devtunnels.ms/api'
  
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("authToken");

    const userId =
      sessionStorage.getItem("userId") ||
      localStorage.getItem("userId");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (userId) {
      config.headers.userid = userId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Login data saved by the Login page (both storages)
const AUTH_KEYS = ["authToken", "userId", "username", "userRole", "permissions"];

// Read by the Login page to say why the user was signed out
export const SESSION_EXPIRED_FLAG = "sessionExpired";

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = the login token expired or is invalid (wrong email/password is a
    // 400, so the login form's own errors never come here)
    if (error.response && error.response.status === 401) {
      // Already on the login screen: leftover requests, nothing more to do
      if (window.location.hash.startsWith("#/login")) {
        return Promise.reject(error);
      }

      AUTH_KEYS.forEach((key) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
      sessionStorage.setItem(SESSION_EXPIRED_FLAG, "1");

      // Full reload onto the login page resets the app's signed-in state
      window.location.replace("/#/login");
      window.location.reload();

      // The page is reloading: keep the caller from showing the raw API error
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
