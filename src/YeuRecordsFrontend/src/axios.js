import axios from "axios";
import { parseJwt } from "./utils/helper";
import { toast } from "react-toastify";

// Khởi tạo instance
const instance = axios.create({
  baseURL: "http://localhost:8099/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Trạng thái để quản lý việc làm mới token
let refreshPromise = null;

// Trạng thái để kiểm soát thông báo và chuyển hướng
let isRedirecting = false;

// Hàm làm mới token
const refreshToken = async () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return Promise.reject("No access token available");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post("http://localhost:8099/auth/refresh", { token: accessToken })
      .then((response) => {
        const newToken = response.data.result.accessToken;
        localStorage.setItem("accessToken", newToken);
        refreshPromise = null;
        return newToken;
      })
      .catch((error) => {
        refreshPromise = null;
        throw error;
      });
  }

  return refreshPromise;
};

// Request interceptor
instance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      const decoded = parseJwt(accessToken);
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();

      // Nếu token sắp hết hạn, làm mới
      if (expiryTime - currentTime < 5 * 60 * 1000) {
        try {
          const newToken = await refreshToken();
          config.headers["Authorization"] = `Bearer ${newToken}`;
        } catch (error) {
          console.error("Failed to refresh token:", error);

          // Xóa thông tin người dùng
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userInfo");

          // Chỉ thông báo và chuyển hướng nếu chưa thực hiện trước đó
          if (!isRedirecting) {
            isRedirecting = true;
            toast.error("Your session has expired, please log in again.!");
            setTimeout(() => {
              window.location.href = "/login";
            }, 500);
          }

          throw error;
        }
      } else {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Biến kiểm soát việc hiển thị toast
let isToastDisplayed = false;

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 403 (Forbidden)
    if (error.response && error.response.status === 403) {
      toast.error("Access not allowed.");
    }

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Xóa thông tin người dùng
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");

      // Chỉ thông báo và chuyển hướng nếu chưa thực hiện trước đó
      if (!isRedirecting) {
        isRedirecting = true;
        toast.error("Your session has expired, please log in again.!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return;
      }
    }

    // Kiểm tra lỗi mạng (lỗi kết nối)
    if (error.code === "ERR_NETWORK" && !isToastDisplayed) {
      // Đánh dấu rằng đã hiển thị thông báo
      isToastDisplayed = true;
      toast.error("An error occurred, please try again!");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default instance;
