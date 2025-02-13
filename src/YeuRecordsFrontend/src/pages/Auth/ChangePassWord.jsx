import { useState } from "react";
import icons from "../../utils/icon";
import "../../styles/custom.css";
import path from "../../utils/path";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import { apiLogout, apiChangePassword } from "../../apis";

const { FaEye, FaEyeSlash } = icons;

const paths = {
  Home: path.HOME,
};

const ChangePassWord = () => {
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Sử dụng Formik với enableReinitialize để đảm bảo đồng bộ dữ liệu
  const formik = useFormik({
    initialValues: {
      passwordOld: "",
      passwordNew: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      passwordOld: Yup.string()
        .min(8, "Password must be 8 characters or more")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one digit")
        .required("Old password cannot be left blank")
        .trim(),
      passwordNew: Yup.string()
        .min(8, "Password must be 8 characters or more")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one digit")
        .required("New password cannot be blank")
        .trim(),
    }),
    onSubmit: async (values) => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        // Gửi request đổi mật khẩu
        const response = await apiChangePassword({
          ...values,
          userId: userInfo.userId,
        });

        if (response.status === 200) {
          toast.success("Password changed successfully!");
          const userWantsToLogout = window.confirm(
            "Do you want to log in again??"
          );

          if (userWantsToLogout) {
            try {
              const token = localStorage.getItem("accessToken");

              const logoutResponse = await apiLogout({
                email: userInfo.email,
                token: token,
              });

              if (logoutResponse.status === 204) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userInfo");
                navigate("/login");
              }
            } catch (error) {
              if (error.response?.status === 404) {
                console.log("Email not found");
              } else {
                toast.error("Logout failed!");
              }
            }
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        // Xử lý lỗi
        const accessToken = localStorage.getItem("accessToken");
        const decodedToken = jwt_decode(accessToken);

        if (error.response?.data.code === 400) {
          if (decodedToken.oauthProvider === "google") {
            toast.error("Cannot change password with Google account");
            return;
          } else if (decodedToken.oauthProvider === "facebook") {
            toast.error("Cannot change password with Google facebook account");
          } else {
            toast.error(
              error.response?.data?.message || "An error has occurred!"
            );
          }
        }
      }
    },
  });

  return (
    <div className="bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff] flex justify-center w-screen h-screen items-center">
      <div className="h-[500px] w-[90%] md:w-[800px] bg-[#fff] rounded-[30px] overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left section (Form) */}
          <div className="w-full md:w-[50%] h-full flex flex-col items-center justify-center p-4 md:p-0">
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit();
              }}
            >
              <h1 className="font-bold text-[24px] md:text-[32px] text-center">
                Change Password
              </h1>

              <span className="text-center text-[14px] text-[#333]">
                Enter information to change your password
              </span>

              {/* Input Old Password */}
              <div className="relative flex flex-col items-start">
                <input
                  className="bg-[#eee] outline-none px-[16px] py-[10px] w-full md:w-[300px] rounded-[8px] text-[14px] placeholder:text-[#828181] placeholder:text-[14px]"
                  type={showOldPassword ? "text" : "password"}
                  name="passwordOld"
                  placeholder="Password old"
                  value={formik.values.passwordOld}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
                {formik.touched.passwordOld && formik.errors.passwordOld ? (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.passwordOld}
                  </p>
                ) : null}
              </div>

              {/* Input New Password */}
              <div className="relative flex flex-col items-start">
                <input
                  className="bg-[#eee] outline-none px-[16px] py-[10px] w-full md:w-[300px] rounded-[8px] text-[14px] placeholder:text-[#828181] placeholder:text-[14px]"
                  type={showNewPassword ? "text" : "password"}
                  name="passwordNew"
                  placeholder="Password new"
                  value={formik.values.passwordNew}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
                {formik.touched.passwordNew && formik.errors.passwordNew ? (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.passwordNew}
                  </p>
                ) : null}
              </div>

              <div className="text-center text-[#fff] flex flex-col gap-3 justify-center items-center">
                <button
                  type="submit"
                  className="w-[155px] text-[14px] !bg-[#512da8] bg-transparent border border-white py-[12px] rounded-[8px] font-medium"
                >
                  CHANGE
                </button>

                <Link to={paths.Home}>
                  <button className="w-[155px] text-[14px] !bg-[#eae9eb] text-[#333] bg-transparent border border-white py-[12px] rounded-[8px] font-medium block md:hidden">
                    HOME
                  </button>
                </Link>
              </div>
            </form>
          </div>

          {/* Right section (Info) */}
          <div className="w-full md:w-[50%] h-full bg-gradient-to-r from-[#5c6bc0] to-[#512da8] text-[#fff] flex flex-col gap-4 items-center justify-center rounded-none md:rounded-tl-custom-lg md:rounded-bl-custom-lg p-4 hidden md:flex">
            <h1 className="text-[24px] md:text-[32px] font-bold">
              Welcome to music !
            </h1>
            <div className="m-4 md:m-2 font-light leading-6 text-center">
              Click below if you want to return to the home page now
            </div>
            <Link to={paths.Home}>
              <button className="text-[14px] bg-transparent border border-white px-8 md:px-12 py-[11px] rounded-[8px] font-medium">
                HOME
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassWord;
