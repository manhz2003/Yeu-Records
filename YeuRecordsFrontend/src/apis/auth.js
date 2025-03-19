import instance from "../axios";
import axios from "axios";

// API gửi mail
export const apiVerifySendMail = (data) => {
  return instance.post("email/send-email-activate", data);
};

// API xác minh mã xác nhận
export const apiVerifyCode = (data) => {
  return instance.post("email/verify-code", data);
};

// API login
export const apiLogin = (data) => {
  return instance.post("auth/token", data);
};

// API logout
export const apiLogout = (data) => {
  return axios.post("auth/logout", {
    token: data.token,
    email: data.email,
  });
};

// API đổi mật khẩu
export const apiChangePassword = (data) => {
  return instance.put("users/change-password", data);
};

// API quên mật khẩu
export const apiForgotPassword = (data) => {
  return instance.post("email/forgot-password", data);
};

// API login với Google
export const apiLoginWithGoogle = (user) => {
  return instance.post("auth/google-login", {
    email: user.email,
    phone: user.providerData.phoneNumber,
    fullname: user.displayName,
    avatar: user.photoURL,
    activeEmail: user.emailVerified,
    oauthRefreshToken: user.refreshToken,
    oauthAccessToken: user.accessToken,
    oauthProviderId: user.providerData.providerId,
    oauthProvider: "google",
  });
};

// api login với facebook
export const apiLoginWithFacebook = (user) => {
  return instance.post("auth/facebook-login", {
    email: user.email,
    phone: user.providerData.phoneNumber,
    fullname: user.displayName,
    avatar: user.photoURL,
    activeEmail: true,
    oauthRefreshToken: user.stsTokenManager.refreshToken,
    oauthAccessToken: user.stsTokenManager.accessToken,
    oauthProviderId: user.providerData.providerId,
    oauthProvider: "facebook",
  });
};
