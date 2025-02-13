import { apiLoginWithGoogle, apiLoginWithFacebook } from "../apis/index";
import { toast } from "react-toastify";
import { signInWithPopup } from "../config/firebaseConfig.js";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

import * as XLSX from "xlsx";

// Hàm giải mã JWT
export const parseJwt = (token) => {
  if (!token) return null;

  // Tách phần payload
  const parts = token.split(".");
  if (parts.length !== 3) {
    console.error("Invalid token format");
    return null;
  }

  // Giải mã Base64Url sang Base64 chuẩn
  let payload = parts[1];
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");

  // Giải mã và trả về nội dung payload
  try {
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

// Gọi API với nhà cung cấp google hoặc facebook
const apiLoginWithProvider = async (user, provider) => {
  if (provider instanceof GoogleAuthProvider) {
    return apiLoginWithGoogle(user);
  }
  return apiLoginWithFacebook(user);
};

// hàm xử lý đăng nhập logic chung cho mạng xã hội
export const handleSocialLogin = async (provider, login, navigate) => {
  const auth = getAuth();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Gọi API với thông tin người dùng
    const response = await apiLoginWithProvider(user, provider);
    if (response.status === 200) {
      const token = response.data.result.accessToken;
      localStorage.setItem("accessToken", token);
      login(token);
      toast.success(
        `login with ${
          provider instanceof GoogleAuthProvider ? "Google" : "Facebook"
        } success!`
      );
      if (navigate) navigate("/");
    }
  } catch (error) {
    handleError(error);
  }
};

// xử lý lỗi khi login mạng xã hội
const handleError = (error) => {
  if (error.code === "auth/account-exists-with-different-credential") {
    toast.error(
      "An account already exists with the same email but different sign-in method. Please use the correct provider."
    );
    const email = error.customData.email;
    // Gợi ý cách liên kết tài khoản cho người dùng
    fetchSignInMethodsForEmail(getAuth(), email).then((methods) => {
      if (methods.length) {
        toast.info(`Please sign in using ${methods.join(", ")}.`);
      }
    });
  } else if (error.code === "auth/popup-closed-by-user") {
    toast.warn("The popup was closed before completing the sign-in.");
  } else {
    console.log("An error occurred. Please try again.");
  }
  console.log("Error during social login:", error);
};

// Đăng nhập Google
export const handleGoogleLogin = async (login, navigate) => {
  const provider = new GoogleAuthProvider();

  await handleSocialLogin(provider, login, navigate);
};

// Đăng nhập Facebook
export const handleFacebookLogIn = async (login, navigate) => {
  const provider = new FacebookAuthProvider();
  await handleSocialLogin(provider, login, navigate);
};

// export data excel
export const exportToExcel = (filteredData) => {
  // Chuyển đổi dữ liệu bảng thành mảng các đối tượng
  const dataToExport = filteredData.map((item) => ({
    "Full Name": item.fullname,
    Email: item.email,
    Address: item.address,
    Phone: item.phone,
    "OAuth Provider": item.oauthProvider,
    Facebook: item.contactFacebook,
    Instagram: item.contactInstagram,
    Telegram: item.contactTelegram,
    Spotify: item.digitalSpotify,
    "Apple Music": item.digitalAppleMusic,
    TikTok: item.digitalTiktok,
    Status: item.status,
    Online: item.statusOnline,
    Lockout: item.lockout,
    "Active Email": item.activeEmail,
    "Total Music": item.totalMusic,
    "Created At": item.createdAt,
    "Updated At": item.updatedAt,
    DOB: item.dob,
    Roles: item.roles,
  }));

  // Chuyển đổi thành worksheet
  const ws = XLSX.utils.json_to_sheet(dataToExport);

  // Tạo một workbook và add worksheet vào đó
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");

  // Xuất ra file Excel
  XLSX.writeFile(wb, "user_data.xlsx");
};
