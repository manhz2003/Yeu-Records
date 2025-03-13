import React, { useEffect, useState, useContext } from "react";
import "../../styles/custom.css";
import path from "../../utils/path";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/authContext.jsx";
import icons from "../../utils/icon";
import {
  apiCreateUser,
  apiVerifyCode,
  apiVerifySendMail,
} from "../../apis/index";
import { handleGoogleLogin, handleFacebookLogIn } from "../../utils/helper.jsx";

const paths = {
  Login: path.LOGIN,
};

const { FaFacebookF, FaGoogle, FaInstagram, FaLinkedinIn, FaEye, FaEyeSlash } =
  icons;

const Register = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    await handleGoogleLogin(login, navigate);
  };

  const handleFacebookSignIn = async () => {
    await handleFacebookLogIn(login, navigate);
  };

  // Đọc trạng thái modal từ local storage khi component được khởi tạo
  useEffect(() => {
    const modalState = localStorage.getItem("isModalOpen");
    if (modalState === "true") {
      setIsModalOpen(true);

      // Tự động đóng modal sau 24h
      const timer = setTimeout(() => {
        setIsModalOpen(false);
        localStorage.removeItem("isModalOpen");
      }, 86400000); // 24h

      // Dọn dẹp hẹn giờ khi modal bị đóng hoặc component bị hủy
      return () => clearTimeout(timer);
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name cannot be left blank"),
      email: Yup.string()
        .email("Email is not in correct format.")
        .required("Email cannot be left blank"),
      password: Yup.string()
        .min(8, "Password must be 8 characters or more")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one digit")
        .required("Password cannot be left blank")
        .trim(),
    }),
    onSubmit: async (values) => {
      try {
        const response = await apiCreateUser({
          fullname: values.name,
          email: values.email,
          password: values.password,
        });

        if (response.status === 200) {
          toast.success(
            "Registration successful, please visit email to activate account!",
            {
              autoClose: 8000,
            }
          );

          // Mở modal để nhập mã xác minh
          setIsModalOpen(true);
          localStorage.setItem("isModalOpen", "true");
          localStorage.setItem("userEmail", values.email);

          // Send verification email
          await apiVerifySendMail({ email: values.email });

          // Tự động đóng modal sau 10 giây
          const timer = setTimeout(() => {
            setIsModalOpen(false);
            localStorage.removeItem("isModalOpen");
          }, 86400000);

          // Dọn dẹp hẹn giờ
          return () => clearTimeout(timer);
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          toast.error("Email already exists, please use another email!");
        } else {
          toast.error("Registration failed!");
        }
        console.error("Error creating user:", error);
      }
    },
  });

  const handleVerifyCode = async () => {
    // Lấy email từ local storage
    const emailFromLocalStorage = localStorage.getItem("userEmail");

    try {
      const response = await apiVerifyCode({
        // Truyền email từ local storage
        email: emailFromLocalStorage,
        code: verificationCode,
      });

      if (response.status === 200) {
        toast.success("Account has been activated successfully!", {
          autoClose: 8000,
        });
        setIsModalOpen(false);
        localStorage.removeItem("isModalOpen");
        localStorage.removeItem("userEmail");
        navigate(paths.Login);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(
          "Verification code is incorrect! Please check your email again."
        );
      } else {
        toast.error("Verification failed! Please try again.");
      }
      console.error("Error verifying code:", error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff] flex justify-center w-screen h-screen items-center">
      <div className="h-[500px] w-[90%] md:w-[800px] bg-[#fff] rounded-[30px] overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-[50%] h-full flex flex-col items-center justify-center p-4 md:p-0">
            <form
              className="flex flex-col gap-5"
              onSubmit={formik.handleSubmit}
            >
              <h1 className="font-bold text-[24px] md:text-[32px] text-center">
                Create Account
              </h1>

              <div className="flex gap-2 justify-center">
                <a
                  className="custom-border group inline-flex justify-center items-center mx-1 w-10 h-10 border border-gray-300 rounded-[20%] cursor-pointer"
                  onClick={handleFacebookSignIn}
                >
                  <FaFacebookF
                    className="text-gray-800 group-hover:text-[#512da8]"
                    size="17px"
                  />
                </a>

                <a
                  className="custom-border group inline-flex justify-center items-center mx-1 w-10 h-10 border border-gray-300 rounded-[20%] cursor-pointer"
                  onClick={handleGoogleSignIn}
                >
                  <FaGoogle
                    className="text-gray-800 group-hover:text-[#512da8]"
                    size="17px"
                  />
                </a>

                <a
                  className="custom-border group inline-flex justify-center items-center mx-1 w-10 h-10 border border-gray-300 rounded-[20%] cursor-pointer"
                  onClick={() => {
                    toast("This feature will be updated soon in the future");
                  }}
                >
                  <FaInstagram
                    className="text-gray-800 group-hover:text-[#512da8]"
                    size="17px"
                  />
                </a>

                <a
                  className="custom-border group inline-flex justify-center items-center mx-1 w-10 h-10 border border-gray-300 rounded-[20%] cursor-pointer"
                  onClick={() => {
                    toast("This feature will be updated soon in the future");
                  }}
                >
                  <FaLinkedinIn
                    className="text-gray-800 group-hover:text-[#512da8]"
                    size="17px"
                  />
                </a>
              </div>

              <span className="text-center text-[14px] text-[#333]">
                or use your email for registration
              </span>

              {/* Input Name */}
              <div className="w-full">
                <input
                  className="bg-[#eee] outline-none px-[16px] py-[10px] w-full md:w-[300px] rounded-[8px] text-[14px] placeholder:text-[#828181] placeholder:text-[14px]"
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-red-500 text-sm">{formik.errors.name}</p>
                ) : null}
              </div>

              {/* Input Email */}
              <div className="w-full">
                <input
                  className="bg-[#eee] outline-none px-[16px] py-[10px] w-full md:w-[300px] rounded-[8px] text-[14px] placeholder:text-[#828181] placeholder:text-[14px]"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-red-500 text-sm">{formik.errors.email}</p>
                ) : null}
              </div>

              {/* input password */}
              <div className="relative flex flex-col items-start">
                <input
                  className="bg-[#eee] outline-none px-[16px] py-[10px] w-full md:w-[300px] rounded-[8px] text-[14px] placeholder:text-[#828181] placeholder:text-[14px]"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-red-500 text-sm mt-1">
                    {" "}
                    {formik.errors.password}
                  </p>
                ) : null}
              </div>

              <div className="text-center text-[#fff] flex flex-col justify-center items-center gap-3">
                <button
                  className="w-[155px] text-[14px] !bg-[#512da8] bg-transparent border border-white py-[12px] rounded-[8px] font-medium"
                  type="submit"
                >
                  SIGN UP
                </button>
                <Link to={paths.Login}>
                  <button className="w-[155px] text-[14px] !bg-[#eae9eb] text-[#333] bg-transparent border border-white py-[12px] rounded-[8px] font-medium block md:hidden">
                    SIGN IN
                  </button>
                </Link>
              </div>
            </form>
          </div>

          {/* Right section (Info) */}
          <div className="w-full md:w-[50%] h-full bg-gradient-to-r from-[#5c6bc0] to-[#512da8] text-[#fff] flex flex-col gap-4 items-center justify-center rounded-none md:rounded-tl-custom-lg md:rounded-bl-custom-lg p-4 hidden md:flex">
            <h1 className="text-[24px] md:text-[32px] font-bold">
              Welcome Back!
            </h1>
            <div className="m-4 md:m-2 font-light leading-6 text-center">
              Enter your personal details to use all of site features
            </div>
            <Link to={paths.Login}>
              <button className="w-[155px] text-[14px] bg-transparent border border-white px-8 py-[11px] rounded-[8px] font-medium">
                SIGN IN
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full mb-4"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                className="bg-[#512da8] text-white px-4 py-2 rounded-md"
                onClick={handleVerifyCode}
              >
                Verify
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="leading-5 text-[14px] text-[#00bc06] mt-5">
              Suggestion: please access the email address you just registered to
              get the verification code
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
