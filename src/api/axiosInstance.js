
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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem('authToken'); 
    
      
      window.location.href = '/#/login';

      return Promise.reject(error);
    }

    return Promise.reject(error); 
  }
);


export default axiosInstance;
