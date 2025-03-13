import { useState, useContext } from "react";
import "../../styles/custom.css";
import path from "../../utils/path";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import jwt_decode from "jwt-decode";
import { apiLogin } from "../../apis";
import { AuthContext } from "../../context/authContext.jsx";
import icons from "../../utils/icon";
import { handleGoogleLogin, handleFacebookLogIn } from "../../utils/helper.jsx";

const { FaFacebookF, FaGoogle, FaInstagram, FaLinkedinIn, FaEye, FaEyeSlash } =
  icons;

const paths = {
  Register: path.REGISTER,
  ForgotPassword: path.FORGOT_PASSWORD,
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    await handleGoogleLogin(login, navigate);
  };

  const handleFacebookSignIn = async () => {
    await handleFacebookLogIn(login, navigate);
  };

  // Sử dụng Formik để quản lý form và validate với Yup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .test(
          "is-admin-or-valid-email",
          "Email is not in correct format.",
          // Bỏ qua validate nếu tài khoản là 'admin'
          function (value) {
            if (value === "admin") {
              return true;
            }

            return Yup.string().email().isValidSync(value);
          }
        )
        .required("Email cannot be left blank"),
      password: Yup.string()
        .min(8, "Password must be 8 characters or more")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one digit")
        .required("Password cannot be left blank")
        .trim(),
    }),

    onSubmit: (values) => {
      apiLogin({ email: values.email, password: values.password })
        .then((response) => {
          const accessToken = response.data.result.accessToken;
          localStorage.setItem("accessToken", accessToken);
          const decodedToken = jwt_decode(accessToken);

          // Kiểm tra status và activeEmail
          if (decodedToken.status !== 1 || !decodedToken.activeEmail) {
            toast.error("Account not activated or no access!");
            return;
          }

          // Lưu thông tin người dùng vào context
          login(accessToken);
          toast.success("Log in successfully!");

          // Chuyển hướng theo quyền
          if (decodedToken.scope.includes("ROLE_ADMIN")) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        })
        .catch((error) => {
          console.log("error", error);
          if (error.response.status === 400) {
            toast.error("Incorrect email or password!");
          }

          if (error.response.status === 404) {
            toast.error("Account does not exist in the system!");
          }
        });
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
              // Thêm onSubmit từ formik
              onSubmit={formik.handleSubmit}
            >
              <h1 className="font-bold text-[24px] md:text-[32px] text-center">
                Sign In
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

              {/* Input Email */}
              <div className="w-full">
                <input
                  className="bg-[#eee] outline-none px-[16px] py-[10px] w-full md:w-[300px] rounded-[8px] text-[14px] placeholder:text-[#828181] placeholder:text-[14px]"
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

              <Link
                to={paths.ForgotPassword}
                className="text-center text-[16px] text-[#333] my-2"
              >
                Forgot Your Password?
              </Link>
              <div className="text-center text-[#fff] flex flex-col gap-3 justify-center items-center">
                <button
                  type="submit"
                  className="w-[155px] text-[14px] !bg-[#512da8] bg-transparent border border-white py-[12px] rounded-[8px] font-medium"
                >
                  SIGN IN
                </button>
                <Link to={paths.Register}>
                  <button className="w-[155px] text-[14px] !bg-[#eae9eb] text-[#333] bg-transparent border border-white py-[12px] rounded-[8px] font-medium block md:hidden">
                    SIGN UP
                  </button>
                </Link>
              </div>
            </form>
          </div>

          {/* Right section (Info) */}
          <div className="w-full md:w-[50%] h-full bg-gradient-to-r from-[#5c6bc0] to-[#512da8] text-[#fff] flex flex-col gap-4 items-center justify-center rounded-none md:rounded-tl-custom-lg md:rounded-bl-custom-lg p-4 hidden md:flex">
            <h1 className="text-[24px] md:text-[32px] font-bold">
              Hello, Friend!
            </h1>
            <div className="m-4 md:m-2 font-light leading-6 text-center">
              Register with your personal details to use all of site features
            </div>
            <Link to={paths.Register}>
              <button className="w-[155px] text-[14px] bg-transparent border border-white px-8 py-[11px] rounded-[8px] font-medium">
                SIGN UP
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
